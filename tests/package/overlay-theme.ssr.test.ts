import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import OverlayThemeFixture from './OverlayThemeFixture.svelte';

describe('Source Tooltip/Popover/Popconfirm theme SSR', () => {
  it('renders qualified dimensions, unitless z-index and shared arrow paths before attachment', () => {
    const { body, head } = render(OverlayThemeFixture);

    expect(body).toContain('--ant-tooltip-max-width:250px');
    expect(body).toContain('--ant-tooltip-z-index-popup:1070;');
    expect(body).not.toContain('--ant-tooltip-z-index-popup:1070px');
    expect(body).toContain('--ant-popover-title-min-width:177px');
    expect(body).toContain('--ant-popover-inner-padding:12px');
    expect(body).toContain('--ant-popconfirm-z-index-popup:1060');
    expect(body).toContain('--ant-tooltip-arrow-path:path(');
    expect(body).toContain('--ant-popover-arrow-path:path(');
    expect(head).toContain('data-ant-svelte-theme="overlay-ssr"');
  });

  it('renders the source wireframe title/body padding and border', () => {
    const { body } = render(OverlayThemeFixture, { props: { preset: 'wireframe' } });

    expect(body).toContain('--ant-popover-inner-padding:0px');
    expect(body).toContain('--ant-popover-title-padding:5px 16px 4px');
    expect(body).toContain('--ant-popover-title-border-bottom:1px solid rgba(5,5,5,0.06)');
    expect(body).toContain('--ant-popover-inner-content-padding:12px 16px');
  });

  it('retains inherited undefined values instead of reintroducing vendor defaults', () => {
    const { body } = render(OverlayThemeFixture, { props: { preset: 'undefined-component-values' } });

    expect(body).toContain('--ant-tooltip-max-width:inherit');
    expect(body).toContain('--ant-tooltip-arrow-path:inherit');
    expect(body).toContain('--ant-popover-title-min-width:inherit');
    expect(body).toContain('--ant-popover-inner-padding:inherit');
    expect(body).toContain('--ant-popconfirm-z-index-popup:inherit');
  });

  it('bridges custom prefixes for all three style hooks', () => {
    const { body } = render(OverlayThemeFixture, { props: { preset: 'custom-prefix' } });

    expect(body).toContain('--overlay-2-tooltip-max-width:290px');
    expect(body).toContain('--ant-tooltip-max-width:var(--overlay-2-tooltip-max-width)');
    expect(body).toContain('--overlay-2-popover-title-min-width:230px');
    expect(body).toContain('--overlay-2-popconfirm-z-index-popup:1750');
  });

  it('applies Popconfirm aliases after Popover aliases and resets the nested owner', () => {
    const { body } = render(OverlayThemeFixture, { props: { preset: 'composed-aliases' } });
    const confirm = body.match(/<div[^>]+class="ant-popover ant-popover-css-var [^"]*ant-popconfirm[^"]*"[^>]*>/)?.[0];

    expect(confirm).toMatch(/--ant-font-size:30px;.*--ant-font-size:22px;.*--ant-font-size:18px/);
    expect(body).toContain('--ant-popconfirm-z-index-popup:1060');
  });

  it('keeps native-only overlays free of source popup variables and scopes', () => {
    const { body, head } = render(OverlayThemeFixture, { props: { native: true } });

    expect(body).toContain('data-ant-compact="true"');
    expect(body).not.toContain('--ant-tooltip-max-width:');
    expect(body).not.toContain('--ant-popover-inner-padding:');
    expect(body).not.toContain('--ant-popconfirm-z-index-popup:');
    expect(head).not.toContain('data-ant-svelte-theme=');
  });
});
