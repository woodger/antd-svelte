import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import { MessageHolder, createMessage, type MessageHolderProps } from 'antd-svelte';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-message-prefix-reference.json';
import MessagePrefixSSRFixtures from '../browser/fixtures/MessagePrefixSSRFixtures.svelte';

describe('Message local/shared prefixes', () => {
  it('pins Source useMessage/App styles and unchanged outside editors', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    expect(reference.cases).toHaveLength(23);
    expect(reference.transitions.every(step => step.sameRoot && step.sameInput && step.samePanel
      && step.focused && step.value === 'Edited')).toBe(true);
  });

  it('retains raw stale status classes separately from public same-key refresh counterparts', () => {
    expect(reference.transitions[0]?.result.icon?.color).toBe('rgba(0, 0, 0, 0.88)');
    expect(reference.refreshedTransitions[0]?.result.icon?.color).toBe('rgb(22, 119, 255)');
    expect(reference.refreshedTransitions.every(step => step.sameRoot && step.sameInput
      && step.focused)).toBe(true);
  });

  it('renders queued local parts without showing a popover or invoking callbacks in SSR', () => {
    const message = createMessage();
    const onClose = vi.fn();
    message.info({ content: 'Queued', onClose });
    const props = { message, prefixCls: 'toast' } satisfies MessageHolderProps;
    const rendered = render(MessageHolder, { props });
    const body = rendered.body;

    expect(body).toContain('toast-list');
    expect(body).toContain('toast-notice-icon-info');
    expect(body).toContain('ant-message-css-var');
    expect(body).toContain('popover="manual"');
    expect(body).not.toContain('prefixCls=');
    expect(rendered.head).toContain('message-prefix:toast:ant');
    expect(onClose).not.toHaveBeenCalled();
  });

  it('keeps nested holder namespaces and server request queues independent', () => {
    vi.useFakeTimers();
    try {
      const rendered = render(MessagePrefixSSRFixtures);
      const body = rendered.body;

      expect(body).toContain('suite-message-notice');
      expect(body).toContain('toast-notice-title');
      expect(rendered.head).toContain('message-prefix:toast:inner');
      expect(rendered.head).toContain('--inner-notification-title-font-size');
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });
});
