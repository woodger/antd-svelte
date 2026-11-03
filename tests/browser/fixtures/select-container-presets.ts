export interface SelectContainerCase {
  name: string;
  component: 'select' | 'select-multiple' | 'auto-complete' | 'auto-complete-textarea';
  parent?: 'none' | 'parent' | 'shadow';
  child?: 'undefined' | 'child';
  local?: 'undefined' | 'local';
  resetTheme?: boolean;
}
