import type { TabsMoreProps } from 'antd-svelte';

export interface TabsMoreRuntimeCase {
  name: string;
  more?: Omit<TabsMoreProps, 'overlay' | 'popupRender' | 'onVisibleChange' | 'onOverlayClick'>;
  raw?: boolean;
  wrap?: boolean;
  motionOff?: boolean;
  controlled?: boolean;
  callbackOnly?: boolean;
  undefinedVisible?: boolean;
  undefinedEnterDelay?: boolean;
  overrideDuration?: boolean;
  scenario?: 'focus-click' | 'click-hover' | 'hover-click' | 'keyboard'
    | 'context' | 'context-toggle' | 'touch' | 'undefined-keyboard' | 'selection'
    | 'raw-keyboard' | 'focus-blur';
}
