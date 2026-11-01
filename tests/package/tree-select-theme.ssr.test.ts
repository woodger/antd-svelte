import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import TreeSelectThemeFixture from './TreeSelectThemeFixture.svelte';

describe('Source TreeSelect theme SSR', () => {
  it('renders both component scopes and popup variables before browser effects', () => {
    const { body, head } = render(TreeSelectThemeFixture);

    expect(body).toContain('--ant-select-multiple-item-height:24px');
    expect(body).toContain('--ant-tree-select-title-height:24px');
    expect(body).toContain('--ant-tree-select-indent-size:24px');
    expect(body).toContain('ant-tree-select-source-popup');
    expect(body).toContain('ant-tree-select-source-tree');
    expect(body).toContain('name="project" value="a"');
    expect(body).toContain('name="teams" value="a"');
    expect(body).toContain('width:240px');
    expect(head).toContain('data-ant-svelte-theme="tree-select-ssr"');
  });

  it('renders compact tree metrics and Select tag dimensions', () => {
    const { body } = render(TreeSelectThemeFixture, { props: { preset: 'compact' } });

    expect(body).toContain('--ant-tree-select-title-height:21px');
    expect(body).toContain('--ant-tree-select-switcher-size:21px');
    expect(body).toContain('--ant-select-multiple-item-height:20px');
  });

  it('preserves explicit zero component dimensions', () => {
    const { body } = render(TreeSelectThemeFixture, { props: { preset: 'zero' } });

    expect(body).toContain('--ant-tree-select-title-height:0px');
    expect(body).toContain('--ant-tree-select-indent-size:0px');
  });

  it('inherits undefined dimensions without restoring vendor defaults', () => {
    const { body } = render(TreeSelectThemeFixture, { props: { preset: 'undefined' } });

    expect(body).toContain('--ant-tree-select-title-height:inherit');
    expect(body).toContain('--ant-tree-select-indent-size:inherit');
  });

  it('bridges custom prefixes for both style hooks', () => {
    const { body } = render(TreeSelectThemeFixture, { props: { preset: 'custom-prefix' } });

    expect(body).toContain('--tree-2-tree-select-title-height:30px');
    expect(body).toContain('--ant-tree-select-title-height:var(--tree-2-tree-select-title-height)');
    expect(body).toContain('--tree-2-select-option-height:32px');
  });

  it('leaves native-only styles free of source scopes and declarations', () => {
    const { body, head } = render(TreeSelectThemeFixture, { props: { native: true } });

    expect(body).not.toContain('ant-select-source-theme');
    expect(body).not.toContain('ant-tree-select-source-tree');
    expect(body).not.toContain('--ant-tree-select-title-height:');
    expect(head).not.toContain('data-ant-svelte-theme=');
  });
});
