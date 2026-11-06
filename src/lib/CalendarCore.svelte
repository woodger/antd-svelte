<script lang="ts" generics="DateType">
  import { untrack, type Snippet } from 'svelte';
  import CalendarHeader from './CalendarHeader.svelte';
  import { useConfig } from './config-context';
  import { useComponentTheme } from './theme-component.svelte';
  import {
    calendarDateDisabled,
    calendarFilledLocale,
    calendarLocale,
    calendarMonthDisabled,
    calendarRows,
    calendarSameDate,
    calendarSameMonth,
    calendarSameYear
  } from './calendar.engine';
  import type {
    CalendarCellRenderInfo,
    CalendarMode,
    CalendarProps,
    CalendarSelectInfo,
    CalendarSemantic,
    CalendarSlots
  } from './calendar.types';
  import type { GenerateConfig } from './date-generate.types';

  let {
    generateConfig,
    value,
    defaultValue,
    mode,
    fullscreen = true,
    showWeek,
    validRange,
    disabledDate,
    onChange,
    onPanelChange,
    onSelect,
    locale,
    headerRender,
    cellRender,
    fullCellRender,
    dateCellRender,
    monthCellRender,
    dateFullCellRender,
    monthFullCellRender,
    class: className,
    rootClassName,
    style,
    classNames,
    styles,
    nativeElement = $bindable(),
    ...attributes
  }: CalendarProps<DateType> & { generateConfig: GenerateConfig<DateType>; } = $props();

  const config = useConfig();
  const componentTheme = useComponentTheme('Calendar');
  let innerValue = $state.raw<DateType | undefined>(
    untrack(() => defaultValue || generateConfig.getNow())
  );
  let innerMode = $state<CalendarMode | undefined>('month');
  let actualValue = $derived(value !== undefined ? value : innerValue);
  let actualMode = $derived(mode !== undefined ? mode : innerMode);
  let panelType: 'month' | 'date' = $derived(actualMode === 'year' ? 'month' : 'date');
  let pickerValue = $state.raw(untrack(() => actualValue || generateConfig.getNow()));
  let previousValue = untrack(() => value);
  let previousMode = untrack(() => mode);
  let previousSelection = untrack(() => actualValue);
  let focusIndex = $state<number>();
  let mergedLocale = $derived(calendarLocale(config.locale.calendar, locale));
  let filledLocale = $derived(calendarFilledLocale(mergedLocale.lang));
  let info = $derived({
    props: {
      ...attributes,
      value,
      defaultValue,
      mode,
      fullscreen,
      showWeek,
      validRange,
      disabledDate,
      onChange,
      onPanelChange,
      onSelect,
      locale,
      headerRender,
      cellRender,
      fullCellRender,
      dateCellRender,
      monthCellRender,
      dateFullCellRender,
      monthFullCellRender,
      class: className,
      rootClassName,
      style,
      classNames,
      styles,
      nativeElement
    }
  });
  const resolve = (value: CalendarSemantic<DateType> | undefined) =>
    typeof value === 'function' ? value(info) : value;
  let contextClasses = $derived(resolve(config.calendar?.classNames) ?? {});
  let localClasses = $derived(resolve(classNames) ?? {});
  let contextStyles = $derived(resolve(config.calendar?.styles) ?? {});
  let localStyles = $derived(resolve(styles) ?? {});
  let today = $derived.by(() => {
    // Как при React render, now обновляется вместе с props, локалью и внутренним выбором.
    void info;
    void mergedLocale;
    void actualValue;
    void actualMode;
    return generateConfig.getNow();
  });
  let rows = $derived.by(() => {
    let position = 0;

    return calendarRows(pickerValue, actualMode === 'year' ? 'year' : 'month',
      filledLocale.locale, generateConfig).map(row => {
      const cells = row.map((date, column) => ({
        date,
        key: String(column),
        week: false,
        disabled: panelType === 'date'
          ? calendarDateDisabled(date, validRange, disabledDate, generateConfig)
          : calendarMonthDisabled(date, validRange, disabledDate, generateConfig),
        selected: panelType === 'date'
          ? calendarSameDate(date, actualValue, generateConfig)
          : calendarSameMonth(date, actualValue, generateConfig),
        inView: panelType === 'month' || calendarSameMonth(date, pickerValue, generateConfig),
        isToday: panelType === 'date'
          ? calendarSameDate(date, today, generateConfig)
          : calendarSameMonth(date, today, generateConfig),
        title: generateConfig.locale.format(filledLocale.locale, date,
          panelType === 'date' ? filledLocale.fieldDateFormat! : filledLocale.fieldMonthFormat!)
      }));

      if (showWeek && panelType === 'date') {
        const date = row[0];
        cells.unshift({
          date,
          key: 'week',
          week: true,
          disabled: calendarDateDisabled(date, validRange, disabledDate, generateConfig),
          selected: false,
          inView: false,
          isToday: false,
          title: `${filledLocale.week} ${generateConfig.locale.getWeek(filledLocale.locale, date)}`
        });
      }

      return cells.map(cell => ({ ...cell, index: position++ }));
    });
  });
  let cells = $derived(rows.flat());
  let tabStop = $derived(
    focusIndex !== undefined && cells[focusIndex] && !cells[focusIndex].disabled
      ? focusIndex
      : cells.find(cell => cell.selected && cell.inView && !cell.disabled)?.index
        ?? cells.find(cell => cell.inView && !cell.disabled)?.index
        ?? cells.find(cell => !cell.disabled)?.index
  );
  let weekdays = $derived(filledLocale.shortWeekDays
    || generateConfig.locale.getShortWeekDays?.(filledLocale.locale) || []);
  let months = $derived(mergedLocale.lang.shortMonths
    || generateConfig.locale.getShortMonths?.(mergedLocale.lang.locale) || []);
  let firstWeekDay = $derived(generateConfig.locale.getWeekFirstDay(filledLocale.locale));

  $effect.pre(() => {
    if (value !== previousValue) innerValue = value;
    previousValue = value;

    if (mode !== previousMode) innerMode = mode;
    previousMode = mode;
  });

  $effect.pre(() => {
    const next = actualValue;

    if (next !== previousSelection && next) pickerValue = next;
    previousSelection = next;
  });

  function slotClass(slot: keyof CalendarSlots) {
    return [contextClasses[slot], localClasses[slot]].filter(Boolean).join(' ');
  }

  function slotStyle(slot: keyof CalendarSlots) {
    return [
      slot === 'root' && componentTheme.style,
      contextStyles[slot],
      slot === 'root' && config.calendar?.style,
      localStyles[slot],
      slot === 'root' && style
    ].filter(Boolean).join(';') || undefined;
  }

  function select(next: DateType, source: CalendarSelectInfo['source']) {
    const previous = actualValue;
    const currentMode = actualMode;
    const currentPanel = panelType;
    innerValue = next;

    if (!calendarSameDate(next, previous, generateConfig)) {
      if (currentPanel === 'date' && !calendarSameMonth(next, previous, generateConfig)
        || currentPanel === 'month' && !calendarSameYear(next, previous, generateConfig))
        onPanelChange?.(next, currentMode!);

      onChange?.(next);
    }

    onSelect?.(next, { source });
  }

  function changeMode(next: CalendarMode) {
    innerMode = next;
    onPanelChange?.(actualValue!, next);
  }

  function chooseCell(cell: typeof cells[number]) {
    if (cell.disabled) return;

    select(cell.date, panelType);
    // PickerPanel меняет отображаемую дату даже при отклонённом controlled value.
    pickerValue = cell.date;
  }

  function handleKeydown(event: KeyboardEvent, cell: typeof cells[number]) {
    if (event.target !== event.currentTarget) return;

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      chooseCell(cell);
      return;
    }

    const columns = rows[0].length;
    const rowStart = Math.floor(cell.index / columns) * columns;
    const horizontal = config.direction === 'rtl' ? -1 : 1;
    const delta = event.key === 'ArrowLeft' ? -horizontal
      : event.key === 'ArrowRight' ? horizontal
        : event.key === 'ArrowUp' ? -columns : event.key === 'ArrowDown' ? columns : 0;
    let next = event.key === 'Home' ? rowStart
      : event.key === 'End' ? rowStart + columns - 1 : cell.index + delta;

    if (!delta && event.key !== 'Home' && event.key !== 'End') return;
    event.preventDefault();

    const step = next < cell.index ? -1 : 1;

    while (cells[next]?.disabled) next += delta || step;
    if (!cells[next]) return;

    focusIndex = next;
    nativeElement?.querySelector<HTMLElement>(`[data-calendar-position="${next}"]`)?.focus();
  }

  function cellInfo(date: DateType, originNode: Snippet): CalendarCellRenderInfo<DateType> {
    return {
      prefixCls: 'ant-picker',
      originNode,
      today,
      type: panelType,
      locale: panelType === 'date' ? filledLocale : mergedLocale.lang
    };
  }

  function originText(date: DateType) {
    return panelType === 'date'
      ? generateConfig.locale.format(filledLocale.locale, date, filledLocale.cellDateFormat!)
      : filledLocale.monthFormat
        ? generateConfig.locale.format(filledLocale.locale, date, filledLocale.monthFormat)
        : months[generateConfig.getMonth(date)];
  }
