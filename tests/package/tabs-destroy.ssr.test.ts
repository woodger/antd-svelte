import { createRawSnippet } from 'svelte';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import { Tabs } from 'antd-svelte';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-tabs-destroy-reference.json';

describe('Tabs legacy destruction SSR', () => {
  it('pins the reference to the audited upstream and records native priority differences', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256,
      rcTabs: { version: '1.13.0', revision: 'dea2f5f48991865ddbf743b0f783f45eb72ff671' }
    });
    expect(reference.cases.filter(sample => 'nativeRetained' in sample))
      .toHaveLength(2);
  });

  it.each([false, true])('keeps unvisited content lazy unless forceRender=%s', forceRender => {
    const children = createRawSnippet(() => ({ render: () => '<p>Legacy hidden content</p>' }));
    const { body } = render(Tabs, { props: {
      destroyInactiveTabPane: true,
      items: [
        { key: 'alpha', label: 'Alpha' },
        { key: 'beta', label: 'Beta', children, destroyInactiveTabPane: true, forceRender }
      ]
    } });

    expect(body.includes('Legacy hidden content')).toBe(forceRender);
    expect(body).toContain('role="tabpanel"');
    expect(body).toContain('aria-selected="true"');
    expect(body).not.toContain('destroyInactiveTabPane=');
  });
});
