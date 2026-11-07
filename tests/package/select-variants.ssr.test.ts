import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-select-variants-reference.json';
import SelectVariantsFixtures from '../browser/fixtures/SelectVariantsFixtures.svelte';

describe('Select local variants public package SSR', () => {
  it('pins the official source revision and archive', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
  });

  for (const sample of reference.cases) {
    it(`renders ${sample.name} classes without leaking appearance props to native input`, () => {
      const { body } = render(SelectVariantsFixtures, { props: { sample } });
      const classes = body.match(/class="ant-select ant-select-css-var ([^"]*)"/)![1].split(/\s+/);
      const variants = ['outlined', 'filled', 'borderless', 'underlined'].filter(variant =>
        classes.includes(`ant-select-${variant}`));

      expect(variants).toEqual(sample.expected.variants);
      expect(body).not.toMatch(/<input\b[^>]*\bvariant=/);
      expect(body).toContain('name="choice"');
    });
  }
});
