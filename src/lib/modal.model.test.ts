import { describe, expect, it, vi } from 'vitest';
import { createModal, modalHolderKey } from './modal.model.svelte.js';

function setup() {
  const modal = createModal();
  const runtime = modal[modalHolderKey];
  const disconnect = runtime.connect();
  const mount = () => {
    for (const entry of runtime.confirmations) runtime.mounted(entry.id);
  };
  const complete = () => {
    for (const entry of runtime.confirmations) runtime.complete(entry.id);
  };
  return { modal, runtime, disconnect, mount, complete };
}

describe('createModal context confirmations', () => {
  it('isolates all five methods without a DOM or timers', () => {
    const first = createModal();
    const second = createModal();
    for (const type of ['info', 'success', 'error', 'warning', 'confirm'] as const) {
      first[type]({ title: type, content: 0 });
    }

    expect(first[modalHolderKey].confirmations.map(entry => entry.type)).toEqual([
      'info', 'success', 'error', 'warning', 'confirm'
    ]);
    expect(second[modalHolderKey].confirmations).toEqual([]);
  });

  it('snapshots config and applies object and function updates without changing identity', () => {
    const { modal, runtime } = setup();
    const options = { title: 'Initial', content: 'Body' };
    const handle = modal.confirm(options);
    const id = runtime.confirmations[0].id;
    options.title = 'Foreign change';
    handle.update({ content: 'Updated' });
    handle.update(previous => ({ title: `${previous.title} title` }));

    expect(runtime.confirmations[0]).toMatchObject({
      id,
      config: { title: 'Initial title', content: 'Updated' }
    });
  });

  it('completes OK once and defers afterClose until native closure', async () => {
    const { modal, runtime, mount, complete } = setup();
    const onOk = vi.fn();
    const afterClose = vi.fn();
    const handle = modal.confirm({ onOk, afterClose });
    mount();
    const id = runtime.confirmations[0].id;
    runtime.act(id, true);
    runtime.act(id, true);

    expect(await handle).toBe(true);
    expect(onOk).toHaveBeenCalledTimes(1);
    expect(afterClose).not.toHaveBeenCalled();
    expect(runtime.confirmations[0].open).toBe(false);
    complete();
    complete();

    expect(afterClose).toHaveBeenCalledTimes(1);
    expect(runtime.confirmations).toEqual([]);
  });

  it('completes Cancel with false and calls only onCancel', async () => {
    const { modal, runtime } = setup();
    const onCancel = vi.fn();
    const onOk = vi.fn();
    const handle = modal.confirm({ onCancel, onOk });
    runtime.act(runtime.confirmations[0].id, false);

    expect(await handle).toBe(false);
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onOk).not.toHaveBeenCalled();
  });

  it.each([false, true, undefined, 0, 'keep'])('closes after a zero-arity result %s', async result => {
    const { modal, runtime } = setup();
    const handle = modal.confirm({ onOk: () => result });
    runtime.act(runtime.confirmations[0].id, true);

    expect(await handle).toBe(true);
    expect(runtime.confirmations).toEqual([]);
  });

  it('allows a manual close callback to keep the dialog open', async () => {
    const { modal, runtime, mount } = setup();
    let close!: () => void;
    const handle = modal.confirm({ onOk: done => { close = done; } });
    mount();
    runtime.act(runtime.confirmations[0].id, true);

    expect(runtime.confirmations[0].open).toBe(true);
    expect(runtime.confirmations[0].pendingOk).toBe(false);
    close();
    close();

    expect(await handle).toBe(true);
    expect(runtime.confirmations[0].open).toBe(false);
  });

  it('blocks repeated async actions and closes after fulfillment', async () => {
    const { modal, runtime, mount } = setup();
    let resolve!: () => void;
    const promise = new Promise<void>(done => { resolve = done; });
    const onOk = vi.fn(() => promise);
    const handle = modal.confirm({ onOk });
    mount();
    const id = runtime.confirmations[0].id;
    runtime.act(id, true);
    runtime.act(id, true);

    expect(onOk).toHaveBeenCalledTimes(1);
    expect(runtime.confirmations[0].pendingOk).toBe(true);
    resolve();

    expect(await handle).toBe(true);
    expect(runtime.confirmations[0].pendingOk).toBe(false);
  });

  it('resets loading after rejection and allows retry without an unhandled rejection', async () => {
    const { modal, runtime, mount } = setup();
    const onOk = vi.fn().mockRejectedValueOnce(new Error('Validation')).mockResolvedValueOnce(0);
    const handle = modal.confirm({ onOk });
    mount();
    const id = runtime.confirmations[0].id;
    runtime.act(id, true);
    await Promise.resolve();

    expect(runtime.confirmations[0].open).toBe(true);
    expect(runtime.confirmations[0].pendingOk).toBe(false);
    runtime.act(id, true);

    expect(await handle).toBe(true);
    expect(onOk).toHaveBeenCalledTimes(2);
  });

  it('supports async cancellation independently of OK', async () => {
    const { modal, runtime, mount } = setup();
    let resolve!: () => void;
    const onCancel = () => new Promise<void>(done => { resolve = done; });
    const handle = modal.confirm({ onCancel });
    mount();
    runtime.act(runtime.confirmations[0].id, false);

    expect(runtime.confirmations[0].pendingCancel).toBe(true);
    expect(runtime.confirmations[0].pendingOk).toBe(false);
    resolve();

    expect(await handle).toBe(false);
  });

  it('settles destroy with false without cancel and ignores late async completion', async () => {
    const { modal, runtime, mount, complete } = setup();
    let resolve!: () => void;
    const pending = new Promise<void>(done => { resolve = done; });
    const onCancel = vi.fn();
    const afterClose = vi.fn();
    const handle = modal.confirm({ onOk: () => pending, onCancel, afterClose });
    mount();
    runtime.act(runtime.confirmations[0].id, true);
    handle.destroy();
    handle.update({ title: 'Ignored' });
    resolve();
    await pending;
    complete();

    expect(await handle).toBe(false);
    expect(onCancel).not.toHaveBeenCalled();
    expect(afterClose).toHaveBeenCalledTimes(1);
    expect(runtime.confirmations).toEqual([]);
  });

  it('settles holder removal quietly and ignores late rejection', async () => {
    const { modal, runtime, mount, disconnect } = setup();
    let reject!: (reason: Error) => void;
    const pending = new Promise<void>((_, fail) => { reject = fail; });
    const afterClose = vi.fn();
    const onCancel = vi.fn();
    const handle = modal.confirm({ onOk: () => pending, afterClose, onCancel });
    mount();
    runtime.act(runtime.confirmations[0].id, true);
    disconnect();
    disconnect();
    reject(new Error('Late'));
    await Promise.resolve();

    expect(await handle).toBe(false);
    expect(afterClose).not.toHaveBeenCalled();
    expect(onCancel).not.toHaveBeenCalled();
    expect(runtime.confirmations).toEqual([]);
    expect(await modal.info({})).toBe(false);
  });

  it('rejects a second holder without detaching the first', () => {
    const { modal, runtime } = setup();
    expect(() => runtime.connect()).toThrow('one mounted ModalHolder');
    modal.confirm({ title: 'Still attached' });

    expect(runtime.confirmations).toHaveLength(1);
  });

  it('prevents reentrant duplicate actions and preserves synchronous exceptions', () => {
    const { modal, runtime } = setup();
    const error = new Error('Callback');
    let id = 0;
    const onOk = vi.fn(() => {
      runtime.act(id, true);
      throw error;
    });
    modal.confirm({ onOk });
    id = runtime.confirmations[0].id;

    expect(() => runtime.act(id, true)).toThrow(error);
    expect(onOk).toHaveBeenCalledTimes(1);
    expect(runtime.confirmations[0].open).toBe(true);
    expect(() => runtime.act(id, true)).toThrow(error);
    expect(onOk).toHaveBeenCalledTimes(2);
  });

  it('does not revive a dialog destroyed inside update', async () => {
    const { modal, runtime } = setup();
    const handle = modal.confirm({ title: 'Original' });
    handle.update(() => {
      handle.destroy();
      return { title: 'Stale update' };
    });

    expect(await handle).toBe(false);
    expect(runtime.confirmations).toEqual([]);
  });

  it('consumes a late rejection returned after a callback closes synchronously', async () => {
    const { modal, runtime, mount, complete } = setup();
    let reject!: (reason: Error) => void;
    const pending = new Promise<void>((_, fail) => { reject = fail; });
    const handle = modal.confirm({ onOk: close => {
      close();
      return pending;
    } });
    mount();
    runtime.act(runtime.confirmations[0].id, true);
    complete();
    reject(new Error('Late rejection'));
    await Promise.resolve();

    expect(await handle).toBe(true);
    expect(runtime.confirmations).toEqual([]);
  });
});
