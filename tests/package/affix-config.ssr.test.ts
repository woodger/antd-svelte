import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-affix-config-reference.json';
import AffixConfigCase from '../browser/fixtures/AffixConfigCase.svelte';

describe('Affix configuration public package SSR', () => {
  it('pins the official source, revision and archive', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
  });

  for (const sample of reference.cases) {
    it(`renders ${sample.name} wrapper config and head CSS while leaving content in flow`, () => {
      const { body, head } = render(AffixConfigCase, { props: { sample } });
      const prefix = 'prefix' in sample && sample.prefix || 'ant-affix';

      expect(body).toContain('class="theme-affix provider-affix"');
      expect(body).toContain('opacity:0.5;outline-offset:6px;opacity:0.8;outline-offset:9px');
      expect(body.match(/name="affix-normal"/g)).toHaveLength(1);
      expect(body).not.toContain('theme-affix-fixed');
      expect(body).not.toContain('data-ant-affix-prefix');
      expect(body).not.toContain('aria-hidden="true"');
      if (prefix === 'ant-affix') {
        expect(head).not.toContain('data-ant-svelte-theme="affix-prefix:');
      } else {
        expect(head).toContain(`data-ant-svelte-theme="affix-prefix:${prefix}"`);
        expect(head).toContain(`.${prefix}:where([data-ant-affix-prefix])`);
        expect(head).toContain('--ant-affix-z-index-popup:10');
      }
    });
  }
});
