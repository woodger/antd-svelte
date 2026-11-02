import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import DropdownThemeFixture from './DropdownThemeFixture.svelte';

describe('Source Dropdown theme SSR', () => {
  it('renders hidden popup variables and native links before browser callbacks', () => {
    const { body, head } = render(DropdownThemeFixture);

    expect(body).toContain('--ant-dropdown-padding-block:5px');
    expect(body).toContain('--ant-dropdown-arrow-offset-horizontal:12px');
    expect(body).toContain('--ant-dropdown-arrow-offset-vertical:8px');
    expect(body).toContain('--ant-dropdown-z-index-popup:1050;');
    expect(body).not.toContain('--ant-dropdown-z-index-popup:1050px');
    expect(body).toContain('ant-dropdown-source-theme');
    expect(body).toContain('popover="manual"');
    expect(body).toContain('href="/overview"');
    expect(head).toContain('data-ant-svelte-theme="dropdown-ssr"');
  });

  it('uses source compact padding', () => {
    const { body } = render(DropdownThemeFixture, { props: { preset: 'compact' } });

    expect(body).toContain('--ant-dropdown-padding-block:4px');
  });

  it('prepares defaults from component aliases', () => {
    const { body } = render(DropdownThemeFixture, { props: { preset: 'own-aliases' } });

    expect(body).toContain('--ant-font-size:20px');
    expect(body).toContain('--ant-dropdown-padding-block:7px');
    expect(body).toContain('--ant-dropdown-arrow-offset-horizontal:16px');
    expect(body).toContain('--ant-color-bg-elevated:#ffeedd');
  });

  it('preserves zero padding, arrow offsets and z-index', () => {
    const { body } = render(DropdownThemeFixture, { props: { preset: 'zero' } });

    expect(body).toContain('--ant-dropdown-padding-block:0px');
    expect(body).toContain('--ant-dropdown-arrow-offset-horizontal:0px');
    expect(body).toContain('--ant-dropdown-arrow-shadow-width:0px');
    expect(body).toContain('--ant-dropdown-z-index-popup:0;');
  });

  it('keeps Dropdown and Menu aliases in their separate scopes', () => {
    const { body } = render(DropdownThemeFixture, { props: { preset: 'both-aliases' } });

    expect(body).toContain('--ant-font-size:20px');
    expect(body).toContain('--ant-font-size:26px');
    expect(body).toContain('--ant-dropdown-padding-block:9px');
    expect(body).toContain('--ant-control-padding-horizontal:14px');
  });

  it('inherits undefined defaults instead of restoring static vendor values', () => {
    const { body } = render(DropdownThemeFixture, { props: { preset: 'undefined' } });

    expect(body).toContain('--ant-dropdown-padding-block:inherit');
    expect(body).toContain('--ant-dropdown-arrow-offset-horizontal:inherit');
    expect(body).toContain('--ant-dropdown-arrow-shadow-width:inherit');
  });

  it('bridges custom CSS prefixes and preserves CSS strings', () => {
    const prefixed = render(DropdownThemeFixture, { props: { preset: 'custom-prefix' } }).body;
    const lengths = render(DropdownThemeFixture, { props: { preset: 'css-lengths' } }).body;

    expect(prefixed).toContain('--drp-2-dropdown-padding-block:7px');
    expect(prefixed).toContain('--ant-dropdown-padding-block:var(--drp-2-dropdown-padding-block)');
    expect(lengths).toContain('--ant-dropdown-padding-block:0.4em');
    expect(lengths).toContain('--ant-dropdown-arrow-offset-horizontal:2em');
  });

  it('applies Menu aliases inside the list and leaves native-only themes free of source styles', () => {
    const isolated = render(DropdownThemeFixture, { props: { preset: 'menu-only' } }).body;
    const native = render(DropdownThemeFixture, { props: { native: true } });

    expect(isolated).toContain('--ant-font-size:30px');
    expect(isolated).toContain('--ant-menu-item-height:80px');
    expect(isolated).toContain('--ant-dropdown-padding-block:5px');
    expect(native.body).not.toContain('ant-dropdown-source-theme');
    expect(native.body).not.toContain('--ant-dropdown-padding-block:');
    expect(native.head).not.toContain('data-ant-svelte-theme=');
  });
});
