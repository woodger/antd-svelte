import type { TimelineConfig, TimelineItem, TimelineProps, TimelineSlots } from 'antd-svelte';

interface TimelineConfigDescriptor {
  className?: string;
  rootClassName?: string;
  style?: Readonly<Record<string, string | number>>;
  classNames?: TimelineSlots;
  styles?: Partial<Record<keyof TimelineSlots, Readonly<Record<string, string | number>>>>;
}

export interface TimelineConfigSample {
  id: string;
  direction: 'ltr' | 'rtl';
  context?: TimelineConfigDescriptor;
  local?: TimelineConfigDescriptor;
  inner?: TimelineConfigDescriptor;
  contextCallback?: boolean;
  localCallback?: boolean;
  itemStyles?: boolean;
  reverse?: boolean;
  orientation?: TimelineProps['orientation'];
  mode?: TimelineProps['mode'];
}

const parts = ['root', 'item', 'itemWrapper', 'itemIcon', 'itemSection', 'itemHeader',
  'itemTitle', 'itemContent', 'itemRail'] as const;

function css(style?: Readonly<Record<string, string | number>>) {
  if (!style) return;
  return Object.entries(style).map(([key, value]) => {
    const property = key.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
    const unit = typeof value === 'number' && key !== 'fontWeight' ? 'px' : '';
    return `${property}:${value}${unit}`;
  }).join(';');
}

function styles(descriptor?: TimelineConfigDescriptor['styles']): TimelineSlots {
  return Object.fromEntries(Object.entries(descriptor ?? {}).map(([key, value]) => [key, css(value)]));
}

function classes(prefix: string): TimelineSlots {
  return Object.fromEntries(parts.map(key => [key, `${prefix}-${key}`]));
}

export function timelineConfigRecord(descriptor?: TimelineConfigDescriptor): TimelineConfig | undefined {
  if (!descriptor) return;
  return { class: descriptor.className, style: css(descriptor.style),
    classNames: descriptor.classNames, styles: styles(descriptor.styles) };
}

export function timelineContextConfig(sample: TimelineConfigSample): TimelineConfig {
  const context = timelineConfigRecord(sample.context) ?? {};
  if (!sample.contextCallback) return context;

  return {
    ...context,
    classNames: ({ props }) => classes(
      `ctx-state-${props.mode}-${props.orientation}-${Boolean(props.reverse)}-${props.items?.length}`
    ),
    styles: ({ props }) => ({
      root: css({ borderTopWidth: props.orientation === 'horizontal' ? 5 : 3, borderTopStyle: 'solid' }),
      itemContent: css({ color: props.reverse ? '#012345' : '#543210' })
    })
  };
}

export function timelineLocalProps(sample: TimelineConfigSample): Partial<TimelineProps> {
  const props: Partial<TimelineProps> = {
    ...timelineConfigRecord(sample.local), rootClassName: sample.local?.rootClassName,
    mode: sample.mode, orientation: sample.orientation, reverse: sample.reverse
  };
  if (!sample.localCallback) return props;

  return {
    ...props,
    classNames: ({ props }) => classes(
      `local-state-${props.mode}-${props.orientation}-${Boolean(props.reverse)}`
    ),
    styles: ({ props }) => ({ itemTitle: css({ color: props.reverse ? '#112233' : '#332211' }) })
  };
}

export function timelineConfigItems(sample: TimelineConfigSample): readonly TimelineItem[] {
  return [
    { key: 'a', title: 'First', content: 'Content A', color: 'green',
      ...(sample.itemStyles ? {
        classNames: { content: 'item-local-content' },
        styles: { content: 'color:#001122', title: 'font-weight:700' }
      } : {}) },
    { key: 'b', title: 'Second', content: 'Content B' }
  ];
}
