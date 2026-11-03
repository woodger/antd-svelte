import type { TabsMoreProps } from 'antd-svelte';

export interface TabsMorePositionCase {
  name: string;
  more?: Omit<TabsMoreProps, 'icon' | 'overlay' | 'popupRender' | 'onPopupAlign'>;
  open?: 'click' | 'context' | 'hover' | 'keyboard';
  width?: number;
  x?: number;
  y?: number;
  menu?: boolean;
  rtl?: boolean;
  styledArrow?: boolean;
  container?: boolean;
  undefinedBuiltin?: boolean;
  undefinedMin?: boolean;
  undefinedOffset?: boolean;
  resizeWidth?: number;
}
