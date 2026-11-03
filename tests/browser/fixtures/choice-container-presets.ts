export interface ChoiceContainerCase {
  name: string;
  component: 'tree-select' | 'tree-select-checkable' | 'cascader'
    | 'cascader-multiple' | 'cascader-custom';
  parent?: 'none' | 'parent' | 'shadow';
  child?: 'undefined' | 'child';
  local?: 'undefined' | 'local';
  resetTheme?: boolean;
}
