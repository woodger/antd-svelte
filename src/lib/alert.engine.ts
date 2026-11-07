import type { AlertCloseAttributes, AlertConfig, AlertProps } from './alert.types';

/** Приоритеты closable; прежний local closeIcon='' остаётся пустым. */
export function resolveAlertClose(props: AlertProps, config?: AlertConfig) {
  const { closable } = props;
  const local = closable && typeof closable === 'object' ? closable : undefined;
  const inherited = config?.closable && typeof config.closable === 'object'
    ? config.closable : undefined;
  const attributes = closable ?? config?.closable;
  const enabled = typeof closable === 'boolean' ? closable : local ? true
    : Boolean(config?.closable);
  const icon = local?.closeIcon || inherited?.closeIcon || undefined;

  return {
    enabled,
    icon: local?.closeIcon === '' ? '' : icon,
    disabled: local?.disabled,
    onClose: local?.onClose,
    afterClose: local?.afterClose,
    attributes: attributes && typeof attributes === 'object'
      ? Object.fromEntries(Object.entries(attributes).filter(([name]) =>
        name === 'role' || name.startsWith('aria-') || name.startsWith('data-')
      )) as AlertCloseAttributes : {}
  };
}
