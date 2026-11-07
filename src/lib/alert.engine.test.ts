import { describe, expect, it } from 'vitest';
import { resolveAlertClose } from './alert.engine';
import type { AlertConfig, AlertProps } from './alert.types';

describe('resolveAlertClose', () => {
  const cases: [string, AlertProps, AlertConfig | undefined, boolean, unknown][] = [
    ['default', {}, undefined, false, undefined],
    ['local icon', { closable: { closeIcon: 'Local' } }, undefined, true, 'Local'],
    ['explicit false', { closable: false }, { closable: { closeIcon: 'Context' } },
      false, 'Context'],
    ['local icon priority', { closable: { closeIcon: 'Local' } },
      { closable: { closeIcon: 'Context' } }, true, 'Local'],
    ['zero object icon fallback', { closable: { closeIcon: 0 } },
      { closable: { closeIcon: 'Context' } }, true, 'Context'],
    ['false object icon fallback', { closable: { closeIcon: false } },
      { closable: { closeIcon: 'Context' } }, true, 'Context'],
    ['native empty object icon', { closable: { closeIcon: '' } }, undefined, true, ''],
    ['context object icon', {}, { closable: { closeIcon: 'Object' } }, true, 'Object'],
    ['context empty icon fallback', {}, { closable: { closeIcon: '' } }, true, undefined],
    ['context zero icon fallback', {}, { closable: { closeIcon: 0 } }, true, undefined]
  ];

  it.each(cases)('resolves %s without losing explicit values', (_, props, config, enabled, icon) => {
    const result = resolveAlertClose(props, config);

    expect(result.enabled).toBe(enabled);
    expect(result.icon).toBe(icon);
  });

  it('keeps local callbacks and context ARIA separate', () => {
    const localClose = () => {};
    const afterClose = () => {};
    const props: AlertProps = {
      closable: { disabled: true, onClose: localClose, afterClose, 'data-owner': 'local' }
    };
    const result = resolveAlertClose(props, { closable: { 'aria-label': 'Context close' } });

    expect(result.onClose).toBe(localClose);
    expect(result.afterClose).toBe(afterClose);
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
