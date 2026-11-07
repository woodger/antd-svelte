import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import FormPathsFixtures from '../browser/fixtures/FormPathsFixtures.svelte';

describe('Form NamePath public package SSR', () => {
  it('renders nested fields, literal keys and local required rules without browser effects', () => {
    vi.useFakeTimers();
    try {
      const { body } = render(FormPathsFixtures);

      expect(body).toContain('name="user_name"');
      expect(body).toContain('name="user.name"');
      expect(body).toContain('name="rows_0_title"');
      expect(body).toContain('value="First"');
      expect(body).toContain('value="Literal"');
      expect(body).toContain('ant-form-item-required');
      expect(body).not.toContain('[object Object]');
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });
});
