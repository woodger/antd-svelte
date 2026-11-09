import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import { Modal, type ModalProps } from 'antd-svelte';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-modal-prefix-reference.json';
import ModalPrefixSSRFixtures from '../browser/fixtures/ModalPrefixSSRFixtures.svelte';

describe('Modal local/shared prefixes', () => {
  it('pins Source panels, confirmations and live draft identity', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    expect(reference.cases).toHaveLength(23);
    expect(reference.transitions.every(step => step.sameRoot && step.sameInput && step.samePanel
      && step.focused && step.value === 'Edited')).toBe(true);
  });

  it('renders local parts in a closed native dialog without leaking prefix', () => {
    const props = { prefixCls: 'window', title: 'Panel', open: true } satisfies ModalProps;
    const rendered = render(Modal, { props });
    const body = rendered.body;

    expect(body).toContain('<dialog');
    expect(body).toContain('window-container');
    expect(body).toContain('window-footer');
    expect(body).toContain('ant-modal-css-var');
    expect(body).not.toContain('prefixCls=');
    expect(body).not.toMatch(/<dialog[^>]*\sopen(?:[\s=>])/);
    expect(rendered.head).toContain('modal-prefix:window');
  });

  it('retains the Source local Confirm header observation separately from public counterparts', () => {
    const entry = reference.cases.find(entry => entry.sample.id === 'confirm')!;

    expect(entry.result.normal.header?.height).toBe('24px');
    expect(entry.matchedHeader?.normal.header).toBeNull();
    expect(entry.result.normal.container?.height).toBe('182px');
    expect(entry.matchedHeader?.normal.container?.height).toBe('150px');
  });

  it('retains Source cached footer spacing separately from a fresh public namespace', () => {
    const entry = reference.cases.find(entry => entry.sample.id === 'aliases')!;

    expect(entry.result.nested.buttons[1]?.['margin-inline-start']).toBe('0px');
    expect(entry.freshNamespace?.nested.buttons[1]?.['margin-inline-start']).toBe('8px');
  });

  it('keeps global/local confirmation scopes independent without browser work in SSR', () => {
    vi.useFakeTimers();
    try {
      const rendered = render(ModalPrefixSSRFixtures);
      const body = rendered.body;

      expect(body).toContain('suite-modal');
      expect(body).toContain('window-confirm-title');
      expect(body).toContain('inner-btn');
      expect(rendered.head).toContain('modal-prefix:window:inner');
      expect(rendered.head).toContain('--ant-modal-confirm-btns-margin-top');
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });
});
