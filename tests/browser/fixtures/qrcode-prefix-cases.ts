import type { QRCodeProps, ThemeConfig } from 'antd-svelte';

export interface QRCodePrefixSample {
  id: string;
  prefixCls: string;
  type: 'canvas' | 'svg';
  direction: 'ltr' | 'rtl';
  status?: QRCodeProps['status'];
  bordered?: boolean;
  theme?: ThemeConfig;
  styles?: {
    root?: { padding?: number };
    cover?: { backgroundColor?: string; color?: string };
  };
}
