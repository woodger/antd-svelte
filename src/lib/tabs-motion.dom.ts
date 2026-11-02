import { getTabsMotionClassName } from './tabs-motion.engine';
import type { TabsMotionEvent, TabsPaneMotion } from './tabs-motion.types';

type MotionStatus = 'appear' | 'enter' | 'leave';
type MotionStep = 'prepare' | 'start' | 'active';

export interface TabsPaneMotionState {
  running: boolean;
  className?: string;
  style?: string;
}

/** CSSMotion phases без React: собственные end events, два RAF и отмена stale prepare/deadline. */
export function createTabsPaneMotion(
  node: HTMLDivElement,
  publish: (state: TabsPaneMotionState, commit?: boolean) => void
) {
  const view = node.ownerDocument.defaultView!;
  const reduced = view.matchMedia('(prefers-reduced-motion: reduce)');
  let config: TabsPaneMotion | undefined;
  let enabled = true;
  let previous: boolean | undefined;
  let visible = false;
  let seenVisible = false;
  let notified = false;
  let status: MotionStatus | undefined;
  let step: MotionStep | undefined;
  let style: string | undefined;
  let frame: number | undefined;
  let deadline: number | undefined;
  let visibleTimer: number | undefined;
  let revision = 0;
  let active = true;

  const handlers = () => {
    const prefix = status === 'appear' ? 'Appear' : status === 'enter' ? 'Enter' : 'Leave';
    return {
      prepare: config?.[`on${prefix}Prepare`],
      start: config?.[`on${prefix}Start`],
      active: config?.[`on${prefix}Active`],
      end: config?.[`on${prefix}End`]
    };
  };
  const supported = () => !!config?.motionName && enabled && !reduced.matches;
  const allowed = () => config?.[status === 'appear' ? 'motionAppear'
    : status === 'enter' ? 'motionEnter' : 'motionLeave'] !== false;

  function cancel() {
    revision++;
    if (frame !== undefined) view.cancelAnimationFrame(frame);
    if (deadline !== undefined) view.clearTimeout(deadline);
    if (visibleTimer !== undefined) view.clearTimeout(visibleTimer);
    frame = undefined;
    deadline = undefined;
    visibleTimer = undefined;
  }

  function update(commit = false) {
    publish(
      {
        running: status !== undefined,
        className: status && step ? getTabsMotionClassName(config?.motionName, status, step) : undefined,
        style
      },
      commit
    );
  }

  function finish(passive = false) {
    cancel();
    status = undefined;
    step = undefined;
    style = undefined;
    update();
    if ((seenVisible || notified) && config?.onVisibleChanged) {
      const current = revision;
      const notify = () => {
        visibleTimer = undefined;
        if (active && current === revision) config?.onVisibleChanged?.(visible);
      };
      // CSS end callbacks завершаются до passive notification; без motion хватит DOM commit.
      if (passive) visibleTimer = view.setTimeout(notify, 0);
      else queueMicrotask(notify);
    }
    notified = true;
  }

  function nextFrame(callback: () => void) {
    const current = revision;
    frame = view.requestAnimationFrame(() => {
      if (!active || current !== revision) return;
      frame = view.requestAnimationFrame(() => {
        frame = undefined;
        if (active && current === revision) callback();
      });
    });
  }

  function handleEnd(event: TabsMotionEvent) {
    if (!active || !status || step !== 'active') return;
    if ('target' in event && event.target !== node) return;
    const current = revision;
    const result = handlers().end?.(node, event);
    if (active && current === revision && result !== false) finish(true);
  }

  function start() {
    if (!supported()) {
      finish();
      return;
    }
    update();
    const current = revision;
    // Сначала commit обоих panel slots и notifications без motion, затем layout start hooks.
    queueMicrotask(() => {
      if (!active || current !== revision) return;
      queueMicrotask(() => {
        if (!active || current !== revision) return;
        // React успевает commit prepare даже при пропущенном prepare hook.
        step = 'prepare';
        update(true);
        if (!active || current !== revision) return;
        step = 'start';
        const result = handlers().start?.(node, null);
        if (!active || current !== revision) return;
        style = handlers().prepare
          ? ['transition:none', result].filter(Boolean).join(';') : result || undefined;
        update(true);
        if (!active || current !== revision) return;
        nextFrame(() => {
          step = 'active';
          style = handlers().active?.(node, null) || undefined;
          if (!active || current !== revision) return;
          update();
          if (config?.motionDeadline && config.motionDeadline > 0) {
            deadline = view.setTimeout(() => {
              deadline = undefined;
              if (active && current === revision) handleEnd({ deadline: true });
            }, config.motionDeadline);
          }
        });
      });
    });
  }

  function reduce() {
    if (reduced.matches && status && step !== 'prepare') finish();
  }

  node.addEventListener('transitionend', handleEnd);
  node.addEventListener('animationend', handleEnd);
  reduced.addEventListener('change', reduce);

  return {
    sync(next: boolean, options: TabsPaneMotion | undefined, motionEnabled: boolean) {
      if (!active) return;
      config = options;
      enabled = motionEnabled;
      seenVisible ||= next;

      if (previous === next) {
        if (status && (!allowed() || !supported() && step !== 'prepare')) finish();
        else if (status) update();
        return;
      }
      const first = previous === undefined;
      previous = next;
      visible = next;
      cancel();
      status = next ? first ? 'appear' : 'enter'
        : !first || config?.motionLeaveImmediately ? 'leave' : undefined;
      step = undefined;
      style = undefined;
      if (!status || !allowed() || !supported() && !handlers().prepare) {
        finish();
        return;
      }
      const prepare = handlers().prepare;
      if (prepare) {
        step = 'prepare';
        update();
        const current = revision;
        queueMicrotask(() => {
          if (!active || current !== revision) return;
          update(true);
          if (!active || current !== revision) return;
          const result = prepare(node);
          if (!active || current !== revision) return;
          nextFrame(() => {
            void Promise.resolve(result).then(() => {
              if (active && current === revision) start();
            });
          });
        });
      } else start();
    },
    destroy() {
      active = false;
      cancel();
      node.removeEventListener('transitionend', handleEnd);
      node.removeEventListener('animationend', handleEnd);
      reduced.removeEventListener('change', reduce);
    }
  };
}
