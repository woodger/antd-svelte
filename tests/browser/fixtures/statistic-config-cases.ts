import type {
  StatisticConfig, StatisticProps, StatisticSemanticInfo, StatisticSemanticSlots, ThemeConfig
} from 'antd-svelte';

interface StatisticConfigDescriptor {
  className?: string;
  rootClassName?: string;
  style?: Readonly<Record<string, string | number>>;
  classNames?: StatisticSemanticSlots;
  styles?: Partial<Record<keyof StatisticSemanticSlots, Readonly<Record<string, string | number>>>>;
}

export interface StatisticConfigSample {
  id: string;
  direction: 'ltr' | 'rtl';
  context?: StatisticConfigDescriptor;
  local?: StatisticConfigDescriptor;
  inner?: StatisticConfigDescriptor;
  contextCallback?: boolean;
  localCallback?: boolean;
  omitValue?: boolean;
  loading?: boolean;
  value?: string | number;
  kind?: string;
  prefixCls?: string;
  mode?: 'countup' | 'countdown';
  theme?: Omit<ThemeConfig, 'algorithm'> & {
    algorithm?: ('defaultAlgorithm' | 'darkAlgorithm' | 'compactAlgorithm')[];
  };
}

const parts = ['root', 'header', 'title', 'content', 'value', 'prefix', 'suffix'] as const;

function css(style?: Readonly<Record<string, string | number>>) {
  if (!style) return;

  return Object.entries(style).map(([key, value]) => {
    const property = key.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
    const unit = typeof value === 'number' && key !== 'fontWeight' ? 'px' : '';
    return `${property}:${value}${unit}`;
  }).join(';');
}

function styles(descriptor?: StatisticConfigDescriptor['styles']): StatisticSemanticSlots {
  return Object.fromEntries(Object.entries(descriptor ?? {}).map(([key, value]) => [key, css(value)]));
}

function classes(prefix: string): StatisticSemanticSlots {
  return Object.fromEntries(parts.map(key => [key, `${prefix}-${key}`]));
}

export function statisticConfigRecord(descriptor?: StatisticConfigDescriptor): StatisticConfig | undefined {
  if (!descriptor) return;
  return {
    class: descriptor.className, style: css(descriptor.style),
    classNames: descriptor.classNames, styles: styles(descriptor.styles)
  };
}

export function statisticContextConfig(sample: StatisticConfigSample): StatisticConfig {
  const config = statisticConfigRecord(sample.context) ?? {};
  if (!sample.contextCallback) return config;

  return {
    ...config,
    classNames: ({ props }: StatisticSemanticInfo) => ({
      ...sample.context?.classNames,
      ...classes(`ctx-state-${props.value}-${props.loading}-${props.decimalSeparator}${props.groupSeparator}`)
    }),
    styles: ({ props }: StatisticSemanticInfo) => ({
      ...styles(sample.context?.styles),
      root: css({ ...sample.context?.styles?.root,
        borderTopWidth: props.loading ? 5 : 3, borderTopStyle: 'solid' }),
      value: css({ ...sample.context?.styles?.value, color: props.value === 0 ? '#012345' : '#543210' })
    })
  };
}

export function statisticConfigProps(sample: StatisticConfigSample): Partial<StatisticProps> {
  const props: Partial<StatisticProps> = {
    ...statisticConfigRecord(sample.local), rootClassName: sample.local?.rootClassName,
    title: 'Statistic title', prefix: '$', suffix: 'USD', loading: sample.loading,
    ...(sample.omitValue ? {} : { value: sample.value ?? 1234.5 })
  };
  if (!sample.localCallback) return props;

  return {
    ...props,
    classNames: ({ props }: StatisticSemanticInfo) =>
      classes(`local-state-${props.value}-${props.loading}`),
    styles: ({ props }: StatisticSemanticInfo) => ({
      value: css({ color: props.value === 0 ? '#112233' : '#332211' })
    })
  };
}
