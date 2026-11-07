<script lang="ts">
  import dayjs, { type Dayjs } from 'dayjs';
  import utc from 'dayjs/plugin/utc.js';
  import {
    ConfigProvider, DatePicker, RangePicker, enUS,
    type DatePickerLocale, type DatePickerProps, type DatePickerTimeConfig, type RangePickerValue
  } from 'antd-svelte';
  import reference from './ant-design-datetime-config-reference.json';

  dayjs.extend(utc);
  const samples: {
    name: string;
    range: boolean;
    config?: Omit<DatePickerTimeConfig, 'defaultOpenValue'>;
    format?: DatePickerProps['format'];
    locale?: DatePickerLocale['lang'];
  }[] = reference.cases;
  let { preset = 'default', utcMode = false }: {
    preset?: string;
    utcMode?: boolean;
  } = $props();
  let sample = $derived(samples.find(item => item.name === preset)!);
  let events = $state<unknown[]>([]);

  function record(value: Dayjs | RangePickerValue | null, text: unknown) {
    events.push({
      value: Array.isArray(value) ? value.map(date => date?.toISOString() ?? null)
        : value?.toISOString() ?? null,
      utc: Array.isArray(value) ? value.map(date => date?.isUTC() ?? false)
        : value?.isUTC() ?? false,
      text
    });
  }
</script>

<section id="datetime-config-fixture">
  <select aria-label="Datetime config preset" bind:value={preset}>
    {#each samples as item}<option value={item.name}>{item.name}</option>{/each}
  </select>
  <label><input type="checkbox" bind:checked={utcMode} /> UTC datetime values</label>
  <ConfigProvider locale={enUS} theme={{ cssVar: {}, token: { motion: false } }}>
    {#key `${preset}:${utcMode}`}
      {@const start = utcMode ? dayjs.utc('2024-09-15T12:34:56.789Z')
        : dayjs('2024-09-15T12:34:56.789Z')}
      {@const end = utcMode ? dayjs.utc('2024-09-18T18:45:10.456Z')
        : dayjs('2024-09-18T18:45:10.456Z')}
      {#if sample.range}
        <RangePicker defaultValue={[start, end]} format={sample.format}
          showTime={sample.config ?? true} locale={{ lang: sample.locale ?? {} }}
          open showNow={false} style="width:400px" aria-label="Datetime config range"
          onChange={record} />
      {:else}
        <DatePicker defaultValue={start} format={sample.format}
          showTime={sample.config ?? true} locale={{ lang: sample.locale ?? {} }}
          open showNow={false} style="width:280px"
          aria-label="Datetime config single" onChange={record} />
      {/if}
    {/key}
  </ConfigProvider>
  <output aria-label="Datetime config events">{JSON.stringify(events)}</output>
</section>
