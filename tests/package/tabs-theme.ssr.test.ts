import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import TabsThemeFixture from './TabsThemeFixture.svelte';

describe('Source Tabs theme SSR', () => {
  it('renders component defaults and popup inheritance without browser callbacks', () => {
    const { body, head } = render(TabsThemeFixture);

    expect(body).toContain('ant-tabs-source-theme');
    expect(body).toContain('--ant-tabs-card-height:40px');
    expect(body).toContain('--ant-tabs-card-padding:8px 16px');
    expect(body).toContain('--ant-tabs-card-height:inherit');
    expect(body).toContain('aria-selected="true"');
    expect(head).toContain('data-ant-svelte-theme="tabs-theme-ssr"');
  });

  it('uses overridden heights before calculating padding defaults', () => {
    const { body } = render(TabsThemeFixture, { props: { preset: 'own-tokens' } });

    expect(body).toContain('--ant-tabs-card-height:45.5px');
    expect(body).toContain('--ant-tabs-card-padding:10.75px 16px');
    expect(body).toContain('--ant-tabs-card-padding-sm:5.25px 8px');
    expect(body).toContain('--ant-tabs-z-index-popup:1234');
  });

  it('keeps zero and explicit undefined values without restoring vendor defaults', () => {
    const zero = render(TabsThemeFixture, { props: { preset: 'zero' } }).body;
    const missing = render(TabsThemeFixture, { props: { preset: 'undefined' } }).body;

    expect(zero).toContain('--ant-tabs-card-height:0px');
    expect(zero).toContain('--ant-tabs-card-padding:8px 16px');
    expect(zero).toContain('--ant-tabs-z-index-popup:0');
    expect(missing).not.toContain('--ant-tabs-card-height:40px');
    expect(missing).toContain('--ant-tabs-card-height:inherit');
  });

  it('bridges custom prefixes and keeps local styles after prepared declarations', () => {
    const prefix = render(TabsThemeFixture, { props: { preset: 'custom-prefix' } }).body;
    const custom = render(TabsThemeFixture, { props: { override: true } }).body;

    expect(prefix).toContain('--tabs-x-tabs-card-height:43px');
    expect(prefix).toContain('--ant-tabs-card-height:var(--tabs-x-tabs-card-height)');
    expect(custom.indexOf('--ant-tabs-card-height:40px'))
      .toBeLessThan(custom.indexOf('--ant-tabs-card-height:51px'));
  });

  it('preserves native themes without source scope classes or component declarations', () => {
    const { body, head } = render(TabsThemeFixture, { props: { native: true } });

    expect(body).not.toContain('ant-tabs-source-theme');
    expect(body).not.toContain('--ant-tabs-card-height:');
    expect(head).not.toContain('data-ant-svelte-theme=');
  });
});
