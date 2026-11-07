export interface OverlayContainerCase {
  name: string;
  component: 'tooltip' | 'popover' | 'popconfirm' | 'dropdown'
    | 'slider' | 'slider-range' | 'typography';
  parent?: 'none' | 'parent' | 'shadow';
  child?: 'undefined' | 'child';
  local?: 'undefined' | 'local';
  tooltip?: 'undefined' | 'tooltip';
  svg?: boolean;
  resetTheme?: boolean;
}
