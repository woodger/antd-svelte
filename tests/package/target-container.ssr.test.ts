import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-target-container-reference.json';
import observation from '../browser/fixtures/ant-design-target-shadow-root-observation.json';
import TargetContainerCase from '../browser/fixtures/TargetContainerCase.svelte';

describe('Target container public package SSR', () => {
  it('pins source scroll behavior and the separately observed unsupported ShadowRoot branch', () => {
    for (const source of [reference, observation]) {
      expect(source.reference).toMatchObject({
        version: registry.upstream.version,
        revision: registry.upstream.revision,
        archiveSha256: registry.upstream.archiveSha256
      });
    }
    expect(observation.observations.map(item => item.component)).toEqual(['Affix', 'Anchor']);
  });

  for (const sample of reference.cases) {
    it(`renders ${sample.name} fields and links without resolving browser targets`, () => {
      const getter = vi.fn(() => { throw new Error('SSR target accessed'); });
      const { body } = render(TargetContainerCase, {
        props: { sample, getTargetContainer: getter }
      });

      expect(body.match(/name="normal"/g)).toHaveLength(1);
      expect(body).toContain('id="target-a"');
      expect(body).toContain('id="target-b"');
      expect(body).toContain('href="#a-1"');
      expect(body).not.toContain('aria-hidden="true" style="width:');
      expect(body).not.toContain('position:fixed');
      expect(getter).not.toHaveBeenCalled();
    });
  }
});
