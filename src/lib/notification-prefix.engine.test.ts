import { describe, expect, it } from 'vitest';
import { getNotificationPrefixCss } from './notification-prefix.engine';

describe('Notification prefix stylesheet', () => {
  it('keeps the canonical stylesheet without an extra sheet', () => {
    expect(getNotificationPrefixCss('ant-notification', 'ant')).toBeUndefined();
  });

  it('isolates local lists and separates shared private metrics from component tokens', () => {
    const css = getNotificationPrefixCss('notice', 'suite')!;

    expect(css).toContain('.notice:where([data-ant-notification-prefix="notice"][data-ant-notification-root-prefix="suite"])');
    expect(css).toContain('.notice-topLeft:where(');
    expect(css).toContain('.notice-notice-icon.notice-notice-icon-success');
    expect(css).toContain('--suite-notification-title-font-size');
    expect(css).toContain('--ant-notification-color-success-bg');
    expect(css).toContain('--ant-notification-width');
    expect(css).not.toContain('.ant-notification-notice');
    expect(getNotificationPrefixCss('notice', 'suite.inner')).toContain('--suiteinner-notification-icon-font-size');
  });

  it('uses literal prefix text and escapes closing style tags', () => {
    expect(getNotificationPrefixCss('notice-$&', 'suite')).toContain('.notice-$&-notice');
    expect(getNotificationPrefixCss('notice-</style><script>', 'suite')).not.toContain('</style');
  });
});
