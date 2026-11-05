import { describe, expect, it } from 'vitest';
import { resolveAlertClose } from './alert.engine';
import type { AlertConfig, AlertProps } from './alert.types';

describe('resolveAlertClose', () => {
  const cases: [string, AlertProps, AlertConfig | undefined, boolean, unknown][] = [
    ['default', {}, undefined, false, undefined],
    ['zero icon', { closeIcon: 0 }, undefined, true, 0],
    ['empty legacy icon', { closeIcon: '' }, undefined, true, ''],
    ['explicit false', { closable: false, closeIcon: 'Close' }, undefined, false, 'Close'],
    ['close text priority', { closable: false, closeText: 'Dismiss' }, undefined, true, 'Dismiss'],
    ['local icon priority', { closable: { closeIcon: 'Local' }, closeText: 'Text' },
      undefined, true, 'Local'],
    ['zero object icon fallback', { closable: { closeIcon: 0 }, closeIcon: 'Legacy' },
      undefined, true, 'Legacy'],
    ['false object icon fallback', { closable: { closeIcon: false }, closeIcon: 'Legacy' },
      undefined, true, 'Legacy'],
    ['native empty object icon', { closable: { closeIcon: '' } }, undefined, true, ''],
    ['context icon', {}, { closable: true, closeIcon: 'Context' }, true, 'Context'],
    ['context object icon', {}, { closable: { closeIcon: 'Object' }, closeIcon: 'Context' },
      true, 'Object'],
    ['null legacy icon override', { closeIcon: null }, { closable: true, closeIcon: 'Context' },
      true, null]
  ];

  it.each(cases)('resolves %s without losing explicit values', (_, props, config, enabled, icon) => {
    const result = resolveAlertClose(props, config);

    expect(result.enabled).toBe(enabled);
    expect(result.icon).toBe(icon);
  });

  it('uses local callbacks before legacy fallbacks and keeps context ARIA separate', () => {
    const localClose = () => {};
    const legacyClose = () => {};
    const legacyAfter = () => {};
    const props: AlertProps = {
      closable: { disabled: true, onClose: localClose, 'data-owner': 'local' },
      onClose: legacyClose, afterClose: legacyAfter
    };
    const result = resolveAlertClose(props, { closable: { 'aria-label': 'Context close' } });

    expect(result.onClose).toBe(localClose);
    expect(result.afterClose).toBe(legacyAfter);
    expect(result.disabled).toBe(true);
    expect(result.attributes).toEqual({ 'data-owner': 'local' });
  });

  it('inherits context ARIA only when the local closable value is nullish', () => {
    const config: AlertConfig = { closable: { 'aria-label': 'Context close' } };
    const inherited = resolveAlertClose({}, config);
    const reset = resolveAlertClose({ closable: true }, config);

    expect(inherited.attributes).toEqual({ 'aria-label': 'Context close' });
    expect(reset.attributes).toEqual({});
  });
});
