export interface PopupContainerCase {
  name: string;
  component: 'tabs' | 'color-picker' | 'tour';
  parent?: 'none' | 'parent' | 'shadow';
  child?: 'absent' | 'undefined' | 'child' | 'shadow';
  local?: 'undefined' | 'local';
  more?: 'undefined' | 'more';
  resetTheme?: boolean;
  menu?: boolean;
  bar?: 'inherit' | 'undefined' | 'local';
}
