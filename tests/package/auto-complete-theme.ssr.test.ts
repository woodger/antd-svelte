import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import AutoCompleteThemeFixture from './AutoCompleteThemeFixture.svelte';

describe('Source AutoComplete theme SSR', () => {
  it('renders shared Select source variables before mount while leaving the popup closed', () => {
    const { body, head } = render(AutoCompleteThemeFixture);

    expect(body).toContain('--ant-select-option-height:32px');
    expect(body).toContain('--ant-select-option-padding:5px 12px');
    expect(body).toContain('--ant-select-option-line-height:1.5714285714285714;');
    expect(body).toContain('ant-select-source-theme');
    expect(body).toContain('width:240px');
    expect(body).toContain('aria-expanded="false"');
    expect(body).not.toContain('role="listbox"');
    expect(body).toContain('name="query"');
    expect(body).toContain('value="b"');
    expect(head).toContain('data-ant-svelte-theme="completion-ssr"');
  });

  it('renders compact option metrics with the shared Select token factory', () => {
    const { body } = render(AutoCompleteThemeFixture, { props: { preset: 'compact' } });

    expect(body).toContain('--ant-select-option-height:28px');
    expect(body).toContain('--ant-select-option-font-size:12px');
    expect(body).toContain('--ant-select-option-padding:4px 12px');
  });

  it('keeps custom Input component tokens separate from Select overrides', () => {
    const { body } = render(AutoCompleteThemeFixture, { props: { preset: 'custom-input-tokens' } });

    expect(body).toContain('--ant-font-size:20px');
    expect(body).toContain('--ant-select-selector-bg:#ffedcc');
    expect(body).toContain('--ant-input-input-font-size:18px');
    expect(body).toContain('name="custom"');
    expect(body).toContain('ant-select-customize');
  });

  it('bridges custom prefixes to the shared Select variables', () => {
    const { body } = render(AutoCompleteThemeFixture, { props: { preset: 'custom-prefix' } });

    expect(body).toContain('--select-2-select-option-height:45px');
    expect(body).toContain('--ant-select-option-height:var(--select-2-select-option-height)');
  });

  it('preserves explicit zero option dimensions', () => {
    const { body } = render(AutoCompleteThemeFixture, {
      props: { preset: 'zero-component-values' }
    });

    expect(body).toContain('--ant-select-option-height:0px');
    expect(body).toContain('--ant-select-option-padding:0px');
  });

  it('inherits undefined option declarations without returning to vendor defaults', () => {
    const { body } = render(AutoCompleteThemeFixture, {
      props: { preset: 'undefined-component-values' }
    });

    expect(body).toContain('--ant-select-option-height:inherit');
    expect(body).toContain('--ant-select-option-padding:inherit');
  });

  it('preserves native-only themes without adding source scopes or declarations', () => {
    const { body, head } = render(AutoCompleteThemeFixture, { props: { native: true } });

    expect(body).toContain('data-ant-compact="true"');
    expect(body).not.toContain('ant-select-source-theme');
    expect(body).not.toContain('--ant-select-option-height:');
    expect(head).not.toContain('data-ant-svelte-theme=');
  });
});
