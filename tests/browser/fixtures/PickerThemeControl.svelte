<script lang="ts">
  import dayjs, { type Dayjs } from 'dayjs';
  import {
    ConfigProvider, DatePicker, RangePicker, TimePicker, TimeRangePicker,
    enUS, type DatePickerProps
  } from 'antd-svelte';

  let {
    id,
    prefix = 'ant',
    priority = false,
    header = 'normal',
    opened = '',
    onOpen
  }: {
    id: string;
    prefix?: string;
    priority?: boolean;
    header?: string;
    opened?: string;
    onOpen?: (mode: string) => void;
  } = $props();
  const start = dayjs('2024-09-15T12:34:56.789Z');
  const end = dayjs('2024-09-18T18:45:10.456Z');
  const pair: [Dayjs, Dayjs] = [start, end];
  const timePresets = [{ label: 'Stored preset', value: start }];
  const rangePresets = [{ label: 'Stored preset', value: pair }];
  const disabledDate = (date: Dayjs) => date.date() === 20;
  const disabledTime = () => ({ disabledHours: () => [11] });
  let styled = $derived(priority || id === 'priority');
  let modes = $derived(id === 'normal'
    ? ['date', 'datetime', 'range', 'datetime-range', 'time', 'time-range',
      'small', 'large', 'disabled', 'error', 'filled', 'borderless', 'underlined']
    : ['date', 'range', 'time', 'time-range']);
  let events = $state<string[]>([]);
  let empty = $derived(header === 'empty');
  let clock = $derived(header === 'default' ? true
    : header === 'minutes' ? { format: 'HH:mm' }
      : header === '12-hours' ? { format: 'hh:mm:ss A', use12Hours: true }
        : { format: 'HH:mm:ss' });

  function common(mode: string) {
    return {
      size: mode === 'small' ? 'small' : mode === 'large' ? 'large' : undefined,
      disabled: mode === 'disabled',
      status: mode === 'error' ? 'error' : undefined,
      variant: mode === 'filled' || mode === 'borderless' || mode === 'underlined' ? mode : undefined,
      open: id === 'normal' && opened === mode,
      popupClassName: id === 'normal' && opened === mode ? 'theme-picker-popup' : undefined,
      style: ['width:280px', styled && 'color:rgb(0,128,0);padding-top:13px',
        id === 'variable' && `--${prefix}-date-picker-padding-inline:21px`]
        .filter(Boolean).join(';'),
      showNow: false,
      showToday: false,
      onOpenChange: next => {
        if (id === 'normal') onOpen?.(next ? mode : '');
      }
    } satisfies Pick<DatePickerProps,
      'size' | 'disabled' | 'status' | 'variant' | 'open' | 'onOpenChange' | 'popupClassName'
      | 'style' | 'showNow' | 'showToday'>;
  }
</script>

<section data-picker-theme={id} dir={id === 'rtl' ? 'rtl' : 'ltr'}
  style="width:800px;padding:16px">
  <ConfigProvider locale={enUS} direction={id === 'rtl' ? 'rtl' : 'ltr'}>
    {#each modes as mode}
      {@const props = common(mode)}
      {@const active = id === 'normal' && opened === mode}
      <div data-picker-input={mode} style="margin-bottom:16px">
        {#if mode === 'time'}
          <TimePicker {...props} defaultValue={empty ? undefined : start} {disabledTime}
            presets={active ? timePresets : undefined}
            styles={styled ? { popup: { root: 'color:#389e0d' } } : undefined}
            aria-label={`Themed picker ${id} ${mode}`}
            onChange={value => events.push(`change:time:${value?.toISOString() ?? 'null'}`)} />
        {:else if mode === 'time-range'}
          <TimeRangePicker {...props} defaultValue={empty ? undefined : pair} {disabledTime}
            presets={active ? rangePresets : undefined}
            styles={styled ? { popup: { root: 'color:#389e0d' } } : undefined}
            aria-label={`Themed picker ${id} ${mode}`}
            onChange={value => events.push(`change:time-range:${JSON.stringify(value?.map(date => date?.toISOString()))}`)} />
        {:else if mode === 'range' || mode === 'datetime-range'}
          <RangePicker {...props} defaultValue={empty ? undefined : pair} {disabledDate} {disabledTime}
            showTime={mode === 'datetime-range' ? clock : false}
            presets={active && mode === 'range' ? rangePresets : undefined}
            aria-label={`Themed picker ${id} ${mode}`}
            onChange={value => events.push(`change:${mode}:${JSON.stringify(value?.map(date => date?.toISOString()))}`)} />
        {:else}
          <DatePicker {...props} defaultValue={empty ? undefined : start} {disabledDate} {disabledTime}
            showTime={mode === 'datetime' ? clock : false}
            aria-label={`Themed picker ${id} ${mode}`}
            onChange={value => events.push(`change:${mode}:${value?.toISOString() ?? 'null'}`)} />
        {/if}
      </div>
    {/each}
    <output aria-label={`Picker theme events ${id}`}>{JSON.stringify(events)}</output>
  </ConfigProvider>
</section>
