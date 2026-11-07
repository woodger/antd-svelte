import type {
  SliderClassNames,
  SliderConfig,
  SliderRangeProps,
  SliderSingleProps,
  SliderStyles,
  ThemeConfig
} from 'antd-svelte';
import reference from './ant-design-slider-scalar-reference.json';

interface ScalarCase {
  name: string;
  direction?: 'ltr' | 'rtl';
  provider?: SliderConfig;
  child?: SliderConfig | null;
  callback?: boolean;
  nativeTheme?: Pick<ThemeConfig, 'mode' | 'primary' | 'compact'>;
  props: SliderSingleProps & { valueText?: boolean };
}

export const sliderScalarCases = reference.cases as ScalarCase[];

export function scalarClasses({ props }: { props: SliderSingleProps | SliderRangeProps })
  : SliderClassNames {
  return { root: `semantic-${props.range ? 'range' : 'single'}-${props.orientation === 'vertical'}`,
    handle: 'semantic-handle' };
}

export function scalarStyles({ props }: { props: SliderSingleProps | SliderRangeProps })
  : SliderStyles {
  return { rail: props.disabled ? 'height:13px' : 'height:6px',
    root: props.orientation === 'vertical' ? 'color:rgb(70,80,90)' : 'color:rgb(90,80,70)' };
}

export function scalarProvider(sample: ScalarCase): SliderConfig | undefined {
  return sample.callback ? {
    ...sample.provider, classNames: scalarClasses, styles: scalarStyles
  } : sample.provider;
}
