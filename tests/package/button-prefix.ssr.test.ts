import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import { Button, type ButtonProps } from 'antd-svelte';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-button-prefix-reference.json';
import ButtonPrefixSSRFixtures from '../browser/fixtures/ButtonPrefixSSRFixtures.svelte';

describe('Button local/shared prefixes in the public package', () => {
  it('pins official source styles, active states and live node identities', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    expect(reference.cases).toHaveLength(28);
    expect(reference.transitions.every(step => step.sameButtons && step.sameInput && step.focused))
      .toBe(true);
    expect(reference.cases.filter(entry => 'hover' in entry.states)).toHaveLength(6);
    const loading = reference.cases.find(entry => entry.sample.id === 'loading')!;

    expect(loading.result.normal[0].root.color).toBe('rgba(0, 0, 0, 0.88)');
    expect('expectedNative' in loading && loading.expectedNative?.normal[0].root.color)
      .toBe('rgba(0, 0, 0, 0.25)');
  });

  it('uses local root, icon and state classes without leaking prefix props', () => {
    const props = {
      prefixCls: 'action',
      type: 'primary',
      size: 'small',
      loading: true,
      children: 'Action',
      classNames: ({ props }) => ({ root: `semantic-${props.prefixCls}` })
    } satisfies ButtonProps;
    const rendered = render(Button, { props });

    expect(rendered.body).toContain('action-color-primary');
    expect(rendered.body).toContain('action-sm');
    expect(rendered.body).toContain('action-loading-icon');
    expect(rendered.body).toContain('semantic-action');
    expect(rendered.body).not.toContain('prefixCls=');
    expect(rendered.head).toContain('button-prefix:action:ant');
  });

  it('separates local classes from inherited variant variables without browser resources', () => {
    vi.useFakeTimers();
    try {
      const rendered = render(ButtonPrefixSSRFixtures);

      expect(rendered.body).toContain('suite-btn-compact-first-item');
      expect(rendered.body).toContain('action-loading');
      expect(rendered.head).toContain('button-prefix:action:inner');
      expect(rendered.head).toContain('--inner-btn-bg-color');
      expect(rendered.head).toContain('--ant-button-default-bg');
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });
});
