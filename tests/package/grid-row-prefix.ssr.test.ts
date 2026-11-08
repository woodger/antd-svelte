import { createRawSnippet } from 'svelte';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import { Row, type RowProps } from 'antd-svelte';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-grid-row-prefix-reference.json';
import GridRowPrefixSSRFixtures from '../browser/fixtures/GridRowPrefixSSRFixtures.svelte';

describe('Grid Row local and shared prefixes in the public package', () => {
  it('pins the official Row measurements and retained live identities', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    expect(reference.cases).toHaveLength(12);
    expect(reference.transitions).toHaveLength(3);
    expect(reference.transitions.every(step => step.sameRow && step.sameCols
      && step.sameInput && step.focused)).toBe(true);
    const responsive = reference.cases.find(entry => entry.sample.id === 'responsive')!;

    expect('viewports' in responsive && Object.keys(responsive.viewports!)).toEqual(['600', '1100']);
  });

  it('publishes prefixCls for row states and preserves server gutter and style priority', () => {
    const props: RowProps = {
      prefixCls: 'line',
      gutter: [16, 12],
      wrap: false,
      align: 'middle',
      justify: 'space-between',
      children: createRawSnippet(() => ({ render: () => '<input name="draft" />' })),
      style: 'margin-inline:3px'
    };
    const rendered = render(Row, { props });

    expect(rendered.body).toContain('line-no-wrap');
    expect(rendered.body).toContain('line-middle');
    expect(rendered.body).toContain('line-space-between');
    expect(rendered.body).toContain('margin-inline:-8px;row-gap:12px;margin-inline:3px');
    expect(rendered.body).toContain('name="draft"');
    expect(rendered.body).not.toContain('prefixCls=');
    expect(rendered.head).toContain('grid-row-prefix:line');
  });

  it('inherits provider prefixes and passes child gutters during SSR', () => {
    const rendered = render(GridRowPrefixSSRFixtures);

    expect(rendered.body).toContain('suite-row');
    expect(rendered.body).toContain('line');
    expect(rendered.body).toContain('padding-inline:8px');
    expect(rendered.head).toContain('grid-row-prefix:suite-row');
    expect(rendered.head).toContain('grid-row-prefix:line');
  });
});
