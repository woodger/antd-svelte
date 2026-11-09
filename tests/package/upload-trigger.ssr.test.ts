import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import structure from '../browser/fixtures/ant-design-upload-trigger-structure-reference.json';
import motion from '../browser/fixtures/ant-design-upload-trigger-motion-reference.json';
import UploadTriggerScope from '../browser/fixtures/UploadTriggerScope.svelte';

describe('Upload trigger SSR', () => {
  it('pins picker structure and trigger motion to the source revision', () => {
    for (const reference of [structure.reference, motion.reference]) {
      expect(reference).toMatchObject({
        version: registry.upstream.version,
        revision: registry.upstream.revision,
        archiveSha256: registry.upstream.archiveSha256
      });
    }
    expect(structure.cases).toHaveLength(16);
    expect(motion.cases).toHaveLength(6);
  });

  it.each(structure.cases)(
    'renders one native picker for $sample.id without browser resources', ({ sample, result }) => {
      vi.useFakeTimers();
      try {
        const body = render(UploadTriggerScope, { props: { sample } }).body;

        expect(body.match(/type="file"/g) ?? []).toHaveLength(result.inputs.length);
        expect(body.match(/class="ant-upload ant-upload-select\b/g) ?? [])
          .toHaveLength(result.selectCount);
        expect(body).not.toContain('ant-upload-animate-inline-appear');
        expect(vi.getTimerCount()).toBe(0);
      } finally {
        vi.useRealTimers();
      }
    }
  );
});
