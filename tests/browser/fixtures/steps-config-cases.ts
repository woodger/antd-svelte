import type {
  StepsConfig, StepsDataItem, StepsProps, StepsSemanticSlots, TimelineConfig
} from 'antd-svelte';

interface StepsConfigDescriptor {
  className?: string;
  rootClassName?: string;
  style?: Readonly<Record<string, string | number>>;
  classNames?: StepsSemanticSlots;
  styles?: Partial<Record<keyof StepsSemanticSlots, Readonly<Record<string, string | number>>>>;
}

export interface StepsConfigSample {
  id: string;
  direction: 'ltr' | 'rtl';
  context?: StepsConfigDescriptor;
  local?: StepsConfigDescriptor;
  inner?: StepsConfigDescriptor;
  contextCallback?: boolean;
  localCallback?: boolean;
  itemStyles?: boolean;
  current?: number;
  kind?: 'timeline';
  type?: StepsProps['type'];
  timeline?: StepsConfigDescriptor;
  orientation?: StepsProps['orientation'];
}

const parts = ['root', 'item', 'itemWrapper', 'itemIcon', 'itemSection', 'itemHeader',
  'itemTitle', 'itemSubtitle', 'itemContent', 'itemRail'] as const;

function css(style?: Readonly<Record<string, string | number>>) {
  if (!style) return;
  return Object.entries(style).map(([key, value]) => {
    const property = key.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
    const unit = typeof value === 'number' && key !== 'fontWeight' ? 'px' : '';
    return `${property}:${value}${unit}`;
  }).join(';');
}

function styles(descriptor?: StepsConfigDescriptor['styles']): StepsSemanticSlots {
  return Object.fromEntries(Object.entries(descriptor ?? {}).map(([key, value]) => [key, css(value)]));
}

function classes(prefix: string): StepsSemanticSlots {
  return Object.fromEntries(parts.map(key => [key, `${prefix}-${key}`]));
}

export function stepsConfigRecord(descriptor?: StepsConfigDescriptor): StepsConfig | undefined {
  if (!descriptor) return;
  return { class: descriptor.className, style: css(descriptor.style),
    classNames: descriptor.classNames, styles: styles(descriptor.styles) };
}

export function stepsContextConfig(sample: StepsConfigSample): StepsConfig {
  const context = stepsConfigRecord(sample.context) ?? {};
  if (!sample.contextCallback) return context;

  if (sample.kind === 'timeline') {
    // Source InternalContext не должен даже вызывать исключённые Steps semantics.
    const forbidden = () => { throw Error('Timeline invoked Steps semantics'); };
    return { ...context, classNames: forbidden, styles: forbidden };
  }

  return {
    ...context,
    classNames: ({ props }) => classes(
      `ctx-state-${props.type ?? 'default'}-${props.orientation}-${props.current}-${props.items?.length ?? 0}`
    ),
    styles: ({ props }) => ({
      root: css({ borderTopWidth: props.orientation === 'horizontal' ? 5 : 3, borderTopStyle: 'solid' }),
      itemContent: css({ color: props.current === 1 ? '#012345' : '#543210' })
    })
  };
}

export function stepsLocalProps(sample: StepsConfigSample): Partial<StepsProps> {
  const props: Partial<StepsProps> = {
    ...stepsConfigRecord(sample.local), rootClassName: sample.local?.rootClassName,
    type: sample.type, orientation: sample.orientation, current: sample.current
  };
  if (!sample.localCallback) return props;

  return {
    ...props,
    classNames: ({ props }) => classes(
      `local-state-${props.type ?? 'default'}-${props.orientation}-${props.current}`
    ),
    styles: ({ props }) => ({ itemTitle: css({ color: props.current === 1 ? '#112233' : '#332211' }) })
  };
}

export function stepsConfigItems(sample: StepsConfigSample): readonly StepsDataItem[] {
  return [
    { key: 'a', title: 'First', subTitle: sample.kind === 'timeline' ? undefined : 'Sub A', content: 'Content A',
      ...(sample.itemStyles ? {
        classNames: { content: 'item-local-content' },
        styles: { content: 'color:#001122', title: 'font-weight:700' }
      } : {}) },
    { key: 'b', title: 'Second', content: 'Content B' }
  ];
}

export function stepsTimelineConfig(sample: StepsConfigSample): TimelineConfig | undefined {
  const descriptor = sample.timeline;
  if (!descriptor) return;

  return {
    class: descriptor.className,
    style: css(descriptor.style),
    classNames: descriptor.classNames,
    styles: styles(descriptor.styles)
  };
}
