import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import BreadcrumbThemeFixture from './BreadcrumbThemeFixture.svelte';

describe('Source Breadcrumb theme SSR', () => {
  it('renders scoped defaults, separators and native links before browser callbacks', () => {
    const { body, head } = render(BreadcrumbThemeFixture);

    expect(body).toContain('--ant-breadcrumb-icon-font-size:14px');
    expect(body).toContain('--ant-breadcrumb-separator-margin:8px');
    expect(body).toContain('ant-breadcrumb-source-theme');
    expect(body).toContain('href="/home"');
    expect(body).toContain('href="/section/one"');
    expect(body).toContain('aria-hidden="true"');
    expect(head).toContain('data-ant-svelte-theme="breadcrumb-ssr"');
  });

  it('uses source compact icon size', () => {
    const { body } = render(BreadcrumbThemeFixture, { props: { preset: 'compact' } });

    expect(body).toContain('--ant-breadcrumb-icon-font-size:12px');
  });

  it('keeps component colors and separator spacing', () => {
    const { body } = render(BreadcrumbThemeFixture, { props: { preset: 'own-tokens' } });

    expect(body).toContain('--ant-breadcrumb-item-color:#123456');
    expect(body).toContain('--ant-breadcrumb-link-color:#335577');
    expect(body).toContain('--ant-breadcrumb-link-hover-color:#776633');
    expect(body).toContain('--ant-breadcrumb-separator-margin:15px');
  });

  it('preserves zero dimensions and inherits undefined values', () => {
    const zero = render(BreadcrumbThemeFixture, { props: { preset: 'zero' } }).body;
    const missing = render(BreadcrumbThemeFixture, { props: { preset: 'undefined' } }).body;

    expect(zero).toContain('--ant-breadcrumb-icon-font-size:0px');
    expect(zero).toContain('--ant-breadcrumb-separator-margin:0px');
    expect(missing).toContain('--ant-breadcrumb-item-color:inherit');
    expect(missing).toContain('--ant-breadcrumb-separator-margin:inherit');
  });

  it('bridges custom prefixes and retains runtime CSS lengths', () => {
    const prefix = render(BreadcrumbThemeFixture, { props: { preset: 'custom-prefix' } }).body;
    const lengths = render(BreadcrumbThemeFixture, { props: { preset: 'css-lengths' } }).body;

    expect(prefix).toContain('--brc-2-breadcrumb-separator-margin:13px');
    expect(prefix).toContain('--ant-breadcrumb-separator-margin:var(--brc-2-breadcrumb-separator-margin)');
    expect(lengths).toContain('--ant-breadcrumb-separator-margin:1.2em');
    expect(lengths).toContain('--ant-breadcrumb-icon-font-size:1.5em');
  });

  it('keeps semantic and plain styles after component defaults', () => {
    const { body } = render(BreadcrumbThemeFixture, { props: { semantic: true } });

    expect(body).toContain('--ant-breadcrumb-separator-margin:8px;--ant-breadcrumb-separator-margin:21px;--ant-breadcrumb-separator-margin:27px');
  });

  it('leaves native-only themes free of source markers and declarations', () => {
    const { body, head } = render(BreadcrumbThemeFixture, { props: { native: true } });

    expect(body).not.toContain('ant-breadcrumb-source-theme');
    expect(body).not.toContain('--ant-breadcrumb-separator-margin:');
    expect(head).not.toContain('data-ant-svelte-theme=');
  });
});
