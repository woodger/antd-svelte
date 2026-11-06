import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-notification-theme-reference.json';
import backgroundObservation from '../browser/fixtures/ant-design-notification-background-observation.json';
import widthObservation from '../browser/fixtures/ant-design-notification-width-observation.json';
import NotificationThemeCase from '../browser/fixtures/NotificationThemeCase.svelte';

describe('Notification component theme public package SSR', () => {
  it('pins the official source revision and archive', () => {
    for (const source of [reference, backgroundObservation, widthObservation]) {
      expect(source.reference).toMatchObject({
        version: registry.upstream.version,
        revision: registry.upstream.revision,
        archiveSha256: registry.upstream.archiveSha256
      });
    }
  });

  for (const sample of reference.cases) {
    it(`renders ${sample.name} queued notice without timers or browser resources`, () => {
      vi.useFakeTimers();
      try {
        const { body } = render(NotificationThemeCase, { props: { sample } });
        const prefix = sample.config.cssVar?.prefix ?? 'ant';

        expect(body).toContain('popover="manual"');
        expect(body).toContain('role="alert"');
        expect(body).toContain('aria-atomic="true"');
        expect(body).toContain('Notification title');
        expect(body).toContain('Notification text');
        expect(body).toContain('aria-label="Notification theme events">[]');
        expect(body).toContain(`--${prefix}-notification-z-index-popup`);
        expect(body).toContain(`--${prefix}-notification-width`);
        expect(body).toContain(`--${prefix}-notification-progress-bg`);
        expect(body).toMatch(/--notification-top:\s*24px(?:;|")/);
        expect(body).toMatch(/--notification-bottom:\s*24px(?:;|")/);
        expect(body).not.toContain('[object Object]');
        expect(vi.getTimerCount()).toBe(0);
      } finally {
        vi.useRealTimers();
      }
    });
  }

  it('keeps explicit status background values equal to global aliases', () => {
    const sample = reference.cases.find(sample => sample.name === 'default')!;
    const { body } = render(NotificationThemeCase, { props: { sample, sameColors: true } });

    expect(body).toContain('--ant-notification-color-success-bg:#f6ffed');
    expect(body).toContain('--ant-notification-color-warning-bg:#fffbe6');
  });
});
