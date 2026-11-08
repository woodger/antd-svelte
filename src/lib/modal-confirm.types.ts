import type { Snippet } from 'svelte';
import type { createModal } from './modal.model.svelte.js';
import type { ModalContent, ModalProps } from './modal.types';

export type ModalConfirmType = 'info' | 'success' | 'error' | 'warning' | 'confirm';
/** Callback с аргументом close управляет закрытием вручную; Promise включает loading. */
export type ModalConfirmAction = (close: () => void) => unknown;

/** Контекстное подтверждение createModal, отображаемое единственным ModalHolder. */
export interface ModalConfirmConfig {
  title?: ModalContent;
  content?: ModalContent;
  icon?: Snippet | null | false;
  /** @defaultValue 416 */
  width?: number;
  /** Только confirm показывает Cancel по умолчанию. */
  okCancel?: boolean;
  okText?: ModalContent;
  cancelText?: ModalContent;
  /** @defaultValue false */
  closable?: boolean;
  /** @defaultValue true */
  keyboard?: boolean;
  /** По умолчанию закрытие по фону запрещено. */
  mask?: ModalProps['mask'];
  getContainer?: ModalProps['getContainer'];
  class?: string;
  footer?: Snippet | null;
  onOk?: ModalConfirmAction;
  onCancel?: ModalConfirmAction;
  afterClose?: () => void;
}

export interface ModalConfirmHandle extends PromiseLike<boolean> {
  /** Закрывает без onCancel; await завершается с false. */
  destroy(): void;
  update(
    patch: Partial<ModalConfirmConfig>
      | ((previous: Readonly<ModalConfirmConfig>) => Partial<ModalConfirmConfig>)
  ): void;
}

export type ModalInstance = ReturnType<typeof createModal>;

export interface ModalHolderProps {
  modal: ModalInstance;
}
