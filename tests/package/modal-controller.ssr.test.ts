import {
  ModalHolder,
  createModal,
  type ModalConfirmConfig,
  type ModalConfirmHandle,
  type ModalInstance
} from 'antd-svelte';
import { createRawSnippet } from 'svelte';
import { render } from 'svelte/server';
import { describe, expect, expectTypeOf, it, vi } from 'vitest';
import reference from '../browser/fixtures/ant-design-modal-controller-reference.json';

describe('Modal context controller public package', () => {
  it('pins official useModal behavior and its unresolved destroy observation', () => {
    expect(reference.reference.version).toBe('6.6.8');
    expect(reference.reference.rcDialogStudyVersion).toBe('1.10.0');
    expect(reference.cases).toHaveLength(13);
    const destroyed = reference.cases.find(entry => entry.sample.id === 'destroy')!;

    expect(destroyed.after.dialogs).toBe(0);
    expect(destroyed.after.settled).toBe(null);
    expect(destroyed.after.events).toEqual(['after-close']);
  });

  it('renders preloaded rich confirmations as closed SSR shells without invoking actions', () => {
    const modal = createModal();
    const onOk = vi.fn();
    const afterClose = vi.fn();
    const rich = createRawSnippet(() => ({ render: () => '<strong>Rich body</strong>' }));
    const options: ModalConfirmConfig = { title: 'SSR confirm', content: rich, onOk, afterClose };
    const handle = modal.confirm(options);
    expectTypeOf(modal).toEqualTypeOf<ModalInstance>();
    expectTypeOf(handle).toEqualTypeOf<ModalConfirmHandle>();
    const body = render(ModalHolder, { props: { modal } }).body;

    expect(body).toContain('SSR confirm');
    expect(body).toContain('<strong>Rich body</strong>');
    expect(body).toContain('ant-modal-confirm-confirm');
    expect(body).not.toMatch(/<dialog[^>]*\sopen(?:\s|>)/);
    expect(onOk).not.toHaveBeenCalled();
    expect(afterClose).not.toHaveBeenCalled();
  });

  it('settles destroy before mounting and isolates server request instances', async () => {
    const first = createModal();
    const second = createModal();
    const handle = first.info({ title: 'First request' });
    expect(render(ModalHolder, { props: { modal: second } }).body).not.toContain('First request');
    handle.destroy();

    expect(await handle).toBe(false);
    expect(render(ModalHolder, { props: { modal: first } }).body).not.toContain('First request');
  });
});
