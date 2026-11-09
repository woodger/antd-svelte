import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-upload-ref-reference.json';
import transport from '../browser/fixtures/ant-design-upload-ref-transport-reference.json';
import disposal from '../browser/fixtures/ant-design-upload-batch-disposal-observation.json';
import UploadRefScope from '../browser/fixtures/UploadRefScope.svelte';

describe('Upload imperative ref SSR', () => {
  it('pins the public lifecycle captures to the source revision', () => {
    for (const evidence of [reference.reference, transport.reference, disposal.reference]) {
      expect(evidence).toMatchObject({
        version: registry.upstream.version,
        revision: registry.upstream.revision,
        archiveSha256: registry.upstream.archiveSha256,
        delegate: '@rc-component/upload 1.1.1'
      });
    }
    expect(reference.cases).toHaveLength(18);
    expect(transport.cases).toHaveLength(2);
    expect(disposal.cases).toHaveLength(2);
    expect(disposal.cases.every(entry => entry.result.events.some(event => !event.mounted)))
      .toBe(true);
  });

  it.each(reference.cases)('renders $sample.id without invoking ref operations', ({ sample }) => {
    vi.useFakeTimers();
    try {
      const body = render(UploadRefScope, { props: { sample } }).body;

      expect(body.match(/type="file"/g) ?? []).toHaveLength(1);
      for (const name of ['before', 'requests', 'callbacks']) {
        const output = new RegExp(`<output[^>]*data-ref-${name}[^>]*>(.*?)</output>`).exec(body);
        expect(output?.[1].replace(/<!--[\s\S]*?-->/g, '')).toBe('0');
      }
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });
});
