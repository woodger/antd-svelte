import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import hoverReference from '../browser/fixtures/ant-design-table-hover-reference.json';
import classReference from '../browser/fixtures/ant-design-table-row-classes-reference.json';
import observation from '../browser/fixtures/ant-design-table-hover-observation.json';
import TableRowOptionsCase from '../browser/fixtures/TableRowOptionsCase.svelte';

describe('Table row options public package SSR', () => {
  it('pins the official source of classes, hover colors and the stale-hover observation', () => {
    for (const source of [hoverReference, classReference, observation]) {
      expect(source.reference).toMatchObject({
        version: registry.upstream.version,
        revision: registry.upstream.revision,
        archiveSha256: registry.upstream.archiveSha256
      });
    }
  });

  for (const sample of classReference.cases) {
    it(`renders ${sample.mode} classes on page records while keeping selection controls enabled`, () => {
      vi.useFakeTimers();
      try {
        const { body } = render(TableRowOptionsCase, { props: {
          sample: hoverReference.cases[0], mode: 'classes',
          classMode: sample.mode, setting: 'disabled'
        } });

        for (const row of sample.rows) {
          expect(body).toContain(row.name);
          for (const name of row.userClasses) expect(body).toContain(name);
        }
        expect(body).toContain('type="checkbox"');
        if (sample.rows.length) expect(body).not.toMatch(/<input\b[^>]*\sdisabled(?:\s|=|>)/);
        expect(body).toContain('Table row events');
        expect(body).not.toContain('[object Object]');
        expect(vi.getTimerCount()).toBe(0);
      } finally {
        vi.useRealTimers();
      }
    });
  }
});
