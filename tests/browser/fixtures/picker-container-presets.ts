export interface PickerContainerCase {
  name: string;
  component: 'date' | 'date-range' | 'time' | 'time-range';
  parent?: 'none' | 'shadow';
  child?: 'child' | 'undefined';
  local?: 'local' | 'shadow' | 'undefined';
  resetTheme?: boolean;
  rtl?: boolean;
  placement?: 'topRight';
  initial?: 'zero' | 'one';
  showTime?: boolean;
}
