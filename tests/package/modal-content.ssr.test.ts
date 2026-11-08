import { Modal, type ModalContent, type ModalProps } from 'antd-svelte';
import { createRawSnippet } from 'svelte';
import { render } from 'svelte/server';
import { describe, expect, expectTypeOf, it } from 'vitest';
import reference from '../browser/fixtures/ant-design-modal-content-reference.json';

describe('Modal optional content public package', () => {
  it('pins source absent/empty titles and the omitted numeric zero observation', () => {
    expect(reference.reference.version).toBe('6.6.8');
    expect(reference.reference.rcDialogStudyVersion).toBe('1.10.0');
    expect(reference.cases).toHaveLength(11);
    const zero = reference.cases.find(entry => entry.sample.id === 'zero')!;

    expect(zero.result.headers).toBe(0);
    expect(zero.result.labelledBy).toBe(false);
  });

  it('accepts an empty named dialog without children or title and keeps the SSR shell closed', () => {
    expectTypeOf<ModalProps['title']>().toEqualTypeOf<ModalContent | undefined>();
    const body = render(Modal, { props: { open: true, 'aria-label': 'Empty modal' } }).body;

    expect(body).toContain('aria-label="Empty modal"');
    expect(body).not.toContain('aria-labelledby=');
    expect(body).not.toContain('ant-modal-header');
    expect(body).not.toMatch(/<dialog[^>]*\sopen(?:\s|>)/);
    expect(body).toContain('ant-modal-footer');
  });

  it('renders rich and numeric titles with native heading association', () => {
    const title = createRawSnippet(() => ({ render: () => '<strong>Rich title</strong>' }));
    const rich = render(Modal, { props: { title, footer: null } }).body;
    const zero = render(Modal, { props: { title: 0 } }).body;

    expect(rich).toContain('<strong>Rich title</strong>');
    expect(rich).toMatch(/<h2[^>]*id="ant-modal-/);
    expect(rich).toContain('aria-labelledby="ant-modal-');
    expect(zero).toContain('ant-modal-header');
    expect(zero.replace(/<!--.*?-->/gs, '')).toMatch(/ant-modal-title[^>]*>0<\/h2>/);
  });
});
