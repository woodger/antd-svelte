import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import { NotificationHolder, createNotification, type NotificationHolderProps } from 'antd-svelte';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-notification-prefix-reference.json';
import NotificationPrefixSSRFixtures from '../browser/fixtures/NotificationPrefixSSRFixtures.svelte';

describe('Notification local/shared prefixes', () => {
  it('pins Source useNotification/App styles and retained editors', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    expect(reference.cases).toHaveLength(30);
    expect(reference.transitions.every(step => step.sameRoot && step.sameInput && step.samePanel
      && step.focused && step.value === 'Edited')).toBe(true);
  });

  it('keeps raw close/status observations apart from public style/refresh counterparts', () => {
    const first = reference.cases[0]!;

    expect(first.result.normal.close?.width).toBe('22px');
    expect(first.nativeStyle.normal.close?.width).toBe('24px');
    expect(reference.transitions[0]?.result.icon?.color).toBe('rgba(0, 0, 0, 0.88)');
    expect(reference.refreshedTransitions[0]?.result.icon?.color).toBe('rgb(22, 119, 255)');
    expect(reference.refreshedTransitions.every(step => step.sameRoot && step.sameInput
      && step.focused)).toBe(true);
  });

  it('renders queued local parts without showing a popover or invoking callbacks in SSR', () => {
    const notification = createNotification();
    const onClose = vi.fn();
    notification.info({ title: 'Queued', onClose });
    const props = { notification, prefixCls: 'notice' } satisfies NotificationHolderProps;
    const rendered = render(NotificationHolder, { props });
    const body = rendered.body;

    expect(body).toContain('notice-list');
    expect(body).toContain('notice-notice-icon-info');
    expect(body).toContain('ant-notification-css-var');
    expect(body).toContain('popover="manual"');
    expect(body).not.toContain('prefixCls=');
    expect(rendered.head).toContain('notification-prefix:notice:ant');
    expect(onClose).not.toHaveBeenCalled();
  });

  it('keeps nested holder namespaces and server request queues independent', () => {
    vi.useFakeTimers();
    try {
      const rendered = render(NotificationPrefixSSRFixtures);
      const body = rendered.body;

      expect(body).toContain('suite-notification-notice');
      expect(body).toContain('toast-notice-title');
      expect(rendered.head).toContain('notification-prefix:toast:inner');
      expect(rendered.head).toContain('--inner-notification-title-font-size');
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });
});
