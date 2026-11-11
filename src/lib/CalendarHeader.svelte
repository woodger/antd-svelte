<script lang="ts" generics="DateType">
  import { tick } from 'svelte';
  import Select from './Select.svelte';
  import RadioButton from './RadioButton.svelte';
  import RadioGroup from './RadioGroup.svelte';
  import { provideFormField, useFormField } from './form-context';
  import { provideFormFeedback, useFormFeedback } from './form-feedback-context';
  import { useDesignTokenContext } from './theme-context.svelte';
  import { calendarMonthOptions, calendarSetYear, calendarYearOptions } from './calendar.engine';
  import type { CalendarLang, CalendarMode, CalendarSelectInfo } from './calendar.types';
  import type { GenerateConfig } from './date-generate.types';

  let {
    prefixCls,
    value,
    mode,
    fullscreen,
    validRange,
    locale,
    generateConfig,
    class: className,
    style,
    onChange,
    onModeChange
  }: {
    prefixCls: string;
    value: DateType;
    mode: CalendarMode | undefined;
    fullscreen: boolean;
    validRange?: [DateType, DateType];
    locale: CalendarLang;
    generateConfig: GenerateConfig<DateType>;
    class?: string;
    style?: string;
    onChange: (date: DateType, source: CalendarSelectInfo['source']) => void;
    onModeChange: (mode: CalendarMode) => void;
  } = $props();

  const field = useFormField();
  provideFormFeedback(Object.create(useFormFeedback(), {
    isFormItemInput: { value: false }
  }));
  const designToken = useDesignTokenContext();
  // Внутренние controls заголовка не являются отдельными полями внешнего FormItem.
  provideFormField(field ? {
    get disabled() {
      return field.disabled;
    },
    get status() {
      return field.status;
    },
    get invalid() {
      return field.invalid;
    },
    required: false,
    describedBy: undefined,
    onBlur() {
      field.onBlur();
    }
  } : undefined);

  let monthInput = $state<HTMLInputElement>();
  let yearInput = $state<HTMLInputElement>();
  let years = $derived(calendarYearOptions(value, validRange, locale, generateConfig));
  let months = $derived(calendarMonthOptions(value, validRange, locale, generateConfig));

  function handleModeChange(next: CalendarMode) {
    onModeChange(next);

    // Native radio переключается до callback; controlled Calendar может отклонить новый mode.
    void tick().then(() => {
      if (monthInput) monthInput.checked = mode === 'month';
      if (yearInput) yearInput.checked = mode === 'year';
    });
  }
</script>

<style>
  /* Auto width внешнего div Select зависит от intrinsic ширины native input. */
  .calendar-header :global(.calendar-year-select),
  .calendar-header :global(.calendar-month-select) { display: inline-block; flex: none; vertical-align: top; }
  .calendar-header :global(.calendar-mode-switch) { flex-shrink: 0; flex-wrap: nowrap; }
  @media (width > 480px) {
    .calendar-header:not(.source-header) :global(.calendar-year-select) { width: var(--ant-calendar-year-control-width); }
    .calendar-header:not(.source-header) :global(.calendar-month-select) { width: var(--ant-calendar-month-control-width); }
  }
</style>

<div class={[`${prefixCls}-header`, 'calendar-header', designToken.enabled && 'source-header', className]} {style}>
  <Select
    _autoWidth={designToken.enabled}
    class={`${prefixCls}-year-select calendar-year-select`}
    aria-label={locale.yearSelect ?? locale.year}
    size={fullscreen ? undefined : 'small'}
    options={years}
    bind:value={() => generateConfig.getYear(value), () => {}}
    onValueChange={year => {
      if (year !== undefined)
        onChange(calendarSetYear(value, year, validRange, generateConfig), 'year');
    }}
  />{#if mode === 'month'}
    <Select
      _autoWidth={designToken.enabled}
      class={`${prefixCls}-month-select calendar-month-select`}
      aria-label={locale.monthSelect ?? locale.month}
      size={fullscreen ? undefined : 'small'}
      options={months}
      bind:value={() => generateConfig.getMonth(value), () => {}}
      onValueChange={month => {
        if (month !== undefined) onChange(generateConfig.setMonth(value, month), 'month');
      }}
    />
  {/if}<RadioGroup
    class={`${prefixCls}-mode-switch calendar-mode-switch`}
    aria-label={`${locale.month} / ${locale.year}`}
    size={fullscreen ? undefined : 'small'}
    bind:value={() => mode, () => {}}
    onValueChange={handleModeChange}
  >
    <RadioButton value="month" bind:inputElement={monthInput}>{locale.month}</RadioButton>
    <RadioButton value="year" bind:inputElement={yearInput}>{locale.year}</RadioButton>
  </RadioGroup>
</div>
