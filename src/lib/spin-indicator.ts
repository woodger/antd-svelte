import type { SpinConfig, SpinIndicator, SpinProps } from './spin.types';

let defaultIndicator: SpinIndicator | null | undefined;

/** Как upstream setter: сам вызов не обновляет уже смонтированные экземпляры. */
export function setDefaultSpinIndicator(indicator: SpinIndicator | null | undefined) {
  defaultIndicator = indicator;
}

export function resolveSpinIndicator(props: SpinProps, config: SpinConfig | undefined) {
  return props.indicator ?? config?.indicator ?? defaultIndicator;
}
