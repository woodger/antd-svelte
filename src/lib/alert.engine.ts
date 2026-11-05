import type { AlertCloseAttributes, AlertConfig, AlertProps } from './alert.types';

/** Исходные close priorities; прежний local closeIcon='' остаётся пустым. */
export function resolveAlertClose(props: AlertProps, config?: AlertConfig) {
  const { closable, closeIcon, closeText } = props;
  const local = closable && typeof closable === 'object' ? closable : undefined;
  const inherited = config?.closable && typeof config.closable === 'object'
    ? config.closable : undefined;
  const attributes = closable ?? config?.closable;
  const enabled = local ? true : closeText ? true : typeof closable === 'boolean'
    ? closable : closeIcon !== false && closeIcon != null ? true : Boolean(config?.closable);
  const icon = local?.closeIcon || closeText || (closeIcon !== undefined ? closeIcon
    : inherited?.closeIcon || config?.closeIcon);

  return {
    enabled,
    icon: local?.closeIcon === '' ? '' : icon,
    disabled: local?.disabled,
    onClose: local?.onClose ?? props.onClose,
    afterClose: local?.afterClose ?? props.afterClose,
    attributes: attributes && typeof attributes === 'object'
      ? Object.fromEntries(Object.entries(attributes).filter(([name]) =>
        name === 'role' || name.startsWith('aria-') || name.startsWith('data-')
      )) as AlertCloseAttributes : {}
  };
}
