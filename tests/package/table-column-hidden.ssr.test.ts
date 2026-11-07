import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-table-column-hidden-reference.json';
import TableColumnHiddenFixtures from '../browser/fixtures/TableColumnHiddenFixtures.svelte';

describe('Table hidden columns public package SSR', () => {
  it('pins the official source revision and archive', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
  });

  for (const sample of reference.cases) {
    it(`renders ${sample.name} visible cells, data and fallback spans`, () => {
      const { body } = render(TableColumnHiddenFixtures, { props: { sample } });
      const cells = (markup: string) => Array.from(markup.matchAll(/<(td|th)\b([^>]*)>([\s\S]*?)<\/\1>/g), match => ({
        tagName: match[1].toUpperCase(),
        text: match[3].replace(/<[^>]*>/g, '').trim(),
        scope: match[2].match(/\bscope="([^"]*)"/)?.[1] ?? null,
        colSpan: Number(match[2].match(/\bcolspan="([^"]*)"/)?.[1] ?? 1),
        name: /\buser-name-cell\b/.test(match[2]),
        score: /\buser-score-cell\b/.test(match[2])
      }));
      const expected = (cell: ReturnType<typeof cells>[number]) => ({
        tagName: cell.tagName, text: cell.text, scope: cell.scope, colSpan: cell.colSpan,
        name: cell.name, score: cell.score
      });
      const withoutText = (cell: ReturnType<typeof expected>) => {
        const { text: _text, ...semantic } = cell;
        return semantic;
      };
      const head = body.match(/<thead\b[^>]*>([\s\S]*?)<\/thead>/)?.[1] ?? '';
      const tbody = body.match(/<tbody\b[^>]*>([\s\S]*?)<\/tbody>/)![1];
      const rows = Array.from(tbody.matchAll(/<tr\b[^>]*class="[^"]*\bant-table-row\b[^"]*"[^>]*>([\s\S]*?)<\/tr>/g),
        match => cells(match[1]));
      const expanded = tbody.match(/<tr\b[^>]*class="ant-table-expanded-row[^"]*"[^>]*>([\s\S]*?)<\/tr>/)?.[1] ?? '';
      const empty = tbody.match(/<tr\b[^>]*class="ant-table-placeholder[^"]*"[^>]*>([\s\S]*?)<\/tr>/)?.[1] ?? '';

      expect(cells(head).map(withoutText)).toEqual(sample.expected.head.map(expected).map(withoutText));
      expect(rows).toEqual(sample.expected.rows.map(row => row.map(expected)));
      expect(cells(expanded)).toEqual(sample.expected.expanded.map(expected));
      expect(cells(empty).map(withoutText)).toEqual(sample.expected.empty.map(expected).map(withoutText));
      expect(Array.from(body.matchAll(/<colgroup\b/g))).toHaveLength(sample.expected.colgroups);
      expect(body).not.toContain('[object Object]');
    });
  }
});