</script>

<style>
  .ant-picker-cell:focus-visible { outline: 2px solid var(--ant-color-primary); outline-offset: -2px; }
  .week-name { position: absolute; width: 0; height: 0; overflow: hidden; opacity: 0; }
</style>

<div
  {...attributes}
  bind:this={nativeElement}
  class={[
    'ant-picker-calendar',
    componentTheme.className,
    fullscreen ? 'ant-picker-calendar-full' : 'ant-picker-calendar-mini',
    config.direction === 'rtl' && 'ant-picker-calendar-rtl',
    config.calendar?.class,
    className,
    rootClassName,
    slotClass('root'),
    'ant-picker-calendar-css-var'
  ]}
  style={slotStyle('root')}
>
  {#if headerRender}
    {@render headerRender({
      value: actualValue!,
      type: actualMode!,
      onChange: date => select(date, 'customize'),
      onTypeChange: changeMode
    })}
  {:else}
    <CalendarHeader
      value={actualValue || today}
      mode={actualMode}
      {fullscreen}
      {validRange}
      {generateConfig}
      locale={mergedLocale.lang}
      class={slotClass('header')}
      style={slotStyle('header')}
      onChange={select}
      onModeChange={changeMode}
    />
  {/if}
  <div class="ant-picker-panel">
    {#key panelType}
      <div class={[
        `ant-picker-${panelType}-panel`,
        showWeek && panelType === 'date' && 'ant-picker-date-panel-show-week'
      ]}>
        <div class={['ant-picker-body', slotClass('body')]} style={slotStyle('body')}>
          <table
            role="grid"
            class={['ant-picker-content', slotClass('content')]}
            style={slotStyle('content')}
            aria-label={generateConfig.locale.format(filledLocale.locale, pickerValue,
              panelType === 'date' ? filledLocale.fieldMonthFormat! : filledLocale.yearFormat!)}
          >
            {#if panelType === 'date'}
              <thead><tr>
                {#if showWeek}<th scope="col"><span class="week-name">{filledLocale.week}</span></th>{/if}
                {#each Array(7) as _, index}<th scope="col">{weekdays[(firstWeekDay + index) % 7]}</th>{/each}
              </tr></thead>
            {/if}
            <tbody>
              {#each rows as row}
                <tr>
                  {#each row as cell (cell.key)}
                    <td
                      role="gridcell"
                      data-calendar-position={cell.index}
                      title={cell.week ? undefined : cell.title}
                      aria-label={cell.title}
                      aria-selected={cell.week ? undefined : cell.selected}
                      aria-disabled={cell.disabled || undefined}
                      aria-current={!cell.week && panelType === 'date' && cell.isToday ? 'date' : undefined}
                      tabindex={tabStop === cell.index ? 0 : -1}
                      class={[
                        'ant-picker-cell',
                        cell.week ? 'ant-picker-cell-week' : slotClass('item'),
                        cell.disabled && 'ant-picker-cell-disabled',
                        cell.selected && 'ant-picker-cell-selected',
                        cell.inView && 'ant-picker-cell-in-view',
                        !cell.week && panelType === 'date' && cell.isToday && 'ant-picker-cell-today'
                      ]}
                      style={cell.week ? undefined : slotStyle('item')}
                      onclick={() => chooseCell(cell)}
                      onfocus={() => { focusIndex = cell.index; }}
                      onkeydown={event => handleKeydown(event, cell)}
                    >
                      {#if cell.week}
                        <div class="ant-picker-cell-inner">{generateConfig.locale.getWeek(filledLocale.locale, cell.date)}</div>
                      {:else}
                        {#snippet originNode()}<div class="ant-picker-cell-inner">{originText(cell.date)}</div>{/snippet}
                        {@const renderInfo = cellInfo(cell.date, originNode)}
                        {#if fullCellRender}
                          {@render fullCellRender(cell.date, renderInfo)}
                        {:else if panelType === 'date' && dateFullCellRender}
                          {@render dateFullCellRender(cell.date)}
                        {:else if panelType === 'month' && monthFullCellRender}
                          {@render monthFullCellRender(cell.date)}
                        {:else}
                          <div class={[
                            'ant-picker-cell-inner ant-picker-calendar-date',
                            cell.isToday && 'ant-picker-calendar-date-today'
                          ]}>
                            <div class="ant-picker-calendar-date-value">{panelType === 'date'
                              ? String(generateConfig.getDate(cell.date)).padStart(2, '0')
                              : months[generateConfig.getMonth(cell.date)]}</div>
                            <div class={['ant-picker-calendar-date-content', slotClass('itemContent')]} style={slotStyle('itemContent')}>
                              {#if cellRender}{@render cellRender(cell.date, renderInfo)}
                              {:else if panelType === 'date' && dateCellRender}{@render dateCellRender(cell.date)}
                              {:else if panelType === 'month' && monthCellRender}{@render monthCellRender(cell.date)}{/if}
                            </div>
                          </div>
                        {/if}
                      {/if}
                    </td>
                  {/each}
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
    {/key}
  </div>
</div>
