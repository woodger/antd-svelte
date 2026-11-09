import { describe, expect, it } from 'vitest';
import { getMessagePrefixCss } from './message-prefix.engine';

describe('Message prefix stylesheet', () => {
  it('keeps the canonical stylesheet without an extra sheet', () => {
    expect(getMessagePrefixCss('ant-message', 'ant')).toBeUndefined();
  });

  it('isolates local list/notice classes and separates shared private metrics from tokens', () => {
    const css = getMessagePrefixCss('toast', 'suite')!;

    expect(css).toContain('.toast:where([data-ant-message-prefix="toast"][data-ant-message-root-prefix="suite"])');
    expect(css).toContain('.toast-notice-icon.toast-notice-icon-success');
    expect(css).toContain('--suite-notification-title-font-size');
    expect(css).toContain('--ant-message-content-padding');
    expect(css).not.toContain('.ant-message-notice');
    expect(getMessagePrefixCss('toast', 'suite.inner')).toContain('--suiteinner-notification-icon-font-size');
  });

  it('uses literal prefix text and escapes closing style tags', () => {
    expect(getMessagePrefixCss('toast-$&', 'suite')).toContain('.toast-$&-notice');
    expect(getMessagePrefixCss('toast-</style><script>', 'suite')).not.toContain('</style');
  });
});
