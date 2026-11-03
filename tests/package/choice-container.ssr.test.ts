import { describe, expect, it } from 'vitest';
import { render } from 'svelte/server';
import { Cascader, TreeSelect } from 'antd-svelte';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-choice-container-reference.json';
import ChoiceContainerCase from '../browser/fixtures/ChoiceContainerCase.svelte';
import type { ChoiceContainerCase as ContainerCase } from '../browser/fixtures/choice-container-presets';

describe('TreeSelect and Cascader popup containers SSR', () => {
  it('pins getter priorities and trigger payloads to the official source archive', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256,
      source: 'package/dist/antd.min.js'
    });
  });

  for (const sample of reference.cases) {
    it(`renders the native shell without calling a DOM getter for ${sample.name}`, () => {
      const { body } = render(ChoiceContainerCase, { props: {
        sample: sample as ContainerCase,
        onCall: () => { throw new Error('Unexpected SSR container call'); }
      } });

      expect(body).toContain('aria-expanded="false"');
      expect(body).toContain('aria-label="Choice container calls">[]');
      expect(body).not.toContain('popover="manual"');
      expect(body.toLowerCase()).not.toContain('getpopupcontainer=');
    });
  }

  it('keeps an explicitly open TreeSelect hidden without resolving its container on the server', () => {
    const { body } = render(TreeSelect, { props: {
      open: true,
      treeData: [{ value: 'alpha', title: 'Alpha' }],
      getPopupContainer: () => { throw new Error('Unexpected open SSR getter'); }
    } });

    expect(body).toMatch(/<div[^>]*\spopover="manual"[^>]*\shidden(?:[=\s>])/);
    expect(body).toContain('Alpha');
  });

  it('keeps an explicitly open Cascader hidden without resolving its container on the server', () => {
    const { body } = render(Cascader, { props: {
      open: true,
      options: [{ value: 'alpha', label: 'Alpha' }],
      getPopupContainer: () => { throw new Error('Unexpected open SSR getter'); }
    } });

    expect(body).toMatch(/<div[^>]*\spopover="manual"[^>]*\shidden(?:[=\s>])/);
    expect(body).toContain('Alpha');
  });
});
