import type { LayoutConfig, LayoutSiderProps, ThemeConfig } from 'antd-svelte';

export interface LayoutConfigDescriptor {
  className?: string;
  rootClassName?: string;
  style?: Readonly<Record<string, string | number>>;
}

export interface LayoutConfigSample {
  id: string;
  direction: 'ltr' | 'rtl';
  context?: LayoutConfigDescriptor;
  local?: LayoutConfigDescriptor;
  inner?: LayoutConfigDescriptor;
  sectionStyle?: boolean;
  withSider?: boolean;
  hasSider?: boolean;
  prefixCls?: string;
  siderPrefixCls?: string;
  collapsed?: boolean;
  collapsedWidth?: number;
  reverseArrow?: boolean;
  siderTheme?: LayoutSiderProps['theme'];
  theme?: ThemeConfig;
  siderLocal?: LayoutConfigDescriptor & {
    classNames?: LayoutSiderProps['classNames'];
    styles?: Partial<Record<'root' | 'body', Readonly<Record<string, string | number>>>>;
  };
}

export function layoutSiderLocalProps(sample: LayoutConfigSample): Partial<LayoutSiderProps> {
  return {
    ...layoutConfigRecord(sample.siderLocal),
    classNames: sample.siderLocal?.classNames,
    styles: Object.fromEntries(Object.entries(sample.siderLocal?.styles ?? {}).map(
      ([key, style]) => [key, layoutConfigRecord({ style })?.style]
    ))
  };
}

export function layoutConfigRecord(descriptor?: LayoutConfigDescriptor): LayoutConfig | undefined {
  if (!descriptor) return;

  return {
    class: descriptor.className,
    style: descriptor.style && Object.entries(descriptor.style).map(([key, value]) => {
      const property = key.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
      const unit = typeof value === 'number' ? 'px' : '';
      return `${property}:${value}${unit}`;
    }).join(';')
  };
}
