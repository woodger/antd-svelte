export interface DialogContainerCase {
  name: string;
  component: 'modal' | 'drawer';
  parent?: 'none' | 'shadow';
  child?: 'child' | 'undefined';
  local?: 'local' | 'undefined' | 'inline' | 'element' | 'selector' | 'missing-selector'
    | 'shadow' | 'empty-result' | 'empty-selector';
  resetTheme?: boolean;
  initial?: boolean;
  rtl?: boolean;
  force?: boolean;
  destroy?: boolean;
}
