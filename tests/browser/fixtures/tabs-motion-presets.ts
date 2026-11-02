import type {
  TabsAnimatedConfig,
  TabsMotionEvent,
  TabsPaneMotion,
  ThemeConfig
} from 'antd-svelte';

export interface TabsMotionCase {
  name: string;
  animated?: boolean | TabsAnimatedConfig;
  unsetMotion?: readonly string[];
  unsetInk?: boolean;
  eventClass?: string;
  eventColor?: string;
  paintColor?: string;
  contentClass?: string;
  contentStyle?: string;
  paneAlpha?: { className?: string; style?: string; };
  paneBeta?: { className?: string; style?: string; };
  traceHooks?: boolean;
  prepare?: boolean;
  paint?: boolean;
  motionOff?: boolean;
  duration?: string;
  force?: boolean;
  destroy?: boolean;
  rtl?: boolean;
  placement?: string;
}

export type TabsMotionTrace = {
  phase: 'visible';
  visible: boolean;
} | {
  phase: 'appear' | 'enter' | 'leave';
  step: string;
  key: string | null;
  event: string | null;
  observed: { classes: string[]; color: string; position: string; } | null;
};

export function tabsMotionSettings(
  sample: TabsMotionCase,
  record?: (event: TabsMotionTrace) => void,
  prepare?: () => void | Promise<unknown>,
  canEnd?: () => boolean
) {
  let animated = sample.animated;
  if (animated && typeof animated === 'object' && animated.tabPaneMotion) {
    const motion: TabsPaneMotion = { ...animated.tabPaneMotion };
    animated = { ...animated, tabPaneMotion: motion };
    if (sample.eventClass || sample.eventColor) motion.eventProps = {
      className: sample.eventClass,
      style: sample.eventColor ? `color:${sample.eventColor}` : undefined
    };
    for (const key of sample.unsetMotion ?? []) {
      if (key !== 'visible' && key !== 'forceRender' && key !== 'removeOnLeave')
        throw new Error(`Unknown motion override: ${key}`);
      motion[key] = undefined;
    }
    if (sample.traceHooks) {
      const color = sample.paintColor ? `;color:${sample.paintColor}` : '';
      for (const phase of ['Appear', 'Enter', 'Leave'] as const) {
        const report = (step: string, node: HTMLDivElement, event: TabsMotionEvent | null) => {
          record?.({
            phase: phase === 'Appear' ? 'appear' : phase === 'Enter' ? 'enter' : 'leave',
            step,
            key: node.dataset.tabsKey ?? null,
            event: event === null ? null : 'deadline' in event ? 'deadline' : event.type,
            observed: {
              classes: Array.from(node.classList).filter(name =>
                /^(?:ant-tabs-switch|tabs-motion-custom|deadline-pane|event-pane|p-)/.test(name)),
              color: node.ownerDocument.defaultView!.getComputedStyle(node).color,
              position: node.ownerDocument.defaultView!.getComputedStyle(node).position
            }
          });
        };
        if (sample.prepare) motion[`on${phase}Prepare`] = node => {
          report('prepare', node, null);
          return prepare?.() ?? Promise.resolve();
        };
        motion[`on${phase}Start`] = (node, event) => {
          report('start', node, event);
          return sample.paint
            ? `opacity:${phase === 'Leave' ? 1 : 0}${color}`
            : undefined;
        };
        motion[`on${phase}Active`] = (node, event) => {
          report('active', node, event);
          return sample.paint
            ? `opacity:${phase === 'Leave' ? 0 : 1};transition:opacity .24s linear${color}`
            : undefined;
        };
        motion[`on${phase}End`] = (node, event) => {
          report('end', node, event);
          return canEnd?.();
        };
      }
      motion.onVisibleChanged = visible => record?.({ phase: 'visible', visible });
    }
  }
  if (sample.unsetInk && animated && typeof animated === 'object')
    animated = { ...animated, inkBar: undefined };
  const theme: ThemeConfig = {
    cssVar: { key: 'tabs-motion-fixture' },
    token: {
      motion: !sample.motionOff,
      ...(sample.duration ? { motionDurationSlow: sample.duration } : {})
    }
  };
  return { animated, theme };
}
