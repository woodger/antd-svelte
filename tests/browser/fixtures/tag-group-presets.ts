import type {
  CheckableTagGroupProps,
  CheckableTagOption,
  CheckableTagValue,
  TagConfig,
  ThemeConfig
} from 'antd-svelte';

export interface TagGroupValues {
  options?: (CheckableTagValue | CheckableTagOption)[];
  value?: CheckableTagValue | CheckableTagValue[] | null;
  defaultValue?: CheckableTagValue | CheckableTagValue[] | null;
  multiple?: boolean;
  disabled?: boolean;
  class?: string;
  rootClassName?: string;
  style?: string;
  classNames?: { root?: string; item?: string; };
  styles?: { root?: string; item?: string; };
  functions?: boolean;
  uncontrolled?: boolean;
}

export interface TagGroupCase extends TagGroupValues {
  name: string;
  provider?: TagConfig;
  contextFunctions?: boolean;
  componentDisabled?: boolean;
  direction?: 'ltr' | 'rtl';
  token?: ThemeConfig['token'];
  dark?: boolean;
  compact?: boolean;
  rich?: boolean;
  accept?: boolean;
  patch?: TagGroupValues;
  steps?: ({ click: number; } | { space: number; } | { patch: boolean; })[];
  snapshots: unknown[];
}

export type TagGroupSelection = CheckableTagGroupProps['value'];
