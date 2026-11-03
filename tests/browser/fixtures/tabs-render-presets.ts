import type {
  TabsAnimatedConfig,
  TabsEditableConfig,
  TabsLocale,
  TabsPlacement,
  TabsSlots,
  TabsTabBarProps,
  TabsType
} from 'antd-svelte';

export interface TabsRenderCase {
  name: string;
  root?: {
    type?: TabsType;
    rtl?: boolean;
    placement?: TabsPlacement;
    animated?: boolean | TabsAnimatedConfig;
    gutter?: number;
    tabBarStyle?: string;
    extraLeft?: string;
    extraRight?: string;
    moreIcon?: string;
    locale?: TabsLocale;
    popupClassName?: string;
    classNames?: TabsSlots;
    styles?: TabsSlots;
    many?: boolean;
    count?: number;
  };
  override?: Omit<Partial<TabsTabBarProps>, 'editable'> & {
    editable?: Omit<TabsEditableConfig, 'onEdit'>;
  };
  disableEditable?: boolean;
  intercept?: boolean;
  forward?: boolean;
  node?: 'attributes' | 'wrapper' | 'style' | 'intercept' | 'forward' | 'class';
  renderer?: 'manual' | 'empty';
  popup?: boolean;
  ref?: boolean;
  unsetMore?: boolean;
}

export function tabsRenderProps(props: TabsTabBarProps) {
  const classes = (value: string | undefined) =>
    (value ?? '').split(/\s+/).filter(name => /^(?:u-|p-|o-)/.test(name));
  const icon = (value: unknown) => value == null ? null
    : typeof value === 'object' || typeof value === 'function' ? 'node' : value;

  return {
    id: props.id,
    activeKey: props.activeKey,
    animated: props.animated,
    tabPosition: props.tabPosition,
    rtl: props.rtl,
    mobile: props.mobile,
    editable: props.editable ? {
      showAdd: props.editable.showAdd,
      addIcon: icon(props.editable.addIcon),
      removeIcon: icon(props.editable.removeIcon),
      onEdit: typeof props.editable.onEdit
    } : null,
    locale: props.locale ?? null,
    more: { ...props.more, icon: icon(props.more?.icon) },
    tabBarGutter: props.tabBarGutter ?? null,
    onTabClick: typeof props.onTabClick,
    onTabScroll: typeof props.onTabScroll,
    getPopupContainer: typeof props.getPopupContainer,
    extra: props.extra ?? null,
    style: props.style ?? null,
    popupClassName: classes(props.popupClassName),
    indicator: props.indicator,
    classNames: Object.fromEntries(Object.entries(props.classNames ?? {})
      .map(([key, value]) => [key, classes(value)] as const)
      .filter(([, values]) => values.length)),
    styles: props.styles ?? {}
  };
}
