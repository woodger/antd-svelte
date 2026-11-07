import type {
  AdjustOverflow,
  TooltipArrow,
  TooltipPlacement,
  TooltipSlots,
  TooltipTrigger,
  TooltipColor,
  ThemeConfig
} from 'antd-svelte';

interface Slots extends TooltipSlots {
  title?: string;
  content?: string;
  icon?: string;
}

export interface OverlayConfigSpec {
  prefixCls?: string;
  openClassName?: string;
  container?: 'body';
  color?: TooltipColor;
  class?: string;
  style?: string;
  classNames?: Slots;
  styles?: Slots;
  callback?: boolean;
  arrow?: TooltipArrow;
  trigger?: TooltipTrigger | readonly TooltipTrigger[];
  mouseEnterDelay?: number;
  mouseLeaveDelay?: number;
  placement?: TooltipPlacement;
  rootClassName?: string;
  autoAdjustOverflow?: boolean | AdjustOverflow;
}

export type OverlayConfigProvider = Partial<Record<'tooltip' | 'popover' | 'popconfirm', OverlayConfigSpec>>;

export interface OverlayConfigValues {
  text?: string;
  anchorClass?: string;
  provider?: OverlayConfigProvider;
  child?: OverlayConfigProvider;
  local?: OverlayConfigSpec;
  open?: boolean;
}

export interface OverlayConfigCase extends OverlayConfigValues {
  name: string;
  component: 'tooltip' | 'popover' | 'popconfirm' | 'avatar-group' | 'slider' | 'typography';
  defaultPlacement?: boolean;
  focusable?: boolean;
  jsEllipsis?: boolean;
  direction?: 'ltr' | 'rtl';
  theme?: ThemeConfig;
  range?: boolean;
  frames?: OverlayConfigValues[];
  snapshots: unknown[];
}

export interface OverlayConfigInteraction {
  name: string;
  steps: {
    action: number | 'hover' | 'leave' | 'focus' | 'blur' | 'click' | 'contextMenu';
    changes: boolean[];
    canceled?: boolean;
  }[];
}

interface CallbackProps {
  open?: boolean;
  trigger?: TooltipTrigger | readonly TooltipTrigger[];
  placement?: TooltipPlacement;
  arrow?: TooltipArrow;
  mouseEnterDelay?: number;
  mouseLeaveDelay?: number;
  destroyOnHidden?: boolean;
  builtinPlacements?: Readonly<Record<string, { points?: readonly string[] }>>;
}

export function buildOverlayConfig(spec: OverlayConfigSpec | undefined) {
  if (!spec) return undefined;
  const { callback, classNames, styles, container, ...rest } = spec;
  const props = container ? { ...rest, getPopupContainer: () => document.body } : rest;
  if (!callback) return { ...props, classNames, styles };

  return {
    ...props,
    classNames: ({ props }: { props: CallbackProps }) => ({
      ...classNames,
      root: [classNames?.root,
        `cb-trigger-${Array.isArray(props.trigger) ? props.trigger.join('-') || 'empty' : props.trigger}`,
        `cb-enter-${props.mouseEnterDelay}`, `cb-leave-${props.mouseLeaveDelay}`,
        `cb-placement-${props.placement ?? 'absent'}`,
        `cb-arrow-${typeof props.arrow === 'object' ? props.arrow?.pointAtCenter : props.arrow}`,
        `cb-destroy-${props.destroyOnHidden}`,
        `cb-open-${props.open}`,
        `cb-points-${props.builtinPlacements?.topLeft.points?.join('-') ?? 'absent'}`
      ].filter(Boolean).join(' ')
    }),
    styles: ({ props }: { props: CallbackProps }) => ({
      ...styles,
      root: [styles?.root, `--callback-enter:${props.mouseEnterDelay}`].filter(Boolean).join(';')
    })
  };
}

export function buildOverlayProvider(spec: OverlayConfigProvider | undefined) {
  return {
    tooltip: buildOverlayConfig(spec?.tooltip),
    popover: buildOverlayConfig(spec?.popover),
    popconfirm: buildOverlayConfig(spec?.popconfirm)
  };
}
