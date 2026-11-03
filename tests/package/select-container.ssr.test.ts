import { describe, expect, it } from 'vitest';
import { render } from 'svelte/server';
import { AutoComplete } from 'antd-svelte';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-select-container-reference.json';
import SelectContainerCase from '../browser/fixtures/SelectContainerCase.svelte';
import type { SelectContainerCase as ContainerCase } from '../browser/fixtures/select-container-presets';

describe('Select popup containers SSR', () => {
  it('pins getter precedence and retention to the official source archive', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256,
      source: 'package/dist/antd.min.js'
    });
  });

  for (const sample of reference.cases) {
    it(`renders the native shell without accessing the DOM for ${sample.name}`, () => {
      const { body } = render(SelectContainerCase, { props: {
        sample: sample as ContainerCase,
        onCall: () => { throw new Error('Unexpected SSR container call'); }
      } });

      expect(body).toContain('role="combobox"');
      expect(body).toContain('aria-expanded="false"');
      expect(body).toContain('aria-label="Select container calls">[]');
      expect(body).not.toContain('role="listbox"');
      expect(body.toLowerCase()).not.toContain('getpopupcontainer=');
    });
  }

  it('defers an explicitly open AutoComplete container until mount', () => {
    const { body } = render(AutoComplete, { props: {
      open: true,
      options: [{ value: 'alpha' }],
      getPopupContainer: () => { throw new Error('Unexpected open SSR getter'); }
    } });

    expect(body).toContain('aria-expanded="false"');
    expect(body).not.toContain('role="listbox"');
    expect(body.toLowerCase()).not.toContain('getpopupcontainer=');
  });
});
