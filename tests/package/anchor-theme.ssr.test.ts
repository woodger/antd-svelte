import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import AnchorThemeFixture from './AnchorThemeFixture.svelte';

describe('Source Anchor theme SSR', () => {
  it('renders source variables and native links before browser callbacks', () => {
    const { body, head } = render(AnchorThemeFixture);

    expect(body).toContain('--ant-anchor-link-padding-block:4px');
    expect(body).toContain('--ant-anchor-link-padding-inline-start:16px');
    expect(body).toContain('ant-anchor-source-theme');
    expect(body).toContain('href="#overview"');
    expect(body).toContain('href="#details"');
    expect(body).not.toContain('ant-anchor-link-title-active');
    expect(head).toContain('data-ant-svelte-theme="anchor-ssr"');
  });

  it('uses source compact padding without changing the native compact contract', () => {
    const { body } = render(AnchorThemeFixture, { props: { preset: 'compact' } });

    expect(body).toContain('--ant-anchor-link-padding-block:4px');
    expect(body).toContain('--ant-anchor-link-padding-inline-start:8px');
  });

  it('preserves component padding and its separate nested-spacing alias', () => {
    const { body } = render(AnchorThemeFixture, { props: { preset: 'own-tokens' } });

    expect(body).toContain('--ant-anchor-link-padding-block:9px');
    expect(body).toContain('--ant-anchor-link-padding-inline-start:27px');
    expect(body).toContain('--ant-padding-xxs:6px');
  });

  it('keeps zero padding and removes undefined vendor defaults', () => {
    const zero = render(AnchorThemeFixture, { props: { preset: 'zero' } }).body;
    const missing = render(AnchorThemeFixture, { props: { preset: 'undefined' } }).body;

    expect(zero).toContain('--ant-anchor-link-padding-block:0px');
    expect(zero).toContain('--ant-anchor-link-padding-inline-start:0px');
    expect(missing).toContain('--ant-anchor-link-padding-block:inherit');
    expect(missing).toContain('--ant-anchor-link-padding-inline-start:inherit');
  });

  it('bridges custom CSS prefixes', () => {
    const { body } = render(AnchorThemeFixture, { props: { preset: 'custom-prefix' } });

    expect(body).toContain('--anc-2-anchor-link-padding-block:7px');
    expect(body).toContain('--ant-anchor-link-padding-block:var(--anc-2-anchor-link-padding-block)');
  });

  it('renders component link decorations for normal, hover and focus states', () => {
    const { body } = render(AnchorThemeFixture, { props: { preset: 'own-decorations' } });

    expect(body).toContain('--ant-link-decoration:underline');
    expect(body).toContain('--ant-link-hover-decoration:overline');
    expect(body).toContain('--ant-link-focus-decoration:line-through');
  });

  it('keeps semantic and plain style priority after source variables', () => {
    const { body } = render(AnchorThemeFixture, {
      props: { preset: 'own-tokens', semantic: true }
    });

    expect(body).toContain('max-height:calc(100vh - 30px);--ant-anchor-link-padding-inline-start:31px;max-height:200px;--ant-anchor-link-padding-inline-start:37px;max-height:100px');
  });

  it('retains source scope inside the default Affix wrapper', () => {
    const { body, head } = render(AnchorThemeFixture, { props: { affix: true } });

    expect(body).toContain('--ant-anchor-link-padding-inline-start:16px');
    expect(body).toContain('ant-anchor-wrapper ant-anchor-css-var anchor-ssr');
    expect(head).toContain('data-ant-svelte-theme="anchor-ssr"');
  });

  it('leaves native-only themes free of source variables and scopes', () => {
    const { body, head } = render(AnchorThemeFixture, { props: { native: true } });

    expect(body).not.toContain('--ant-anchor-link-padding-block:');
    expect(body).not.toContain('--ant-anchor-link-padding-inline-start:');
    expect(body).not.toContain('ant-anchor-css-var anchor-ssr');
    expect(body).not.toContain('ant-anchor-source-theme');
    expect(head).not.toContain('data-ant-svelte-theme=');
  });
});
