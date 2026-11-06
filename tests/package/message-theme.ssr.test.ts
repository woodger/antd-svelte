import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-message-theme-reference.json';
import MessageThemeCase from '../browser/fixtures/MessageThemeCase.svelte';

describe('Message component theme public package SSR', () => {
  it('pins the official source revision and archive', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
  });

  for (const sample of reference.cases) {
    it(`renders ${sample.name} queued notice without timers or browser resources`, () => {
      vi.useFakeTimers();
      try {
        const { body } = render(MessageThemeCase, { props: { sample } });
        const prefix = sample.config.cssVar?.prefix ?? 'ant';

        expect(body).toContain('popover="manual"');
        expect(body).toContain('role="status"');
        expect(body).toContain('aria-atomic="true"');
        expect(body).toContain('Message text');
        expect(body).toContain('aria-label="Message theme events">[]');
        expect(body).toContain(`--${prefix}-message-z-index-popup`);
        expect(body).toContain(`--${prefix}-message-content-bg`);
        expect(body).toContain(`--${prefix}-message-content-padding`);
        expect(body).toMatch(/--notification-top:\s*8px(?:;|")/);
        expect(body).not.toContain('[object Object]');
        expect(vi.getTimerCount()).toBe(0);
      } finally {
        vi.useRealTimers();
      }
    });
  }
});
