import type { AvatarProps, AvatarShape, AvatarSize } from './avatar.types';
import type { PopoverProps } from './popover.types';

export type AvatarGroupKey = string | number;
export interface AvatarGroupItem extends Omit<AvatarProps, 'nativeElement'> {
  key: AvatarGroupKey;
  label: string;
  text?: string;
}
export interface AvatarGroupMax {
  count?: number;
  style?: string;
  popover?: Pick<
    PopoverProps,
    'trigger' | 'placement' | 'arrow' | 'autoAdjustOverflow' | 'mouseEnterDelay' | 'mouseLeaveDelay'
  >;
}
/** Группа аватаров с лимитом видимых элементов и Popover для оставшихся. */
export interface AvatarGroupProps {
  items: readonly AvatarGroupItem[];
  size?: AvatarSize;
  shape?: AvatarShape;
  /** Меняет group/popover classes; префиксы Avatar участников остаются независимыми. */
  prefixCls?: string;
  /**
   * Truthy max.count имеет приоритет; лимит нормализуется так же, как max.count.
   * @deprecated Используйте max.count.
   */
  maxCount?: number;
  /** Непустой max.style имеет приоритет. @deprecated Используйте max.style. */
  maxStyle?: string;
  /**
   * Max.popover.placement имеет приоритет.
   * @deprecated Используйте max.popover.placement.
   */
  maxPopoverPlacement?: 'top' | 'bottom';
  /**
   * Max.popover.trigger имеет приоритет.
   * @deprecated Используйте max.popover.trigger.
   */
  maxPopoverTrigger?: 'hover' | 'focus' | 'click';
  max?: AvatarGroupMax;
  id?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  class?: string;
  rootClassName?: string;
  style?: string;
  /** Bindable div; собственные class/style Avatar config к корню группы не применяются. */
  nativeElement?: HTMLDivElement;
}
