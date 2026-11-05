import { render } from 'svelte/server';
import { describe, expect, expectTypeOf, it, vi } from 'vitest';
import type { ConfigProviderProps, SegmentedConfig } from 'antd-svelte';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-segmented-config-reference.json';
import SegmentedConfigCase from '../browser/fixtures/SegmentedConfigCase.svelte';
import SegmentedConfigMetadataCase from '../browser/fixtures/SegmentedConfigMetadataCase.svelte';

describe('Segmented ConfigProvider public package SSR', () => {
  it('pins the source and exposes the inherited component configuration', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    expectTypeOf<ConfigProviderProps['segmented']>().toEqualTypeOf<SegmentedConfig | undefined>();
    expect(reference.reference.callbackDefaults).toEqual({
      name: 'undefined', disabled: 'undefined', block: 'undefined', vertical: 'undefined',
      size: 'undefined', shape: 'default'
    });
  });

  it('keeps existing native callback defaults and the raw local size in both callback scopes', () => {
    const { body } = render(SegmentedConfigMetadataCase);

    for (const name of ['native-name-true', 'native-disabled-false', 'native-block-false',
      'native-vertical-false', 'native-size-undefined', 'native-shape-default']) {
      expect(body).toContain(name);
    }
    expect(body).toContain('ant-segmented-lg');
  });

  it('omits absent and explicitly empty item style declarations from SSR', () => {
    const missing = render(SegmentedConfigMetadataCase).body;
    const explicit = render(SegmentedConfigMetadataCase, { props: { emptyStyle: true } }).body;

    expect(missing).not.toMatch(/<label[^>]*\sstyle=/);
    expect(explicit).not.toMatch(/<label[^>]*\sstyle=/);
  });

  for (const sample of reference.cases) {
    it(`renders ${sample.name} without DOM, refs, change events or animations`, () => {
      vi.useFakeTimers();
      try {
        const { body } = render(SegmentedConfigCase, { props: { sample } });

        expect(body).toContain('data-segmented-config="normal"');
        expect(body).toContain('role="radiogroup"');
        expect(body).toContain('Segmented config ref">empty</output>');
        expect(body).toContain('Segmented config events">[]</output>');
        expect(body).not.toMatch(/class="ant-segmented-thumb(?:\s|")/);
        expect(vi.getTimerCount()).toBe(0);
      } finally {
        vi.useRealTimers();
      }
    });
  }
});
