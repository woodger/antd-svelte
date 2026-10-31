<script lang="ts">
  import type { Dayjs } from 'dayjs';
  import PickerTimeColumn from './PickerTimeColumn.svelte';
  import {
    timePickerPanel,
    timePickerColumnDate,
    timePickerColumnValue
  } from './time-picker.engine';
  import type { DatePickerTimeConfig } from './date-picker.types';
  import type { TimePickerProps } from './time-picker.types';
  import type { PickerLocale } from './picker-locale.types';

  let {
    value,
    pickerValue,
    config,
    locale,
    now,
    disabledTime,
    onSelect,
    onHover,
    onConfirm,
    cellRender,
    range,
    class: className,
    style,
    itemClass,
    itemStyle
  }: {
    value: Dayjs | null;
    pickerValue?: Dayjs | null;
    config: DatePickerTimeConfig & { changeOnScroll?: boolean; };
    locale: PickerLocale;
    now: Dayjs;
    disabledTime?: TimePickerProps['disabledTime'];
    onSelect: (value: Dayjs) => void;
    onHover?: (value: Dayjs | null) => void;
    onConfirm?: () => void;
    cellRender?: TimePickerProps['cellRender'];
    range?: 'start' | 'end';
    class?: string;
    style?: string;
    itemClass?: string;
    itemStyle?: string;
  } = $props();

  let panel = $derived(timePickerPanel(value, pickerValue, config, disabledTime, locale, now));
</script>

<div class="ant-picker-time-panel">
  <div class={['ant-picker-content', className]} {style}>
    {#each panel.columns as column (column.type)}
      <PickerTimeColumn
        type={column.type}
        options={column.options}
        value={timePickerColumnValue(value, column.type)}
        optionalValue={timePickerColumnValue(pickerValue, column.type)}
        changeOnScroll={config.changeOnScroll}
        onChange={next => onSelect(panel.align(
          timePickerColumnDate(panel.template, value, column.type, next)
        ))}
        onHover={next => onHover?.(next === null ? null
          : timePickerColumnDate(panel.template, value, column.type, next))}
        onDblClick={onConfirm}
        {cellRender}
        {locale}
        today={now}
        {range}
        class={itemClass}
        style={itemStyle}
      />
    {/each}
  </div>
</div>
