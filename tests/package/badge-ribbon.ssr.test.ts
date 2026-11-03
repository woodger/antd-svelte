import { describe, expect, it } from 'vitest';
import { render } from 'svelte/server';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-badge-ribbon-reference.json';
import BadgeRibbonCase from '../browser/fixtures/BadgeRibbonCase.svelte';
import type { BadgeRibbonCase as Sample } from '../browser/fixtures/badge-ribbon-presets';

describe('BadgeRibbon SSR', () => {
  it('pins layout and semantic references to the official archive', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256,
      source: 'package/dist/antd.min.js'
    });
  });

  for (const sample of reference.cases) {
    it(`renders source content without a browser ref for ${sample.name}`, () => {
      const { body } = render(BadgeRibbonCase, { props: { sample: sample as Sample } });
      const prefix = 'prefixCls' in sample && sample.prefixCls ? sample.prefixCls : 'ant-ribbon';
      const wrappers = [...body.matchAll(/<div\b[^>]*class="([^"]*)"/g)]
        .filter(([, classes]) => classes.split(/\s+/).includes(`${prefix}-wrapper`)).length;

      expect({
        wrappers,
        states: [...body.matchAll(/\sdata-ribbon-state=/g)].length,
        inputs: [...body.matchAll(/<input\b/g)].length,
        buttons: [...body.matchAll(/<button\b/g)].length
      }).toEqual(sample.ssr);
      expect(body).toContain(`class="${prefix}-corner `);
      expect(body).toContain('aria-label="Ribbon native ref">empty');
    });
  }
});
