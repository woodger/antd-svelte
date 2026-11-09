<script module lang="ts">
  import type { DatePickerProps } from 'antd-svelte';

  export type PickerPrefixKind = 'date' | 'datetime' | 'range' | 'datetime-range'
    | 'time' | 'time-range';
  export interface PickerPrefixSample {
    id: string;
    kind?: PickerPrefixKind;
    prefix?: string;
    childPrefix?: string;
    local?: string;
    variablePrefix?: string;
    aliases?: boolean;
    rtl?: boolean;
    size?: DatePickerProps['size'];
    variant?: DatePickerProps['variant'];
    status?: DatePickerProps['status'];
    disabled?: boolean;
    empty?: boolean;
    closed?: boolean;
    twelve?: boolean;
    affix?: boolean;
    portal?: boolean;
    format?: string;
  }
</script>

<script lang="ts">
  import dayjs, { type Dayjs } from 'dayjs';
  import { untrack } from 'svelte';
  import {
    DatePicker, RangePicker, TimePicker, TimeRangePicker
  } from 'antd-svelte';

  let { sample, rootPrefix, local = true }: {
    sample: PickerPrefixSample;
    rootPrefix: string;
    local?: boolean;
  } = $props();
  const start = dayjs('2024-09-15T12:34:56.789Z');
  const end = dayjs('2024-09-18T18:45:10.456Z');
  const pair: [Dayjs, Dayjs] = [start, end];
  const timePresets = [{ label: 'Stored preset', value: start }];
  const rangePresets = [{ label: 'Stored preset', value: pair }];
  const disabledTime = () => ({ disabledHours: () => [11] });
  const disabledDate = (date: Dayjs) => date.date() === 20;
  let prefix = $derived(local && sample.local || `${rootPrefix}-picker`);
  let kind = $derived(sample.kind ?? 'date');
  let open = $state(true);
  let events = $state<string[]>([]);
  let chosen = $state<string[]>(untrack(() => sample.kind?.includes('range')
    ? [start.toISOString(), end.toISOString()] : [start.toISOString()]));
  let nativeElement = $state<HTMLDivElement>();
  let startInput = $state<HTMLInputElement>();
  let endInput = $state<HTMLInputElement>();
  let clock = $derived({ format: sample.twelve ? 'hh:mm:ss A' : 'HH:mm:ss',
    use12Hours: sample.twelve });
  let common = $derived({
    prefixCls: local ? sample.local : undefined,
    class: 'fixture-picker-prefix', classNames: { popup: { root: 'fixture-picker-prefix-popup' } },
    style: 'width:280px', open: !sample.closed && open, size: sample.size,
    variant: sample.variant, status: sample.status, disabled: sample.disabled, showNow: false,
    format: sample.format,
    getPopupContainer: sample.portal ? () => document.getElementById('picker-prefix-portal')!
      : undefined,
    'aria-label': 'Prefix picker',
    onOpenChange: (next: boolean) => { open = next; events.push(`open:${next}`); }
  } satisfies Pick<DatePickerProps, 'prefixCls' | 'class' | 'classNames' | 'style' | 'open'
    | 'size' | 'variant' | 'status' | 'disabled' | 'showNow' | 'getPopupContainer'
    | 'aria-label' | 'onOpenChange' | 'format'>);

  function changeSingle(date: Dayjs | null) {
    chosen = date ? [date.toISOString()] : [];
    events.push(`change:${JSON.stringify(chosen)}`);
  }

  function changeRange(dates: [Dayjs | null, Dayjs | null] | null) {
    chosen = dates?.map(date => date?.toISOString() ?? 'null') ?? [];
    events.push(`change:${JSON.stringify(chosen)}`);
  }
</script>

<section data-picker-prefix-host data-picker-prefix={prefix} data-root-prefix={rootPrefix}
  style="width:800px;padding:16px">
  {#if kind === 'time'}
    <TimePicker {...common} bind:nativeElement defaultValue={sample.empty ? undefined : start}
      {...clock} {disabledTime} prefix={sample.affix ? 'At' : undefined} presets={timePresets}
      onChange={changeSingle} />
  {:else if kind === 'time-range'}
    <TimeRangePicker {...common} bind:nativeElement bind:startInput bind:endInput
      defaultValue={sample.empty ? undefined : pair} {...clock} {disabledTime}
      prefix={sample.affix ? 'At' : undefined} presets={rangePresets} onChange={changeRange} />
  {:else if kind === 'range' || kind === 'datetime-range'}
    <RangePicker {...common} bind:nativeElement bind:startInput bind:endInput
      defaultValue={sample.empty ? undefined : pair} {disabledDate} {disabledTime}
      showTime={kind === 'datetime-range' ? clock : false}
      presets={kind === 'range' ? rangePresets : undefined} onChange={changeRange} />
  {:else}
    <DatePicker {...common} bind:nativeElement defaultValue={sample.empty ? undefined : start}
      {disabledDate} {disabledTime} showTime={kind === 'datetime' ? clock : false}
      onChange={changeSingle} />
  {/if}
  <output aria-label="Picker prefix ref">{nativeElement?.classList.contains('fixture-picker-prefix')
    ?? false}</output>
  <output aria-label="Picker prefix range refs">{Boolean(startInput && endInput
    && nativeElement?.contains(startInput) && nativeElement?.contains(endInput))}</output>
  <output aria-label="Picker prefix events">{events.join('|')}</output>
  <output aria-label="Picker prefix value">{JSON.stringify(chosen)}</output>
</section>
