import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-config-variants-reference.json';
import ConfigVariantsFixtures from '../browser/fixtures/ConfigVariantsFixtures.svelte';

describe('ConfigProvider and Form variants public package SSR', () => {
  it('pins the official reference revision and archive', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
  });

  for (const sample of reference.cases) {
    it(`renders all source variant classes for ${sample.name} without native prop leakage`, () => {
      const { body } = render(ConfigVariantsFixtures, { props: { sample } });
      const sections = body.split(/data-variant-kind="([^"]+)"/);

      for (const kind of reference.kinds) {
        const fragment = sections[sections.indexOf(kind.id) + 1];
        const token = kind.selector.split('.').at(-1)!;
        const root = [...fragment.matchAll(/<([a-z][\w-]*)\b[^>]*\bclass="([^"]*)"/g)]
          .find(match => match[2].split(/\s+/).includes(token))!;
        const classes = root[2].split(/\s+/);
        const variants = ['outlined', 'filled', 'borderless', 'underlined'].filter(variant =>
          classes.includes(`${kind.prefix}-${variant}`));
        const expected = sample.expected[kind.id as keyof typeof sample.expected];

        expect(variants).toEqual(expected.variants);
        if (kind.id === 'card') {
          expect(classes.includes('ant-card-bordered')).toBe(sample.expected.card.bordered);
        }
      }

      expect(body).not.toMatch(/<(?:input|textarea|form)\b[^>]*\bvariant=/);
      expect(body.match(/<form\b/g)).toHaveLength(1);
      expect(body).not.toContain('variant-context-only');
      expect(body).not.toContain('variant-context-wrapper');
      expect(body).toContain('name="draft"');
      expect(body).toContain('name="choices"');
    });
  }
});
