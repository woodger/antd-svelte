import type { LayoutConfig } from 'antd-svelte';

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
