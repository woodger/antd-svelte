import type { Snippet } from 'svelte';
import type { GetContainer } from './types';

export type ModalContent = string | number | boolean | null | Snippet;

/** Модальный native dialog с управлением open и snippets содержимого/footer. */
export interface ModalProps {
  /** Поддерживает bind:open. */
  open?: boolean;
  /** Необязательный заголовок; scalar или Snippet. Zero остаётся видимым. */
  title?: ModalContent;
  children?: Snippet;
  /** Непустое явное имя перекрывает автоматически связанный title. */
  'aria-label'?: string;
  /** Явный id перекрывает автоматически связанный title. */
  'aria-labelledby'?: string;
  footer?: Snippet | null;
  /** @defaultValue 520 */
  width?: number;
  /** @defaultValue true */
  closable?: boolean;
  /** @defaultValue true */
  keyboard?: boolean;
  /** Пока перенесён только closable; по умолчанию true. */
  mask?: { closable?: boolean; };
  /** @defaultValue false */
  confirmLoading?: boolean;
  okText?: string;
  cancelText?: string;
  onOk?: () => void;
  onCancel?: () => void;
  /**
   * Undefined наследует ConfigProvider; false оставляет DOM на месте.
   * Global getter вызывается без trigger.
   */
  getContainer?: GetContainer;
  class?: string;
}

