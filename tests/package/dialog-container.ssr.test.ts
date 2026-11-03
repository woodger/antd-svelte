import { describe, expect, it } from 'vitest';
import { render } from 'svelte/server';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-dialog-container-reference.json';
import DialogContainerCase from '../browser/fixtures/DialogContainerCase.svelte';
import type { DialogContainerCase as ContainerCase } from '../browser/fixtures/dialog-container-presets';

describe('Modal and Drawer container SSR', () => {
  it('pins container selection and retention to the official source archive', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256,
      source: 'package/dist/antd.min.js'
    });
  });

  for (const sample of reference.cases) {
    it(`defers browser container getters and native modality for ${sample.name}`, () => {
      const { body } = render(DialogContainerCase, {
        props: {
          sample: sample as ContainerCase,
          onCall: () => { throw new Error('Unexpected dialog SSR container call'); }
        }
      });

      expect(body).toContain('<dialog');
      expect(body).toContain('aria-label="Panel container calls">[]');
      expect(body).not.toMatch(/<dialog[^>]*\sopen(?:[\s=>])/);
      expect(body.toLowerCase()).not.toContain('getcontainer=');
    });
  }
});
