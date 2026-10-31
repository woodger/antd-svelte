import type { Dayjs } from 'dayjs';
import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { GenerateConfig } from './date-generate.types';
import type { datePickerEnUS } from './date-picker.locale';

export type CalendarMode = 'year' | 'month';
export type CalendarSelectInfo = { source: 'year' | 'month' | 'date' | 'customize'; };
export type CalendarGenerateConfig<DateType> = GenerateConfig<DateType>;

/** Форма React ref; в Svelte ссылка на div доступна через bind:nativeElement. */
export interface CalendarRef {
  nativeElement: HTMLDivElement;
}

/** Язык rc-picker; загружать Day.js locale, кроме встроенных en/ru, должен потребитель. */
export type CalendarLang = Partial<typeof datePickerEnUS.lang> & {
  locale: string;
  shortWeekDays?: string[];
  shortMonths?: string[];
  monthFormat?: string;
  fieldDateTimeFormat?: string;
  fieldDateFormat?: string;
  fieldTimeFormat?: string;
  fieldMonthFormat?: string;
  fieldYearFormat?: string;
  fieldWeekFormat?: string;
  fieldQuarterFormat?: string;
  cellYearFormat?: string;
  cellQuarterFormat?: string;
  cellDateFormat?: string;
};

/** Объединяется по полям lang с ConfigProvider.locale.calendar и базовой локалью. */
export interface CalendarLocale {
  lang?: Partial<CalendarLang>;
  timePickerLocale?: { placeholder?: string; };
}

/** OriginNode — Svelte snippet исходного rc-picker inner; week cells не вызывают renderer. */
export interface CalendarCellRenderInfo<DateType = Dayjs> {
  prefixCls: string;
  originNode: Snippet;
  today: DateType;
  type: 'date' | 'month';
  /** В date mode содержит filled formats rc-picker; в month mode — исходный lang. */
  locale: CalendarLang;
}

/** onChange выбирает дату с source=customize; onTypeChange вызывает только onPanelChange. */
export interface CalendarHeaderRenderInfo<DateType = Dayjs> {
  value: DateType;
  type: CalendarMode;
  onChange: (value: DateType) => void;
  onTypeChange: (mode: CalendarMode) => void;
}

export type CalendarSlots = Partial<Record<
  'root' | 'header' | 'body' | 'content' | 'item' | 'itemContent',
  string
>>;
/** Props сохраняют mode/showWeek из вызова; fullscreen имеет default true. */
export type CalendarSemantic<DateType = Dayjs> = CalendarSlots
  | ((info: { props: CalendarProps<DateType>; }) => CalendarSlots | undefined);

/** Вложенный calendar config заменяется целиком; root style идёт после context styles.root. */
export interface CalendarConfig {
  class?: string;
  style?: string;
  // Тип custom date adapter неизвестен общему ConfigProvider, как в upstream CalendarProps<any>.
  classNames?: CalendarSemantic<any>;
  styles?: CalendarSemantic<any>;
}

/** Calendar Ant Design 6.6.8; value/mode управляются props + callbacks, без bind:value. */
export interface CalendarProps<DateType = Dayjs> extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children' | 'class' | 'style'
> {
  /** Controlled: не меняется без ответа владельца. Без value используется defaultValue/getNow(). */
  value?: DateType;
  /** Только начальное значение; время, milliseconds и timezone не нормализуются. */
  defaultValue?: DateType;
  /** Controlled mode; без prop начальный режим month. */
  mode?: CalendarMode;
  /** По умолчанию true; false включает мини-календарь и small controls заголовка. */
  fullscreen?: boolean;
  /** Дополнительный столбец недель в month mode; выбор публикует начало строки с source=date. */
  showWeek?: boolean;
  /** Включительно, с исходной точностью timestamp; заголовок ограничивает годы и месяцы. */
  validRange?: [DateType, DateType];
  /** Только ячейки панели. Month disabled, когда disabled и первый, и последний день месяца. */
  disabledDate?: (date: DateType) => boolean;
  onChange?: (date: DateType) => void;
  onPanelChange?: (date: DateType, mode: CalendarMode) => void;
  /** Вызывается также для повторного выбора; после onPanelChange и onChange, если они нужны. */
  onSelect?: (date: DateType, info: CalendarSelectInfo) => void;
  locale?: CalendarLocale;
  headerRender?: Snippet<[CalendarHeaderRenderInfo<DateType>]>;
  cellRender?: Snippet<[DateType, CalendarCellRenderInfo<DateType>]>;
  fullCellRender?: Snippet<[DateType, CalendarCellRenderInfo<DateType>]>;
  /** @deprecated Используйте cellRender. */
  dateCellRender?: Snippet<[DateType]>;
  /** @deprecated Используйте cellRender. */
  monthCellRender?: Snippet<[DateType]>;
  /** @deprecated Используйте fullCellRender. */
  dateFullCellRender?: Snippet<[DateType]>;
  /** @deprecated Используйте fullCellRender. */
  monthFullCellRender?: Snippet<[DateType]>;
  class?: string;
  rootClassName?: string;
  /** После context и semantic root styles. */
  style?: string;
  classNames?: CalendarSemantic<DateType>;
  styles?: CalendarSemantic<DateType>;
  /** Корневой div вместо React CalendarRef.nativeElement; очищается при unmount. */
  nativeElement?: HTMLDivElement;
}
