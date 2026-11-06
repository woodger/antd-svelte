<script lang="ts">
  import dayjs from 'dayjs';
  import { Calendar, ConfigProvider, enUS, type CalendarMode } from 'antd-svelte';

  let {
    id,
    prefix = 'ant',
    priority = false
  }: { id: string; prefix?: string; priority?: boolean; } = $props();
  let styled = $derived(priority || id === 'priority');
  let panels = $derived(['normal', 'rtl', 'priority'].includes(id)
    ? ['full-month', 'mini-month', 'full-year', 'mini-year'] : ['mini-month']);
  let value = $state.raw(dayjs('2024-09-15T12:34:56.789Z'));
  let modes = $state<Record<string, CalendarMode>>({
    'full-month': 'month', 'mini-month': 'month', 'full-year': 'year', 'mini-year': 'year'
  });
  let events = $state<string[]>([]);
  let rootStyle = $derived([
    styled && 'font-size:28px;color:rgb(0,128,0)',
    id === 'variable'
      && `--${prefix}-calendar-mini-content-height:300px;--${prefix}-calendar-full-panel-bg:rgb(255,0,255)`
  ].filter(Boolean).join(';') || undefined);
</script>

<section data-calendar-theme={id} dir={id === 'rtl' ? 'rtl' : 'ltr'}
  style="width:800px;padding:16px">
  <ConfigProvider locale={enUS} direction={id === 'rtl' ? 'rtl' : 'ltr'} calendar={styled ? {
    style: 'font-size:32px;color:red', styles: { header: 'padding-top:9px' }
  } : undefined}>
    {#each panels as name}
      <div data-calendar-panel={name} style="margin-bottom:16px">
        <Calendar {value} mode={modes[name]} fullscreen={name.startsWith('full')}
          disabledDate={date => date.date() === 18}
          styles={styled ? { root: 'font-size:30px;color:#531dab', header: 'padding-top:11px',
            itemContent: 'color:#eb2f96' } : undefined}
          style={rootStyle} aria-label={`Themed Calendar ${id} ${name}`}
          onChange={next => {
            value = next;
            events.push(`change:${next.toISOString()}`);
          }}
          onPanelChange={(date, mode) => {
            modes[name] = mode;
            events.push(`panel:${date.toISOString()}:${mode}`);
          }}
          onSelect={(date, info) => events.push(`select:${date.toISOString()}:${info.source}`)} />
      </div>
    {/each}
    <output aria-label={`Calendar theme events ${id}`}>{JSON.stringify(events)}</output>
  </ConfigProvider>
</section>
