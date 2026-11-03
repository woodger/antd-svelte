import type { FloatButtonConfig, FloatButtonGroupConfig } from './float-button.types';
import type { ButtonConfig } from './button.types';
import type { TabsConfig } from './tabs.types';
import type { RateConfig } from './rate.types';
import type { WatermarkConfig } from './watermark.types';
import type { BorderBeamConfig } from './border-beam.types';
import type { MasonryConfig } from './masonry.types';
import type { SplitterConfig } from './splitter.types';
import type { QRCodeConfig } from './qrcode.types';
import type { CalendarConfig } from './calendar.types';
import type { TimePickerConfig } from './time-picker.types';
import type { CascaderConfig } from './cascader.types';
import type { TransferConfig } from './transfer.types';
import type { PaginationComponentConfig } from './pagination.types';
import type { ListConfig } from './list.types';
import type { ListyConfig } from './listy.types';
import type { TypographyConfig } from './typography.types';
import type { TourConfig } from './tour.types';
import type { CarouselConfig } from './carousel.types';
import type { SliderConfig } from './slider-range.types';
import type { ColorPickerConfig } from './color-picker.types';
import type { InputNumberConfig } from './input-number.types';
import type { RadioConfig } from './radio.types';
import type { CheckboxConfig } from './checkbox.types';
import type { SwitchConfig } from './switch.types';
import type { WaveConfig } from './wave.types';
import type { GetPopupContainer, RenderEmptyHandler } from './types';
import type { RangePickerConfig } from './range-picker.types';
import type { InputConfig } from './input.types';
import type { InputPasswordConfig } from './input-password.types';
import type { InputSearchConfig } from './input-search.types';
import type { InputOTPConfig } from './input-otp.types';
import type { TextAreaConfig } from './textarea.types';
import { getContext, setContext } from 'svelte';
import { ruRU, type ComponentSize, type Locale, type ResolvedThemeConfig } from './types';

export interface ConfigContext {
  readonly tabs?: TabsConfig;
  readonly button?: ButtonConfig;
  readonly rate?: RateConfig;
  readonly watermark?: WatermarkConfig;
  readonly borderBeam?: BorderBeamConfig;
  readonly masonry?: MasonryConfig;
  readonly splitter?: SplitterConfig;
  readonly qrcode?: QRCodeConfig;
  readonly calendar?: CalendarConfig;
  readonly timePicker?: TimePickerConfig;
  readonly cascader?: CascaderConfig;
  readonly transfer?: TransferConfig;
  readonly pagination?: PaginationComponentConfig;
  readonly list?: ListConfig;
  readonly listy?: ListyConfig;
  readonly typography?: TypographyConfig;
  readonly tour?: TourConfig;
  readonly carousel?: CarouselConfig;
  readonly slider?: SliderConfig;
  readonly colorPicker?: ColorPickerConfig;
  readonly inputNumber?: InputNumberConfig;
  readonly radio?: RadioConfig;
  readonly checkbox?: CheckboxConfig;
  readonly switch?: SwitchConfig;
  readonly wave?: WaveConfig;
  readonly virtual?: boolean;
  readonly renderEmpty?: RenderEmptyHandler;
  readonly getPopupContainer?: GetPopupContainer;
  readonly rangePicker?: RangePickerConfig;
  readonly textArea?: TextAreaConfig;
  readonly input?: InputConfig;
  readonly inputPassword?: InputPasswordConfig;
  readonly inputSearch?: InputSearchConfig;
  readonly otp?: InputOTPConfig;
  readonly floatButton?: FloatButtonConfig;
  readonly floatButtonGroup?: FloatButtonGroupConfig;
  readonly componentSize: ComponentSize;
  // Divider отличает явно заданный размер от общего fallback middle.
  readonly explicitComponentSize?: ComponentSize;
  readonly componentDisabled: boolean;
  readonly direction: 'ltr' | 'rtl';
  readonly theme: ResolvedThemeConfig;
  /** Source token CSS для дополнительных theme boundaries и порталов. */
  readonly themeStyle?: string;
  readonly locale: Locale;
}

const configKey = Symbol('ant-design-config');
const defaultConfig: ConfigContext = {
  componentSize: 'middle',
  componentDisabled: false,
  direction: 'ltr',
  theme: { mode: 'light', primary: 'blue', compact: false },
  locale: ruRU
};

export function useConfig(): ConfigContext {
  return getContext<ConfigContext | undefined>(configKey) ?? defaultConfig;
}

export function provideConfig(config: ConfigContext) {
  setContext(configKey, config);
}
