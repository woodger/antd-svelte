import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import { Switch, type SwitchProps } from 'antd-svelte';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-switch-prefix-reference.json';
import SwitchPrefixSSRFixtures from '../browser/fixtures/SwitchPrefixSSRFixtures.svelte';

describe('Switch local/shared prefixes in the public package', () => {
  it('pins official source styles and checked state across live prefix changes', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    expect(reference.cases).toHaveLength(22);
    expect(reference.transitions.every(step => step.sameSwitch && step.sameEditor && step.focused))
      .toBe(true);
    expect(reference.transitions.map(step => step.result.normal.checked))
      .toEqual(['true', 'true', 'true']);
  });

  it('renders local state, parts and raw semantic prefix without leaking props', () => {
    const props = {
      prefixCls: 'toggle',
      checked: true,
      size: 'small',
      checkedChildren: 'On',
      classNames: ({ props }) => ({ root: `semantic-${props.prefixCls}` })
    } satisfies SwitchProps;
    const rendered = render(Switch, { props });

    expect(rendered.body).toContain('toggle-checked');
    expect(rendered.body).toContain('toggle-small');
    expect(rendered.body).toContain('toggle-handle');
    expect(rendered.body).toContain('toggle-inner-checked');
    expect(rendered.body).toContain('semantic-toggle');
    expect(rendered.body).not.toContain('prefixCls=');
    expect(rendered.head).toContain('switch-prefix:toggle');
  });

  it('keeps native names and hidden form values without starting browser resources', () => {
    vi.useFakeTimers();
    try {
      const rendered = render(SwitchPrefixSSRFixtures);

      expect(rendered.body).toContain('suite-switch');
      expect(rendered.body).toContain('toggle-checked');
      expect(rendered.body).toContain('type="hidden" name="nested-enabled" value="on"');
      expect(rendered.head).toContain('switch-prefix:toggle');
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });
});
