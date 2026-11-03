export interface MentionsPopupCase {
  name: string;
  parent?: 'none' | 'shadow';
  child?: boolean;
  local?: 'local' | 'shadow' | 'undefined';
  custom?: boolean;
  replace?: boolean;
  placement?: 'top';
  rtl?: boolean;
  prefix?: '@@';
  context?: boolean;
}
