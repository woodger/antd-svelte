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
  /**
   * Настройки Svelte Popover; children остаётся кнопкой +N.
   * Content заменяет список, title — его заголовок. По умолчанию destroyOnHidden=true.
   * Open — controlled prop с onOpenChange; без open состояние внутреннее.
   */
  popover?: Omit<PopoverProps, 'children'>;
}
/** Группа аватаров с лимитом видимых элементов и Popover для оставшихся. */
export interface AvatarGroupProps {
  items: readonly AvatarGroupItem[];
  size?: AvatarSize;
  shape?: AvatarShape;
  /** Меняет group/popover classes; префиксы Avatar участников остаются независимыми. */
  prefixCls?: string;
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
