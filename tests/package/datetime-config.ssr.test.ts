import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-datetime-config-reference.json';
import DatetimeConfigFixtures from '../browser/fixtures/DatetimeConfigFixtures.svelte';

describe('datetime configuration public package SSR', () => {
  it('pins the official source revision and archive', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
  });

  for (const sample of reference.cases) {
    it(`renders the ${sample.name} format and columns without browser effects`, () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(reference.reference.now));
      try {
        const { body } = render(DatetimeConfigFixtures, { props: { preset: sample.name } });
        const columns = body.match(/class="ant-picker-time-panel-column"/g) ?? [];
        const literal = sample.name === 'literal' || sample.name === 'literal-range';

        for (const value of sample.metrics.inputs) expect(body).toContain(`value="${value}"`);
        expect(columns).toHaveLength(literal ? 3 : sample.metrics.columns.length);
        expect(body).toContain('ant-picker-time-panel');
        expect(body).not.toContain('[object Object]');
        expect(vi.getTimerCount()).toBe(0);
      } finally {
        vi.useRealTimers();
      }
    });
  }
});
