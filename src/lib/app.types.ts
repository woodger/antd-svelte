import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { MessageInstance, MessageOptions } from './message.types';
import type { NotificationInstance, NotificationOptions } from './notification.types';
import type { ModalInstance } from './modal-confirm.types';

export interface AppMessageConfig extends MessageOptions {
  /** Вертикальный отступ поверхности MessageHolder; по умолчанию 8. */
  top?: number | string;
}

export interface AppNotificationConfig extends NotificationOptions {
  top?: number;
  bottom?: number;
}

/** Каждый record наследуется от ближайшего App и дополняется локальными полями. */
export interface AppOptions {
  message?: AppMessageConfig;
  notification?: AppNotificationConfig;
}

/** Общие class/style внешней обёртки App; record заменяет родительский целиком. */
export interface AppConfig {
  class?: string;
  style?: string;
}

export interface AppInstance {
  message: MessageInstance;
  notification: NotificationInstance;
  modal: ModalInstance;
}

/** Контекст API и holders; component=false выводит только содержимое и holders. */
export interface AppProps extends AppOptions, Omit<
  HTMLAttributes<HTMLElement>,
  'children' | 'class' | 'style'
> {
  children?: Snippet;
  /** @defaultValue 'div' */
  component?: keyof HTMLElementTagNameMap | false;
  /** Локальный CSS prefix; по умолчанию ant-app. */
  prefixCls?: string;
  class?: string;
  rootClassName?: string;
  style?: string;
  /** Поддерживает bind; undefined при component=false и после unmount. */
  nativeElement?: HTMLElement;
}
