import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-table-row-scope-reference.json';
import TableRowScopeFixtures from '../browser/fixtures/TableRowScopeFixtures.svelte';

describe('Table rowScope public package SSR', () => {
  it('pins the official source revision and archive', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
  });

  for (const sample of reference.cases) {
    it(`renders ${sample.name} row headers and independent column headers`, () => {
      const { body } = render(TableRowScopeFixtures, { props: { sample } });
      const cells = (markup: string) => Array.from(markup.matchAll(/<(td|th)\b([^>]*)>/g), match => ({
        tagName: match[1].toUpperCase(),
        scope: match[2].match(/\bscope="([^"]*)"/)?.[1] ?? null
      }));
      const head = body.match(/<thead\b[^>]*>([\s\S]*?)<\/thead>/)?.[1] ?? '';
      const rows = body.match(/<tbody\b[^>]*>([\s\S]*?)<\/tbody>/)![1];

      expect(cells(head)).toEqual(sample.expected.head);
      expect(cells(rows)).toEqual(sample.expected.rows.flatMap(row =>
        row.map(({ tagName, scope }) => ({ tagName, scope }))));
      expect(body).not.toContain('[object Object]');
    });
  }
});
