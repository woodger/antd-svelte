import type { MenuMode } from 'antd-svelte';

export interface MenuContainerCase {
  name: string;
  mode: MenuMode;
  parent?: 'none' | 'shadow';
  child?: 'child' | 'undefined';
  local?: 'local' | 'shadow' | 'undefined';
  resetTheme?: boolean;
  rtl?: boolean;
  force?: boolean;
  zero?: boolean;
  initial?: boolean;
  collapsed?: boolean;
}
