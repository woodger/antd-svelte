import { createRawSnippet } from 'svelte';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import Splitter from './Splitter.svelte';

describe('Splitter SSR', () => {
  it('keeps raw pixel and percentage sizes before measuring and renders panel content', () => {
    const body = render(Splitter, { props: {
      items: [
        { defaultSize: 23, children: 'First' },
        {
          defaultSize: '33%',
          children: createRawSnippet(() => ({ render: () => '<input name="draft" />' }))
        },
        { children: '<unsafe>' }
      ]
    } }).body;

    expect(body).toContain('flex-basis:23px;flex-grow:0');
    expect(body).toContain('flex-basis:33%;flex-grow:0');
    expect(body).toContain('flex-basis:auto;flex-grow:1');
    expect(body).toContain('<input name="draft"');
    expect(body).toContain('&lt;unsafe');
    expect(body.match(/role="separator"/g)).toHaveLength(2);
    expect(body).not.toContain('aria-valuenow="NaN"');
  });

  it('honors destroy overrides without starting DOM work or emitting callbacks', () => {
    const events: unknown[] = [];
    const body = render(Splitter, { props: {
      destroyOnHidden: true,
      items: [
        { defaultSize: 0, children: 'Destroy me' },
        { defaultSize: 0, destroyOnHidden: false, children: 'Retained' },
        { children: 'Expanded' }
      ],
      onResizeStart: value => events.push(value),
      onResize: value => events.push(value),
      onResizeEnd: value => events.push(value),
      onCollapse: value => events.push(value)
    } }).body;

    expect(body).not.toContain('Destroy me');
    expect(body).toContain('Retained');
    expect(body).toContain('Expanded');
    expect(body).toContain('ant-splitter-panel-hidden');
    expect(events).toEqual([]);
  });

  it('resolves orientation before semantic callbacks and keeps an empty root without bars', () => {
    const body = render(Splitter, { props: {
      orientation: 'horizontal',
      vertical: true,
      layout: 'vertical',
      classNames: ({ props }) => ({ root: `reported-${props.orientation}-${props.vertical}` }),
      styles: { root: 'height:200px' },
      style: 'height:300px'
    } }).body;

    expect(body).toContain('ant-splitter-horizontal');
    expect(body).toContain('reported-horizontal-false');
    expect(body).toContain('height:200px;height:300px');
    expect(body).not.toContain('role="separator"');
  });
});
