import type {
  ModalConfirmConfig,
  ModalConfirmHandle,
  ModalConfirmType
} from './modal-confirm.types';

export const modalHolderKey = Symbol('ant-modal-holder');

export interface ModalConfirmation {
  readonly id: number;
  readonly type: ModalConfirmType;
  readonly config: Readonly<ModalConfirmConfig>;
  readonly open: boolean;
  readonly pendingOk: boolean;
  readonly pendingCancel: boolean;
}

interface Entry {
  view: ModalConfirmation;
  rendered: boolean;
  running: Set<boolean>;
  resolve: (confirmed: boolean) => void;
}

/** Изолированные подтверждения; DOM, тема и локаль принадлежат ModalHolder. */
export function createModal() {
  const entries = new Map<number, Entry>();
  let confirmations = $state.raw<readonly ModalConfirmation[]>([]);
  let state: 'fresh' | 'mounted' | 'detached' = 'fresh';
  let nextId = 0;

  function publish() {
    confirmations = [...entries.values()].map(entry => entry.view);
  }

  function complete(id: number) {
    const entry = entries.get(id);
    if (!entry || entry.view.open) return;
    entries.delete(id);
    publish();
    entry.view.config.afterClose?.();
  }

  function close(entry: Entry, confirmed: boolean) {
    if (entries.get(entry.view.id) !== entry || !entry.view.open) return;
    entry.view = { ...entry.view, open: false, pendingOk: false, pendingCancel: false };
    publish();
    entry.resolve(confirmed);
    if (!entry.rendered) complete(entry.view.id);
  }

  function act(id: number, confirmed: boolean) {
    const entry = entries.get(id);
    if (!entry?.view.open) return;
    const field = confirmed ? 'pendingOk' : 'pendingCancel';
    if (entry.running.has(confirmed)) return;
    const callback = confirmed ? entry.view.config.onOk : entry.view.config.onCancel;
    const finish = () => close(entry, confirmed);
    if (!callback) {
      finish();
      return;
    }

    entry.running.add(confirmed);
    let result: unknown;
    try {
      result = callback.length ? callback(finish) : (callback as () => unknown)();
    } catch (error) {
      entry.running.delete(confirmed);
      throw error;
    }
    if (result !== null
      && (typeof result === 'object' || typeof result === 'function')
      && 'then' in result
      && typeof result.then === 'function') {
      if (!entry.view.open || entries.get(id) !== entry) {
        void Promise.resolve(result).catch(() => {});
        return;
      }
      entry.view = { ...entry.view, [field]: true };
      publish();
      void Promise.resolve(result).then(finish, () => {
        // Отклонённая async-проверка оставляет окно для повторного действия.
        if (entries.get(id) !== entry || !entry.view.open) return;
        entry.running.delete(confirmed);
        entry.view = { ...entry.view, [field]: false };
        publish();
      });
    } else if (callback.length === 0) {
      finish();
    } else {
      entry.running.delete(confirmed);
    }
  }

  function dismiss(id: number) {
    const entry = entries.get(id);
    if (!entry?.view.open) return;
    const callback = entry.view.config.onCancel;
    close(entry, false);
    // Escape/close/mask уже закрыли dialog; callback не задерживает закрытие.
    void Promise.resolve(callback?.(() => {})).catch(() => {});
  }

  function open(type: ModalConfirmType, config: ModalConfirmConfig): ModalConfirmHandle {
    let resolve!: (confirmed: boolean) => void;
    const completion = new Promise<boolean>(done => { resolve = done; });
    const entry: Entry = {
      view: {
        id: ++nextId,
        type,
        config: { ...config },
        open: true,
        pendingOk: false,
        pendingCancel: false
      },
      rendered: false,
      running: new Set(),
      resolve
    };
    if (state === 'detached') resolve(false);
    else {
      entries.set(entry.view.id, entry);
      publish();
    }

    return {
      destroy: () => close(entry, false),
      update(patch) {
        if (entries.get(entry.view.id) !== entry || !entry.view.open) return;
        const current = { ...entry.view.config };
        const changes = typeof patch === 'function' ? patch(current) : patch;
        // update callback может уничтожить окно или отсоединить holder.
        if (entries.get(entry.view.id) !== entry || !entry.view.open) return;
        entry.view = { ...entry.view, config: { ...entry.view.config, ...changes } };
        publish();
      },
      // oxlint-disable-next-line unicorn/no-thenable -- Hook Modal API возвращает PromiseLike handle.
      then: completion.then.bind(completion)
    };
  }

  function connect() {
    if (state === 'mounted') throw new Error('A modal instance supports one mounted ModalHolder.');
    state = 'mounted';
    let connected = true;
    return () => {
      if (!connected) return;
      connected = false;
      state = 'detached';
      const pending = [...entries.values()];
      entries.clear();
      publish();
      for (const entry of pending) entry.resolve(false);
    };
  }

  return {
    info: (config: ModalConfirmConfig) => open('info', config),
    success: (config: ModalConfirmConfig) => open('success', config),
    error: (config: ModalConfirmConfig) => open('error', config),
    warning: (config: ModalConfirmConfig) => open('warning', config),
    confirm: (config: ModalConfirmConfig) => open('confirm', config),
    [modalHolderKey]: {
      get confirmations() { return confirmations; },
      connect,
      mounted(id: number) {
        const entry = entries.get(id);
        if (entry) entry.rendered = true;
      },
      act,
      dismiss,
      complete
    }
  };
}
