import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import { InputOTP, type InputOTPProps } from 'antd-svelte';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-input-otp-prefix-reference.json';
import InputOTPPrefixSSRFixtures from '../browser/fixtures/InputOTPPrefixSSRFixtures.svelte';

describe('InputOTP local/shared prefixes in the public package', () => {
  it('pins Source results and distinguishes raw global wrappers from the owner counterpart', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    expect(reference.cases).toHaveLength(28);
    const mask = reference.cases.find(entry => entry.sample.id === 'mask-local')!;

    expect(mask.result.normal.inputs[0].wrapper.position).toBe('static');
    expect(mask.expectedNative.normal.inputs[0].wrapper.position).toBe('relative');
    expect(reference.transitions.every(step => step.sameInputs && step.sameRoot
      && step.sameWrappers && step.focused === 3)).toBe(true);
  });

  it('uses the owner prefix for masks and separators, preserving the global Input prefix', () => {
    const props = {
      prefixCls: 'code', defaultValue: '12', length: 4, mask: true, separator: '-',
      classNames: ({ props }) => ({ root: `semantic-${props.prefixCls}` })
    } satisfies InputOTPProps;
    const rendered = render(InputOTP, { props });

    expect(rendered.body).toContain('code-input-wrapper');
    expect(rendered.body).toContain('code-mask-icon');
    expect(rendered.body).toContain('code-mask-input');
    expect(rendered.body).toContain('code-separator');
    expect(rendered.body).toContain('semantic-code');
    expect(rendered.body).toContain('class="ant-input');
    expect(rendered.body).not.toContain('prefixCls=');
    expect(rendered.head).toContain('input-otp-prefix:code');
  });

  it('keeps SSR defaults and native grouping without starting selection or password timers', () => {
    vi.useFakeTimers();
    try {
      const rendered = render(InputOTPPrefixSSRFixtures);

      expect(rendered.body).toContain('suite-otp-input-wrapper');
      expect(rendered.body).toContain('code-otp-input-wrapper');
      expect(rendered.body).toContain('inner-input');
      expect(rendered.body).toContain('role="group"');
      expect(rendered.body).toContain('value="1"');
      expect(rendered.head).toContain('input-otp-prefix:code-otp');
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });
});
