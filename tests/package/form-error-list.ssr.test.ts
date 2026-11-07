import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import FormErrorListFixtures from '../browser/fixtures/FormErrorListFixtures.svelte';
import reference from '../browser/fixtures/ant-design-form-error-list-observation.json';

describe('FormErrorList public package SSR', () => {
  it('pins current source observations and the discarded duplicate-message defect', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    const duplicates = reference.cases.find((entry) => entry.id === 'duplicate-and-prototype-messages')!;
    expect(duplicates.input.errors).toHaveLength(4);
    expect(duplicates.input.warnings).toHaveLength(1);
    expect(duplicates.items).toHaveLength(7);
  });

  it('renders ordered errors and warnings without creating timers or visibility callbacks on the server', () => {
    vi.useFakeTimers();
    try {
      const { body } = render(FormErrorListFixtures, { props: { initial: {
        fieldId: 'people', errors: ['First', 'Second'], warnings: ['Advice']
      } } });

      expect(body).toContain('id="people_help"');
      expect(body.match(/data-ant-form-error-message/g)).toHaveLength(3);
      expect(body.indexOf('>First')).toBeLessThan(body.indexOf('>Second'));
      expect(body.indexOf('>Second')).toBeLessThan(body.indexOf('>Advice'));
      expect(body).toContain('aria-label="Error list callbacks">[]');
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });

  it.each([false, 0, ''])('renders help %s as one entity instead of errors', (help) => {
    const { body } = render(FormErrorListFixtures, { props: { initial: {
      help, helpStatus: 'warning', errors: ['Ignored error']
    } } });

    expect(body.match(/data-ant-form-error-message/g)).toHaveLength(1);
    expect(body).toContain('ant-form-item-explain-warning');
    expect(body).not.toContain('Ignored error');
  });

  it('omits the message holder for empty lists', () => {
    const { body } = render(FormErrorListFixtures);

    expect(body).not.toContain('data-ant-form-error-list');
    expect(body).not.toContain('data-ant-form-error-message');
  });
});
