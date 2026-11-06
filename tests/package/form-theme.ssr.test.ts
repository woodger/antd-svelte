import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-form-theme-reference.json';
import FormThemeCase from '../browser/fixtures/FormThemeCase.svelte';

describe('Form theme public package SSR', () => {
  it('pins the official source, revision and archive', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    expect(reference.directionObservation.withoutDomDirection.formDirection).toBe('ltr');
    expect(reference.directionObservation.withDomDirection.formDirection).toBe('rtl');
  });

  for (const sample of reference.cases) {
    it(`renders ${sample.name} with native fields and no browser effects`, () => {
      vi.useFakeTimers();
      try {
        const { body } = render(FormThemeCase, { props: { sample } });

        expect(body).toContain('Form theme draft normal');
        expect(body).toContain('name="title"');
        expect(body).toContain('value="Draft"');
        expect(body).toContain('novalidate');
        expect(body).toContain('ant-form-item-required');
        expect(body).toContain('--ant-form-label-required-mark-color');
        expect(body).not.toContain('[object Object]');
        expect(vi.getTimerCount()).toBe(0);
      } finally {
        vi.useRealTimers();
      }
    });
  }
});
