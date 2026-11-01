import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import AvatarBadgeThemeFixture from './AvatarBadgeThemeFixture.svelte';

describe('Source Avatar/AvatarGroup/Badge theme SSR', () => {
  it('renders prepared dimensions, group tokens and Badge aliases before browser attachment', () => {
    const { body } = render(AvatarBadgeThemeFixture);

    expect(body).toContain('--ant-avatar-container-size:48px');
    expect(body).toContain('--ant-avatar-text-font-size:21px');
    expect(body).toContain('--ant-avatar-group-border-color:#123456');
    expect(body).toContain('--ant-avatar-group-overlapping:-12px');
    expect(body).toContain('--ant-avatar-group-space:9px');
    expect(body).toContain('--ant-badge-indicator-height:28px');
    expect(body).toContain('--ant-color-border-bg:#fedcba');
    expect(body).toContain('aria-label="Source avatar"');
  });

  it('places the source class on Avatar, group and Badge roots and emits the provider scope', () => {
    const { body, head } = render(AvatarBadgeThemeFixture);

    expect(body).toMatch(/class="ant-avatar ant-avatar-css-var avatar-badge-ssr css-dev-only/);
    expect(body).toMatch(/class="ant-avatar-group ant-avatar-css-var avatar-badge-ssr css-dev-only/);
    expect(body).toMatch(/class="ant-badge ant-badge-css-var avatar-badge-ssr css-dev-only/);
    expect(head).toContain('data-ant-svelte-theme="avatar-badge-ssr"');
  });

  it('keeps undefined tokens inherited without restoring static vendor defaults', () => {
    const { body } = render(AvatarBadgeThemeFixture, { props: { missing: true } });

    expect(body).toContain('--ant-avatar-container-size:inherit');
    expect(body).toContain('--ant-avatar-text-font-size:inherit');
    expect(body).toContain('--ant-avatar-group-border-color:inherit');
    expect(body).toContain('--ant-badge-indicator-height:inherit');
    expect(body).toContain('--ant-badge-dot-size:inherit');
  });

  it('preserves the upstream units for numeric and string Badge z-index/font-weight', () => {
    const strings = render(AvatarBadgeThemeFixture).body;
    const numbers = render(AvatarBadgeThemeFixture, { props: { numeric: true } }).body;

    expect(strings).toContain('--ant-badge-indicator-z-index:9;');
    expect(strings).toContain('--ant-badge-text-font-weight:600;');
    expect(numbers).toContain('--ant-badge-indicator-z-index:7px;');
    expect(numbers).toContain('--ant-badge-text-font-weight:650px;');
  });

  it('bridges custom prefixes without changing component CSS names', () => {
    const { body } = render(AvatarBadgeThemeFixture, { props: { prefix: 'Display2' } });

    expect(body).toContain('--display-2-avatar-container-size:48px');
    expect(body).toContain('--ant-avatar-container-size:var(--display-2-avatar-container-size)');
    expect(body).toContain('--display-2-badge-indicator-height:28px');
    expect(body).toContain('--ant-badge-indicator-height:var(--display-2-badge-indicator-height)');
  });

  it('keeps native-only dark compact themes free of source component tokens and scopes', () => {
    const { body, head } = render(AvatarBadgeThemeFixture, { props: { native: true } });

    expect(body).toContain('data-ant-theme="dark"');
    expect(body).toContain('data-ant-compact="true"');
    expect(body).not.toContain('--ant-avatar-container-size:');
    expect(body).not.toContain('--ant-badge-indicator-height:');
    expect(body).not.toContain('ant-badge-source-tokens');
    expect(head).not.toContain('data-ant-svelte-theme=');
  });
});
