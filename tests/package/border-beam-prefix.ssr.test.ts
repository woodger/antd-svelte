import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-border-beam-prefix-reference.json';
import BorderBeamPrefixCase from '../browser/fixtures/BorderBeamPrefixCase.svelte';

describe('BorderBeam prefix public package SSR', () => {
  it('pins the official source, revision and archive', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
  });

  for (const sample of reference.cases) {
    it(`renders ${sample.name} content and scoped head CSS without decorative layers`, () => {
      const { body, head } = render(BorderBeamPrefixCase, { props: { sample } });
      const prefix = 'prefix' in sample && sample.prefix || 'ant-border-beam';

      expect(body).toContain('data-beam-theme="normal"');
      expect(body).toContain('Beam themed draft normal');
      expect(body).not.toContain('aria-hidden="true"');
      if (prefix === 'ant-border-beam') {
        expect(head).not.toContain('data-ant-svelte-theme="border-beam-prefix:');
      } else {
        expect(head).toContain(`data-ant-svelte-theme="border-beam-prefix:${prefix}"`);
        expect(head).toContain(`.${prefix}:where([data-ant-border-beam-prefix])`);
        expect(head).toContain('--ant-border-beam-line-width');
        expect(head).toContain('@keyframes antBorderBeamMove');
      }
    });
  }
});
