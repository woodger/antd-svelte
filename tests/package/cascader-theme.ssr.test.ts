import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import CascaderThemeFixture from './CascaderThemeFixture.svelte';

describe('Source Cascader theme SSR', () => {
  it('renders both style hooks and hidden popup variables before browser effects', () => {
    const { body, head } = render(CascaderThemeFixture);

    expect(body).toContain('--ant-cascader-control-width:184px');
    expect(body).toContain('--ant-cascader-control-item-width:111px');
    expect(body).toContain('--ant-cascader-dropdown-height:180px');
    expect(body).toContain('--ant-cascader-option-padding:5px 12px');
    expect(body).toContain('--ant-cascader-option-selected-font-weight:600;');
    expect(body).not.toContain('--ant-cascader-option-selected-font-weight:600px');
    expect(body).toContain('--ant-select-multiple-item-height:24px');
    expect(body).toContain('ant-cascader-source-theme');
    expect(body).toContain('popover="manual" hidden');
    expect(body).toContain('Parent / Alpha');
    expect(head).toContain('data-ant-svelte-theme="cascader-ssr"');
  });

  it('keeps Select aliases out of the standalone Panel', () => {
    const { body } = render(CascaderThemeFixture, {
      props: { preset: 'select-only', panelOnly: true }
    });

    expect(body).toContain('--ant-cascader-control-width:184px');
    expect(body).not.toContain('--ant-select-');
    expect(body).not.toContain('--ant-font-size:25px');
    expect(body).not.toContain('ant-select-css-var');
    expect(body).not.toContain('popover=');
  });

  it('renders compact option padding and tag dimensions', () => {
    const { body } = render(CascaderThemeFixture, { props: { preset: 'compact' } });

    expect(body).toContain('--ant-cascader-option-padding:4px 8px');
    expect(body).toContain('--ant-select-multiple-item-height:20px');
  });

  it('preserves explicit zero dimensions and unitless weights', () => {
    const { body } = render(CascaderThemeFixture, { props: { preset: 'zero' } });

    expect(body).toContain('--ant-cascader-control-width:0px');
    expect(body).toContain('--ant-cascader-dropdown-height:0px');
    expect(body).toContain('--ant-cascader-option-selected-font-weight:0;');
  });

  it('inherits undefined dimensions without restoring vendor defaults', () => {
    const { body } = render(CascaderThemeFixture, { props: { preset: 'undefined' } });

    expect(body).toContain('--ant-cascader-control-width:inherit');
    expect(body).toContain('--ant-cascader-option-padding:inherit');
  });

  it('bridges custom prefixes', () => {
    const { body } = render(CascaderThemeFixture, { props: { preset: 'custom-prefix' } });

    expect(body).toContain('--cas-2-cascader-control-width:205px');
    expect(body).toContain('--ant-cascader-control-width:var(--cas-2-cascader-control-width)');
  });

  it('retains CSS lengths and string font weights', () => {
    const { body } = render(CascaderThemeFixture, { props: { preset: 'css-lengths' } });

    expect(body).toContain('--ant-cascader-control-width:40vw');
    expect(body).toContain('--ant-cascader-option-selected-font-weight:bold;');
  });

  it('leaves native-only themes free of source variables and scope markers', () => {
    const { body, head } = render(CascaderThemeFixture, { props: { native: true } });

    expect(body).not.toContain('ant-cascader-source-theme');
    expect(body).not.toContain('--ant-cascader-control-width:');
    expect(head).not.toContain('data-ant-svelte-theme=');
  });
});
