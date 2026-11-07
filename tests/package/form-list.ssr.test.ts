import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-form-list-observation.json';
import FormListFixtures from '../browser/fixtures/FormListFixtures.svelte';
import FormListDefaultsFixtures from '../browser/fixtures/FormListDefaultsFixtures.svelte';
import FormListNestedFixtures from '../browser/fixtures/FormListNestedFixtures.svelte';
import FormListSparseFixtures from '../browser/fixtures/FormListSparseFixtures.svelte';

describe('FormList public package SSR', () => {
  it('pins raw source observations and records the discarded fractional move defect', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    expect(reference.cases.find((sample) => sample.id === 'fractional-move-observation'))
      .toMatchObject({ undefinedRowIndices: [1] });
  });

  it('renders current paths, stable row keys and Form defaults without browser effects', () => {
    vi.useFakeTimers();
    try {
      const { body } = render(FormListFixtures);

      expect(body).toContain('id="user-0"');
      expect(body).toContain('name="users_0_name"');
      expect(body).toContain('value="Anna"');
      expect(body).toContain('value="Bob"');
      expect(body).not.toContain('value="Ignored default"');
      expect(body).not.toContain('[object Object]');
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });

  it('initializes an absent array before rendering its children', () => {
    const { body } = render(FormListDefaultsFixtures);

    expect(body).toContain('value="List default"');
    expect(body).toContain('name="users_0_name"');
    expect(body).toContain('aria-label="Empty default fields">0');
    expect(body).not.toContain('value="Ignored default"');
  });

  it('composes nested prefixes while resetting the prefix for an independent Form', () => {
    const { body } = render(FormListNestedFixtures);

    expect(body).toContain('name="groups_0_users_0_name"');
    expect(body).toContain('name="groups_1_users_0_name"');
    expect(body).toContain('name="title"');
    expect(body).toContain('value="Ada"');
    expect(body).toContain('value="Nested default"');
    expect(body.match(/<form\b/g)).toHaveLength(1);
  });

  it('renders existing sparse rows with their original indices and first available keys', () => {
    const { body } = render(FormListSparseFixtures);

    expect(body).toContain('id="user-0"');
    expect(body).toContain('name="users_2_name"');
    expect(body).toContain('value="Sparse row"');
    expect(body).not.toContain('name="users_0_name"');
    expect(body).not.toContain('name="users_1_name"');
  });
});
