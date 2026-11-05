import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-card-theme-reference.json';
import CardThemeCase from '../browser/fixtures/CardThemeCase.svelte';

describe('Card component theme public package SSR', () => {
  it('pins the source matrix and both reported cssVar runtime inputs', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    expect(reference.cases.filter(sample => sample.name.startsWith('reported-'))
      .map(sample => sample.config.cssVar)).toEqual([true, false]);
  });

  it('renders the public cssVar object input with reported Card overrides', () => {
    const sample = reference.cases.find(item => item.name === 'reported-true')!;
    const { body } = render(CardThemeCase, { props: { sample, cssVar: {} } });

    expect(body).toContain('--ant-card-body-padding:8px');
    expect(body).toContain('--ant-card-header-height:80px');
    expect(body).toContain('--ant-card-body-padding-sm:6px');
    expect(body).toContain('--ant-card-header-height-sm:60px');
    expect(body).toContain('--ant-card-header-bg:#e6f4ff');
    expect(body).toContain('--ant-card-actions-bg:#fff7e6');
  });

  for (const sample of reference.cases) {
    it(`renders ${sample.name} without browser globals`, () => {
      const { body } = render(CardThemeCase, { props: { sample } });

      expect(body).toContain('data-card-theme="normal"');
      expect(body).toContain('data-card-theme="small"');
      expect(body).toContain('--ant-card-body-padding');
      expect(body).toContain('--ant-card-header-height');
      expect(body).toContain('--ant-card-header-padding-sm');
      expect(body).toContain('--ant-card-actions-bg');
    });
  }
});
