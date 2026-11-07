import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-table-column-classes-reference.json';
import TableColumnClassesFixtures from '../browser/fixtures/TableColumnClassesFixtures.svelte';

describe('Table column class public package SSR', () => {
  it('pins the official source revision and archive', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
  });

  for (const sample of reference.cases) {
    it(`renders ${sample.name} user classes only on that column header and data cells`, () => {
      const { body } = render(TableColumnClassesFixtures, { props: { sample } });
      const headers = [...body.matchAll(/<th\s[^>]*class="([^"]*)"[^>]*>/g)]
        .map(match => match[1].split(/\s+/).filter(name => name.startsWith('user-col-')));
      const cells = [...body.matchAll(/<td\s[^>]*class="([^"]*)"[^>]*>/g)]
        .filter(match => !match[1].includes('ant-table-placeholder'))
        .map(match => match[1].split(/\s+/).filter(name => name.startsWith('user-col-')));

      expect(headers).toEqual(sample.expected.head.map(cell => cell.userClasses));
      if (sample.name !== 'empty-data') {
        expect(cells).toEqual(sample.expected.rows.flatMap(row => row.map(cell => cell.userClasses)));
      }
      expect(body).not.toContain('[object Object]');
    });
  }
});
