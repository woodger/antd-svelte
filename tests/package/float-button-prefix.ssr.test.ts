import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import { FloatButton, FloatButtonBackTop, type FloatButtonProps } from 'antd-svelte';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-float-button-prefix-reference.json';
import FloatButtonPrefixSSRFixtures from '../browser/fixtures/FloatButtonPrefixSSRFixtures.svelte';

describe('FloatButton local/shared prefixes and Group owner in the public package', () => {
  it('pins raw official source behavior separately from explicit owner aliases', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    expect(reference.cases).toHaveLength(24);
    expect(reference.transitions.every(step => step.sameRoot && step.sameInput
      && step.sameButtons && step.focused)).toBe(true);
    const local = reference.cases.find(entry => entry.sample.id === 'local')!;

    expect(local.result.normal.items[0].root.position).toBe('fixed');
    expect(local.matched.normal.items[0].root.position).toBe('relative');
    const aliases = reference.cases.find(entry => entry.sample.id === 'aliases')!;

    expect(aliases.matched.nested.backTop.root['background-image']).toBe('none');
    expect('freshNested' in aliases && aliases.freshNested?.backTop.root['background-image'])
      .toContain('180deg');
  });

  it('renders local parts and BackTop progress classes without leaking prefix props', () => {
    const props = {
      prefixCls: 'floating',
      shape: 'square',
      content: 'Action',
      classNames: ({ props }) => ({ root: `semantic-${props.prefixCls}` })
    } satisfies FloatButtonProps;
    const rendered = render(FloatButton, { props });

    expect(rendered.body).toContain('floating-square');
    expect(rendered.body).toContain('floating-content');
    expect(rendered.body).toContain('semantic-floating');
    expect(rendered.body).not.toContain('prefixCls=');
    expect(rendered.head).toContain('float-button-prefix:floating:ant');
    expect(render(FloatButtonBackTop, {
      props: { prefixCls: 'floating', visibilityHeight: 0, showProgress: true }
    }).body).toContain('floating-progress');
  });

  it('inherits owner prefixes and keeps SSR free from scroll, animation and timer resources', () => {
    vi.useFakeTimers();
    try {
      const rendered = render(FloatButtonPrefixSSRFixtures);

      expect(rendered.body).toContain('suite-float-btn-group');
      expect(rendered.body).toContain('floating-group-trigger');
      expect(rendered.body).toContain('floating-content');
      expect(rendered.body).toContain('--inner-float-btn-progress:0turn');
      expect(rendered.head).toContain('float-button-prefix:floating:inner');
      expect(rendered.head).toContain('--inner-float-btn-list-transform-start');
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });
});
