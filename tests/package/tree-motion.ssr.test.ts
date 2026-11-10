import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-tree-motion-ssr-reference.json';
import source from '../browser/fixtures/ant-design-tree-motion-reference.json';
import { treeMotionSamples } from '../browser/fixtures/tree-motion-cases';
import TreeMotionSsr from './TreeMotionSsr.svelte';

describe('Tree group motion SSR', () => {
  it('pins independent browser phases and a DOM-free official server reference', () => {
    expect(source.reference).toMatchObject({ version: registry.upstream.version,
      revision: registry.upstream.revision, archiveSha256: registry.upstream.archiveSha256,
      delegate: '@rc-component/tree 1.4.0 / @rc-component/motion 1.3.3', errors: [], warnings: [] });
    expect(source.cases).toHaveLength(23);
    expect(source.observations.map(sample => sample.id)).toEqual(['hidden-key-observation']);
    expect(reference.reference).toEqual({ version: registry.upstream.version,
      react: '18.3.1', domAvailable: false,
      delegate: '@rc-component/tree1.4.0 / @rc-component/motion1.3.3' });
    expect(reference.cases).toHaveLength(12);
  });

  it.each(reference.cases)('preserves Source initial rows and semantic motion for $sample.id', entry => {
    vi.useFakeTimers();
    try {
      const callbacks: string[] = [];
      let semanticMotion: unknown;
      const html = render(TreeMotionSsr, { props: {
        sample: treeMotionSamples.find(sample => sample.id === entry.sample.id)!,
        onCallback: type => callbacks.push(type),
        onSemantic: (motion, original) => {
          semanticMotion = motion === false ? false : motion && {
            name: motion.motionName ?? null,
            appear: motion.motionAppear ?? null,
            deadline: motion.motionDeadline ?? null,
            hooks: Object.keys(motion).filter(key => key.startsWith('on')).sort(),
            identity: original ? motion === original : null
          };
        }
      } }).body;
      const result = {
        keys: [...html.matchAll(/data-tree-motion-key="([^"]*)"/g)].map(match => match[1]),
        groups: [...html.matchAll(/class="[^"]*treenode-motion[^"]*"/g)].length,
        semanticMotion, callbacks, timerCalls: vi.getTimerCount()
      };

      expect(result).toEqual(entry.result);
      expect(html).toContain('motion-semantic');
      expect(html).not.toMatch(/\bmotion="/);
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });
});
