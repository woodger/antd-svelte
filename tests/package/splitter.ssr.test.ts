import { createRawSnippet } from 'svelte';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import { Splitter, type SplitterProps } from 'antd-svelte';
import SplitterFixtures from '../browser/fixtures/SplitterFixtures.svelte';

describe('Splitter package SSR', () => {
  it(
    'renders raw initial panel sizes and content without layout callbacks or browser globals',
    () => {
      const events: string[] = [];
      const props: SplitterProps = {
        items: [
          {
            defaultSize: '30%',
            children: createRawSnippet(() => ({ render: () => '<p>Server panel</p>' }))
          },
          { defaultSize: 120, children: 'Scalar panel' },
          { children: 0 }
        ],
        onResizeStart: () => events.push('start'),
        onResize: () => events.push('resize'),
        onResizeEnd: () => events.push('end')
      };

      const body = render(Splitter, { props }).body;

      expect(body).toContain('flex-basis:30%;flex-grow:0');
      expect(body).toContain('flex-basis:120px;flex-grow:0');
      expect(body).toContain('flex-basis:auto;flex-grow:1');
      expect(body).toContain('<p>Server panel</p>');
      expect(body).toContain('Scalar panel');
      expect(body.match(/role="separator"/g)).toHaveLength(2);
      expect(body).not.toMatch(/aria-value(?:now|min|max)="(?:NaN|Infinity)/);
      expect(events).toEqual([]);
    }
  );

  it('renders inherited semantic config and positional panel snippets in the owned fixture', () => {
    const body = render(SplitterFixtures).body;

    expect(body).toContain('id="splitter-fixture"');
    expect(body).toContain('context-horizontal local-horizontal splitter-context');
    expect(body).toContain('context-panel local-panel splitter-item-0');
    expect(body).toContain('outline-offset:2px;outline-offset:4px;width:100%;height:100%');
    expect(body).toContain('aria-label="Splitter first draft"');
    expect(body).toContain('flex-basis:50%;flex-grow:0');
    expect(body).not.toContain('ant-splitter-mask');
  });
});
