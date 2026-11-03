import { describe, expect, it } from 'vitest';
import { render } from 'svelte/server';
import { Mentions } from 'antd-svelte';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-mentions-popup-reference.json';
import MentionsPopupCase from '../browser/fixtures/MentionsPopupCase.svelte';
import type { MentionsPopupCase as PopupCase } from '../browser/fixtures/mentions-popup-presets';

describe('Mentions popup source contract SSR', () => {
  it('pins the getter and popup lifecycle to the official source archive', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256,
      source: 'package/dist/antd.min.js'
    });
  });

  for (const sample of reference.cases) {
    it(`renders the native textarea without calling browser getters for ${sample.name}`, () => {
      const { body } = render(MentionsPopupCase, {
        props: {
          sample: sample as PopupCase,
          onCall: () => { throw new Error('Unexpected SSR container call'); }
        }
      });

      expect(body).toContain('<textarea');
      expect(body).toContain('aria-expanded="false"');
      expect(body).not.toContain('popover="manual"');
      expect(body).toContain('aria-label="Mention popup calls">[]');
      expect(body.toLowerCase()).not.toMatch(/(?:getpopupcontainer|popuprender)=/);
    });
  }

  it('keeps default mention text closed and defers the DOM getter until interaction', () => {
    const { body } = render(Mentions, {
      props: {
        defaultValue: '@alpha',
        getPopupContainer: () => { throw new Error('Unexpected default SSR getter'); }
      }
    });

    expect(body).toContain('@alpha');
    expect(body).toContain('aria-expanded="false"');
    expect(body).not.toContain('role="listbox"');
  });
});
