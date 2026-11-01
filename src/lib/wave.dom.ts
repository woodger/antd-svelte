import { getWaveColor } from './wave.engine';
import type { WaveConfig, WaveEffectInfo, WaveTriggerType } from './wave.types';

function isVisible(target: EventTarget | null): target is Element {
  if (!(target instanceof Element)) return false;
  if ('offsetParent' in target && target.offsetParent) return true;
  if (target instanceof SVGGraphicsElement) {
    const { width, height } = target.getBBox();
    if (width || height) return true;
  }
  const { width, height } = target.getBoundingClientRect();

  return !!(width || height);
}

function createWaveEffect(target: HTMLElement, info: WaveEffectInfo, onEnd: () => void) {
  // Custom showEffect вызывается и при uncheck; этот фильтр принадлежит только default effect.
  if (info.component === 'Checkbox' && !target.querySelector('input')?.checked) return;

  const holder = target.ownerDocument.createElement('div');
  Object.assign(holder.style, { position: 'absolute', left: '0px', top: '0px' });
  target.insertBefore(holder, target.firstChild);

  let wave: HTMLDivElement | undefined;
  let frame: number;
  let deadline: ReturnType<typeof setTimeout> | undefined;
  let active = false;
  let destroyed = false;
  const number = (value: string) => Number.parseFloat(value) || 0;

  function syncPosition() {
    if (!wave) return;

    const style = getComputedStyle(target);
    const color = getWaveColor(style, info.colorSource);
    const isStatic = style.position === 'static';
    Object.assign(wave.style, {
      left: `${isStatic ? target.offsetLeft : -number(style.borderLeftWidth)}px`,
      top: `${isStatic ? target.offsetTop : -number(style.borderTopWidth)}px`,
      width: `${target.offsetWidth}px`,
      height: `${target.offsetHeight}px`,
      borderRadius: [style.borderTopLeftRadius, style.borderTopRightRadius,
        style.borderBottomRightRadius, style.borderBottomLeftRadius]
        .map(value => `${number(value)}px`).join(' ')
    });
    if (color) wave.style.setProperty('--ant-wave-color', color);
    else wave.style.removeProperty('--ant-wave-color');
  }

  function destroy() {
    if (destroyed) return;

    destroyed = true;
    cancelAnimationFrame(frame);
    clearTimeout(deadline);
    observer?.disconnect();
    wave?.removeEventListener('transitionend', handleEnd);
    holder.remove();
    onEnd();
  }

  function handleEnd(event: TransitionEvent) {
    if (active && event.target === wave && event.propertyName === 'opacity') destroy();
  }

  const observer = typeof ResizeObserver === 'undefined' ? undefined
    : new ResizeObserver(syncPosition);
  observer?.observe(target);
  frame = requestAnimationFrame(() => {
    wave = target.ownerDocument.createElement('div');
    wave.className = `${info.className} wave-motion-appear wave-motion-appear-start wave-motion`;
    if ((info.component === 'Checkbox' || info.component === 'Radio')
      && target.classList.contains('ant-wave-target')) wave.classList.add('wave-quick');
    holder.append(wave);
    syncPosition();
    wave.addEventListener('transitionend', handleEnd);

    // rc-motion отделяет start от active двумя RAF; opacity завершает эффект, box-shadow — нет.
    frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => {
        if (!wave) return;

        active = true;
        wave.classList.remove('wave-motion-appear-start');
        wave.classList.add('wave-motion-appear-active');
        deadline = setTimeout(destroy, 5000);
      });
    });
  });

  return destroy;
}

/** Capture listener и один отложенный эффект; destroy отменяет RAF, timers и observers. */
export function connectWave(
  node: HTMLElement,
  getOptions: () => {
    config?: WaveConfig;
    info: Omit<WaveEffectInfo, 'event'>;
  }
) {
  let frame: number | undefined;
  let destroyed = false;
  const effects = new Set<() => void>();

  function handleTrigger(event: Event) {
    if (!isVisible(event.target) || node.getAttribute('disabled')
      || 'disabled' in node && node.disabled
      || node.className.includes('disabled') && !node.className.includes('disabled:')
      || node.getAttribute('aria-disabled') === 'true' || node.className.includes('-leave')) return;

    if (frame !== undefined) cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      frame = undefined;
      if (destroyed) return;

      const { config, info } = getOptions();
      if (config?.disabled) return;

      const target = node.querySelector<HTMLElement>('.ant-wave-target') ?? node;
      const details: WaveEffectInfo = { ...info, event: event as MouseEvent };
      const showEffect = config?.showEffect;
      if (showEffect) showEffect(target, details);
      else {
        const cleanup = createWaveEffect(target, details, () => {
          if (cleanup) effects.delete(cleanup);
        });
        if (cleanup) effects.add(cleanup);
      }
    });
  }

  return {
    listen(disabled: boolean, trigger?: WaveTriggerType) {
      if (disabled) return;

      const eventName = trigger && ['click', 'pointerdown', 'pointerup', 'mousedown', 'mouseup']
        .includes(trigger) ? trigger : 'click';
      node.addEventListener(eventName, handleTrigger, true);

      return () => node.removeEventListener(eventName, handleTrigger, true);
    },
    destroy() {
      destroyed = true;
      if (frame !== undefined) cancelAnimationFrame(frame);
      for (const cleanup of effects) cleanup();
      effects.clear();
    }
  };
}

/** Opaque Tag snippet не раскрывает children.type; наблюдаем единственный прямой anchor. */
export function connectWaveLink(node: HTMLElement, onChange: (hasLink: boolean) => void) {
  const content = node.querySelector('.ant-tag-content');
  function sync() {
    const children = Array.from(content?.childNodes ?? [])
      .filter(child => child.nodeType === 1 || child.nodeType === 3 && child.textContent?.trim());
    onChange(children.length === 1 && children[0] instanceof HTMLAnchorElement);
  }

  sync();
  if (!content) return;

  const observer = new MutationObserver(sync);
  observer.observe(content, { childList: true, characterData: true, subtree: true });

  return () => observer.disconnect();
}
