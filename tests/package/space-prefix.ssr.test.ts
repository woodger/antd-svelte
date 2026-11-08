import { createRawSnippet } from 'svelte';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import {
  Space, SpaceCompact, SpaceAddon,
  type SpaceProps, type SpaceCompactProps, type SpaceAddonProps
} from 'antd-svelte';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-space-prefix-reference.json';
import isolated from '../browser/fixtures/ant-design-space-prefix-isolated.json';
import SpacePrefixSSRFixtures from '../browser/fixtures/SpacePrefixSSRFixtures.svelte';

describe('Space family local and shared prefixes in the public package', () => {
  it('pins source measurements, stable identities and the shared Badge selector observation', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    expect(reference.cases).toHaveLength(13);
    expect(reference.transitions).toHaveLength(3);
    expect(reference.transitions.every(step => step.sameSpace && step.sameCompact
      && step.sameAddons && step.sameInput && step.focused)).toBe(true);
    const aliases = reference.cases.find(entry => entry.sample.id === 'aliases')!;

    expect(aliases.result.nested.badge.display).toBe('inline-block');
    expect(isolated.result.badge.display).toBe('block');
  });

  it('publishes Space prefixCls for root, preset axes, items and separator with raw metadata', () => {
    const props: SpaceProps = {
      prefixCls: 'flow',
      size: ['medium', 'small'],
      items: ['One', 'Two'],
      separator: '|',
      classNames: ({ props }) => ({ root: `raw-${props.prefixCls}` })
    };
    const rendered = render(Space, { props });

    expect(rendered.body).toContain('flow-horizontal');
    expect(rendered.body).toContain('flow-gap-col-medium');
    expect(rendered.body).toContain('flow-gap-row-small');
    expect(rendered.body).toContain('flow-item-separator');
    expect(rendered.body).toContain('raw-flow');
    expect(rendered.body).not.toContain('prefixCls=');
    expect(rendered.head).toContain('space-prefix:flow:ant');
    expect(render(Space, { props: { prefixCls: 'flow', items: [] } }).body).not.toContain('<div');
  });

  it('publishes separate Compact and Addon prefixes without forwarding them as HTML attributes', () => {
    const children = createRawSnippet(() => ({ render: () => '<span>Child</span>' }));
    const compactProps: SpaceCompactProps = { prefixCls: 'group', children, vertical: true, block: true };
    const addonProps: SpaceAddonProps = {
      prefixCls: 'cell', children, variant: 'filled', status: 'warning', disabled: true
    };
    const compact = render(SpaceCompact, { props: compactProps });
    const addon = render(SpaceAddon, { props: addonProps });

    expect(compact.body).toContain('group-vertical');
    expect(compact.body).toContain('group-block');
    expect(compact.head).toContain('space-compact-prefix:group');
    expect(addon.body).toContain('cell-variant-filled');
    expect(addon.body).toContain('cell-status-warning');
    expect(addon.body).toContain('cell-disabled');
    expect(addon.head).toContain('space-addon-prefix:cell:ant');
    expect(compact.body + addon.body).not.toContain('prefixCls=');
  });

  it('keeps shared and local prefixes independent across nested providers during SSR', () => {
    const rendered = render(SpacePrefixSSRFixtures);

    expect(rendered.body).toContain('suite-space-horizontal');
    expect(rendered.body).toContain('suite-space-compact');
    expect(rendered.body).toContain('suite-space-addon-compact-first-item');
    expect(rendered.body).toContain('flow-horizontal');
    expect(rendered.body).toContain('cell-compact-first-item');
    expect(rendered.head).toContain('space-prefix:flow:inner');
    expect(rendered.head).toContain('--inner-space-addon-addon-border-color');
    expect(rendered.body).toContain('data-ant-space-addon-vars="inner"');
  });
});
