import type { TagConfig, TagProps } from 'antd-svelte';

export interface TagCloseValues extends Pick<
  TagProps, 'closeIcon' | 'closable' | 'href' | 'target' | 'disabled' | 'color'
> {
  closeSnippet?: boolean;
  objectSnippet?: boolean;
  watchAfterClose?: boolean;
}

export interface TagCloseStep {
  kind: 'close' | 'root' | 'key';
  key?: string;
  repeat?: boolean;
  cancelled?: boolean;
}

export interface TagCloseCase extends TagCloseValues {
  name: string;
  provider?: TagConfig & TagCloseValues;
  innerProvider?: TagConfig;
  componentDisabled?: boolean;
  preventClose?: boolean;
  preventClick?: boolean;
  childrenLink?: boolean;
  direction?: 'ltr' | 'rtl';
  patch?: TagCloseValues;
  steps: TagCloseStep[];
}
