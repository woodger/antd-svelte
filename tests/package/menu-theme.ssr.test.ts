import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import MenuThemeFixture from './MenuThemeFixture.svelte';

describe('Source Menu theme SSR', () => {
  it('renders root and hidden popup variables before browser callbacks', () => {
    const { body, head } = render(MenuThemeFixture);

    expect(body).toContain('--ant-menu-item-height:40px');
    expect(body).toContain('--ant-menu-dropdown-width:160px');
    expect(body).toContain('--ant-menu-group-title-line-height:1.5714285714285714;');
    expect(body).toContain('--ant-menu-z-index-popup:1050;');
    expect(body).not.toContain('--ant-menu-z-index-popup:1050px');
    expect(body).toContain('ant-menu-source-theme');
    expect(body).toContain('popover="manual" hidden');
    expect(body).toContain('href="/overview"');
    expect(body).toContain('aria-expanded="true"');
    expect(head).toContain('data-ant-svelte-theme="menu-ssr"');
  });

  it('inherits owning variables in nested inline lists instead of vendor defaults', () => {
    const { body } = render(MenuThemeFixture, { props: { preset: 'own-tokens', mode: 'inline' } });

    expect(body).toContain('--ant-menu-item-height:44px');
    expect(body).toContain('--ant-menu-item-height:inherit');
    expect(body).toContain('--ant-menu-group-title-line-height:1.7;');
    expect(body).toContain('color:inherit;font:inherit');
    expect(body).not.toContain('popover=');
  });

  it('uses source compact metrics', () => {
    const { body } = render(MenuThemeFixture, { props: { preset: 'compact' } });

    expect(body).toContain('--ant-menu-item-height:35px');
    expect(body).toContain('--ant-menu-collapsed-width:70px');
    expect(body).toContain('--ant-menu-horizontal-line-height:40.25px');
  });

  it('maps deprecated names after preparing derived widths', () => {
    const { body } = render(MenuThemeFixture, { props: { preset: 'legacy-tokens' } });

    expect(body).toContain('--ant-menu-item-border-radius:15px');
    expect(body).toContain('--ant-menu-active-bar-width:7px');
    expect(body).toContain('--ant-menu-active-bar-border-width:3px');
    expect(body).toContain('--ant-menu-item-width:calc(100% - 8px)');
  });

  it('keeps current zero values when deprecated names conflict', () => {
    const { body } = render(MenuThemeFixture, { props: { preset: 'legacy-conflicts' } });

    expect(body).toContain('--ant-menu-color-active-bar-width:8px');
    expect(body).toContain('--ant-menu-active-bar-width:0px');
    expect(body).toContain('--ant-menu-active-bar-height:0px');
    expect(body).toContain('--ant-menu-active-bar-border-width:0px');
  });

  it('preserves explicit zero dimensions and unitless values', () => {
    const { body } = render(MenuThemeFixture, { props: { preset: 'zero' } });

    expect(body).toContain('--ant-menu-item-height:0px');
    expect(body).toContain('--ant-menu-dropdown-width:0px');
    expect(body).toContain('--ant-menu-group-title-line-height:0;');
    expect(body).toContain('--ant-menu-z-index-popup:0;');
  });

  it('inherits undefined dimensions without restoring vendor defaults', () => {
    const { body } = render(MenuThemeFixture, { props: { preset: 'undefined' } });

    expect(body).toContain('--ant-menu-item-height:inherit');
    expect(body).toContain('--ant-menu-dropdown-width:inherit');
    expect(body).toContain('--ant-menu-item-border-radius:inherit');
  });

  it('bridges custom CSS prefixes', () => {
    const { body } = render(MenuThemeFixture, { props: { preset: 'custom-prefix' } });

    expect(body).toContain('--mnu-2-menu-dropdown-width:195px');
    expect(body).toContain('--ant-menu-dropdown-width:var(--mnu-2-menu-dropdown-width)');
  });

  it('keeps source CSS strings including invalid derived lengths', () => {
    const { body } = render(MenuThemeFixture, { props: { preset: 'css-lengths' } });

    expect(body).toContain('--ant-menu-dropdown-width:13em');
    expect(body).toContain('--ant-menu-item-height:2.7em');
    expect(body).toContain('--ant-menu-group-title-line-height:24px');
    // Upstream добавляет px к строковому activeBarBorderWidth без нормализации.
    expect(body).toContain('--ant-menu-item-width:calc(100% + 2pxpx)');
  });

  it('keeps plain root overrides after source declarations', () => {
    const { body } = render(MenuThemeFixture, { props: { override: true } });

    expect(body).toContain('--ant-menu-item-width:calc(100% - 8px);--ant-menu-item-selected-bg:#ffddee');
  });

  it('leaves native-only themes free of source variables and markers', () => {
    const { body, head } = render(MenuThemeFixture, { props: { native: true } });

    expect(body).not.toContain('ant-menu-source-theme');
    expect(body).not.toContain('--ant-menu-item-height:');
    expect(head).not.toContain('data-ant-svelte-theme=');
  });
});
