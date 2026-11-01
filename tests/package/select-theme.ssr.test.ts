import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import SelectThemeFixture from './SelectThemeFixture.svelte';

describe('Source Select theme SSR', () => {
  it('renders source selector, tag and option variables with the provider scope', () => {
    const { body, head } = render(SelectThemeFixture);

    expect(body).toContain('--ant-select-option-height:32px');
    expect(body).toContain('--ant-select-option-padding:5px 12px');
    expect(body).toContain('--ant-select-multiple-item-height:24px');
    expect(body).toContain('--ant-select-option-line-height:1.5714285714285714;');
    expect(body).toContain('--ant-select-option-selected-font-weight:600;');
    expect(body).toContain('--ant-select-z-index-popup:1050;');
    expect(body).not.toContain('--ant-select-z-index-popup:1050px');
    expect(body).toContain('ant-select-source-theme');
    expect(body).toContain('width:240px');
    expect(head).toContain('data-ant-svelte-theme="select-ssr"');
    expect(body).toContain('name="project" value="b"');
    expect(body).toContain('name="teams" value="b"');
  });

  it('renders compact tag sizes and option metrics before mount', () => {
    const { body } = render(SelectThemeFixture, { props: { preset: 'compact' } });

    expect(body).toContain('--ant-select-option-height:28px');
    expect(body).toContain('--ant-select-option-font-size:12px');
    expect(body).toContain('--ant-select-option-padding:4px 12px');
    expect(body).toContain('--ant-select-multiple-item-height:20px');
    expect(body).toContain('--ant-select-multiple-item-height-sm:13px');
    expect(body).toContain('--ant-select-multiple-item-height-lg:27px');
  });

  it('preserves explicit zero dimensions and unitless font weight', () => {
    const { body } = render(SelectThemeFixture, { props: { preset: 'zero-component-values' } });

    expect(body).toContain('--ant-select-option-height:0px');
    expect(body).toContain('--ant-select-option-padding:0px');
    expect(body).toContain('--ant-select-option-selected-font-weight:0;');
    expect(body).toContain('--ant-select-multiple-item-height:0px');
  });

  it('inherits undefined declarations instead of restoring static vendor defaults', () => {
    const { body } = render(SelectThemeFixture, { props: { preset: 'undefined-component-values' } });

    expect(body).toContain('--ant-select-option-height:inherit');
    expect(body).toContain('--ant-select-option-padding:inherit');
    expect(body).toContain('--ant-select-option-font-size:inherit');
    expect(body).toContain('--ant-select-selector-bg:inherit');
  });

  it('keeps native-only controls free of source variables and classes', () => {
    const { body, head } = render(SelectThemeFixture, { props: { native: true } });

    expect(body).toContain('data-ant-compact="true"');
    expect(body).not.toContain('--ant-select-option-height:');
    expect(body).not.toContain('--ant-select-multiple-item-height:');
    expect(body).not.toContain('ant-select-source-theme');
    expect(head).not.toContain('data-ant-svelte-theme=');
  });

  it('bridges custom CSS prefixes without adding units to font weight', () => {
    const { body } = render(SelectThemeFixture, { props: { preset: 'custom-prefix' } });

    expect(body).toContain('--select-2-select-option-height:45px');
    expect(body).toContain('--ant-select-option-height:var(--select-2-select-option-height)');
    expect(body).toContain('--select-2-select-option-selected-font-weight:550;');
    expect(body).not.toContain('--select-2-select-option-selected-font-weight:550px');
  });
});
