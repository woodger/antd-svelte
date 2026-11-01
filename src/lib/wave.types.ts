import type { GlobalToken } from './theme-component-token.types';

export type WaveComponent = 'Tag' | 'Button' | 'Checkbox' | 'Radio' | 'Switch' | 'Steps';
export type WaveTriggerType = 'click' | 'pointerdown' | 'pointerup' | 'mousedown' | 'mouseup';
export type WaveColorSource = 'color' | 'backgroundColor' | 'borderColor' | null;

/** Данные source Wave; event — нативное событие, token — полный текущий GlobalToken. */
export interface WaveEffectInfo {
  className: string;
  token: GlobalToken;
  component?: WaveComponent;
  event: MouseEvent;
  hashId: string;
  colorSource?: WaveColorSource;
}

/** Заменяет стандартный эффект; созданными ресурсами управляет callback. */
export type ShowWaveEffect = (element: HTMLElement, info: WaveEffectInfo) => void;

/** Настройки заменяют родительский wave record целиком; события control не подавляются. */
export interface WaveConfig {
  /** Отключает только эффект. По умолчанию false. */
  disabled?: boolean;
  showEffect?: ShowWaveEffect;
  /** Capture-событие; события одного animation frame объединяются. По умолчанию click. */
  triggerType?: WaveTriggerType;
}
