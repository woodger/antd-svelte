import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import InputFeaturesFixtures from '../browser/fixtures/InputFeaturesFixtures.svelte';

describe('Input config SSR', () => {
  it(
    'renders inherited Input settings and explicit component config',
    () => {
      const body = render(InputFeaturesFixtures).body;

      expect(body).toContain('ant-input-filled');
      expect(body).toContain('context-input');
      expect(body).toContain('autocomplete="off"');
      expect(body).toContain('ant-input-underlined');
      expect(body).toContain('aria-label="Inherited input config"');
      expect(body).toContain('aria-label="Replaced input config"');
    }
  );
});
