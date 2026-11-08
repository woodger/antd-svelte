import type { ConfigProviderProps } from 'antd-svelte';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import reference from '../browser/fixtures/ant-design-config-prefix-reference.json';
import ConfigPrefixSSRFixtures from '../browser/fixtures/ConfigPrefixSSRFixtures.svelte';

describe('ConfigProvider shared prefix public package', () => {
  it('pins source inheritance, namespace fallback and stable root transitions', () => {
    expect(reference.reference.version).toBe('6.6.8');
    expect(reference.cases).toHaveLength(13);
    const clear = reference.cases.find(entry => entry.sample.id === 'child-clear-variable')!;

    expect(clear.result.normal.token.fontSize).toBe('var(--suite-font-size)');
    expect(clear.result.nested.token.fontSize).toBe('var(--inner-font-size)');
    expect(reference.transitions.every(entry => entry.sameRoot && entry.sameInput)).toBe(true);
  });

  it('accepts a readonly provider prefix without a framework or DOM-specific adapter', () => {
    const props: Readonly<Pick<ConfigProviderProps, 'prefixCls'>> = Object.freeze({
      prefixCls: 'suite'
    });

    expect(props.prefixCls).toBe('suite');
  });

  it('renders inherited App and Layout prefixes and separate variable namespaces in SSR', () => {
    const body = render(ConfigPrefixSSRFixtures).body;

    for (const prefix of ['suite', 'inner']) {
      for (const part of [
        'app',
        'layout',
        'layout-sider',
        'layout-header',
        'layout-content',
        'layout-footer'
      ]) {
        expect(body).toContain(`${prefix}-${part}`);
      }
      expect(body).toContain(`var(--${prefix}-font-size)`);
    }
    expect(body).not.toContain('prefixCls=');
    expect(body).not.toContain('<dialog');
    expect(body).toContain('ant-layout-css-var');
  });
});
