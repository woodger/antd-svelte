<script module lang="ts">
  export interface CalendarPrefixSample {
    id: string;
    prefix?: string;
    childPrefix?: string;
    local?: string;
    variablePrefix?: string;
    aliases?: boolean;
    mini?: boolean;
    year?: boolean;
    rtl?: boolean;
    week?: boolean;
    range?: boolean;
    priority?: boolean;
    viewport?: number;
  }
</script>

<script lang="ts">
  import dayjs from 'dayjs';
  import { Calendar, type CalendarMode } from 'antd-svelte';

  let { sample, rootPrefix, local = true }: {
    sample: CalendarPrefixSample;
    rootPrefix: string;
    local?: boolean;
  } = $props();
  let prefix = $derived(local && sample.local || `${rootPrefix}-picker`);
  let value = $state.raw(dayjs('2024-09-15T12:34:56.789Z'));
  let mode = $state<CalendarMode>('month');
  let nativeElement = $state<HTMLDivElement>();
  let events = $state<string[]>([]);
</script>

<section data-calendar-prefix-host data-picker-prefix={prefix} data-root-prefix={rootPrefix}
  style="width:760px;padding:16px">
  <Calendar prefixCls={local ? sample.local : undefined} class="fixture-calendar-prefix"
    bind:nativeElement {value} mode={sample.year ? 'year' : mode}
    fullscreen={!sample.mini} showWeek={sample.week}
    validRange={sample.range ? [dayjs('2024-09-01'), dayjs('2024-11-30')] : undefined}
    disabledDate={date => date.date() === 18}
    style={`width:${sample.mini ? 320 : 760}px;${sample.priority ? 'font-size:28px;color:green' : ''}`}
    styles={sample.priority ? {
      root: 'font-size:30px;color:#531dab', header: 'padding-top:11px',
      itemContent: 'color:#eb2f96'
    } : undefined}
    aria-label="Prefix calendar"
    onChange={next => { value = next; events.push(`change:${next.toISOString()}`); }}
    onPanelChange={(date, next) => {
      mode = next;
      events.push(`panel:${date.toISOString()}:${next}`);
    }}
    onSelect={(date, info) => events.push(`select:${date.toISOString()}:${info.source}`)} />
  <output aria-label="Calendar prefix ref">{nativeElement?.classList.contains('fixture-calendar-prefix')
    ?? false}</output>
  <output aria-label="Calendar prefix events">{events.join('|')}</output>
  <output aria-label="Calendar prefix value">{value.toISOString()}</output>
</section>
