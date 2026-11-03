import { describe, expect, it } from 'vitest';
import { render } from 'svelte/server';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-picker-container-reference.json';
import PickerContainerCase from '../browser/fixtures/PickerContainerCase.svelte';
import type { PickerContainerCase as ContainerCase } from '../browser/fixtures/picker-container-presets';

describe('Date and time picker container SSR', () => {
  it('pins callback and placement observations to the official source archive', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256,
      source: 'package/dist/antd.min.js'
    });
  });

  for (const sample of reference.cases) {
    it(`defers browser getters and native refs for ${sample.name}`, () => {
      const { body } = render(PickerContainerCase, {
        props: {
          sample: sample as ContainerCase,
          onCall: () => { throw new Error('Unexpected picker SSR container call'); }
        }
      });

      expect(body).toContain('<input');
      expect(body).toContain(`aria-expanded="${Boolean(sample.initial)}"`);
      expect(body).toContain('aria-label="Picker container calls">[]');
      expect(body).toContain('{"root":false,"start":false,"end":false}');
      expect(body.toLowerCase()).not.toContain('getpopupcontainer=');
    });
  }
});
