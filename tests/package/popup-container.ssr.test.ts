import { describe, expect, it } from 'vitest';
import { render } from 'svelte/server';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-popup-container-reference.json';
import PopupContainerCase from '../browser/fixtures/PopupContainerCase.svelte';
import type { PopupContainerCase as ContainerCase } from '../browser/fixtures/popup-container-presets';

describe('ConfigProvider popup container SSR', () => {
  it('pins provider precedence to the official source archive', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256,
      source: 'package/dist/antd.min.js'
    });
  });

  for (const sample of reference.cases) {
    it(`defers container callbacks and DOM access until hydration for ${sample.name}`, () => {
      const { body } = render(PopupContainerCase, { props: {
        sample: sample as ContainerCase,
        onCall: () => { throw new Error('Unexpected SSR container call'); }
      } });

      expect(body).toContain('id="provider-parent"');
      expect(body).toContain('id="provider-shadow"');
      expect(body).toContain('aria-label="Container calls">[]');
      expect(body.toLowerCase()).not.toContain('getpopupcontainer=');
    });
  }
});
