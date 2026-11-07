<script lang="ts">
  import dayjs, { type Dayjs } from 'dayjs';
  import utc from 'dayjs/plugin/utc.js';
  import {
    Calendar,
    ConfigProvider,
    FormItem,
    generateCalendar,
    type CalendarCellRenderInfo,
    type CalendarHeaderRenderInfo,
    type CalendarMode,
    type CalendarSelectInfo
  } from 'antd-svelte';
  import { calendarDateAdapter } from './calendar-date-adapter';

  dayjs.extend(utc);

  const CustomCalendar = generateCalendar(calendarDateAdapter);
  let ownerValue = $state(dayjs.utc('2024-09-15T12:34:56.789Z'));
  let ownerMode = $state<CalendarMode>('month');
  let controlledValue = $state(false);
  let controlledMode = $state(false);
  let acceptValue = $state(true);
  let acceptMode = $state(true);
  let fullscreen = $state(true);
  let showWeek = $state(false);
  let blocked = $state(false);
  let range = $state('none');
  let customHeader = $state(false);
  let renderer = $state('none');
  let translated = $state(false);
  let dark = $state(false);
  let compact = $state(false);
  let styled = $state(false);
  let nested = $state(false);
  let mounted = $state(true);
  let instance = $state(0);
  let nativeElement = $state<HTMLDivElement>();
  let events = $state<string[]>([]);
  let embedded = $state(0);
  let externalText = $state('2024-02-29T23:45:12.345Z');
  let generatedValue = $state(new Date('2024-02-29T12:34:56.789Z'));
  let generatedMode = $state<CalendarMode>('month');
  let generatedRef = $state<HTMLDivElement>();
  let generatedMounted = $state(true);
  let formData = $state('');
  let validRange = $derived<[Dayjs, Dayjs] | undefined>(range === 'window'
    ? [dayjs.utc('2024-09-10T12:34:56.789Z'), dayjs.utc('2024-09-20T12:34:56.789Z')]
    : range === 'months'
      ? [dayjs.utc('2024-09-01'), dayjs.utc('2024-11-30T23:59:59.999Z')]
      : range === 'years'
        ? [dayjs.utc('2018-11-10'), dayjs.utc('2019-03-10')]
        : undefined);

  function handleChange(value: Dayjs) {
    events.push(`change:${value.toISOString()}`);
    if (acceptValue) ownerValue = value;
  }

  function handlePanelChange(value: Dayjs, mode: CalendarMode) {
    events.push(`panel:${value?.toISOString()}:${mode}`);
    if (acceptMode) ownerMode = mode;
  }

  function handleSelect(value: Dayjs, info: CalendarSelectInfo) {
    events.push(`select:${value.toISOString()}:${info.source}`);
  }
</script>

<style>
  .controls { display: flex; flex-wrap: wrap; gap: 8px; margin-block: 12px; }
  .calendar-holder { max-width: 100%; width: 700px; }
  .calendar-holder.mini { width: 300px; }
  .custom-holder { width: 300px; max-width: 100%; margin-block: 16px; }
  output { display: block; overflow-wrap: anywhere; }
</style>

{#snippet header(info: CalendarHeaderRenderInfo)}
  <div class="custom-calendar-header">
    <output aria-label="Custom Calendar header state">{info.value?.toISOString()}:{info.type}</output>
    <button type="button" onclick={() => info.onChange(info.value.add(1, 'day'))}>Custom Calendar next date</button>
    <button type="button" onclick={() => info.onChange(info.value.add(1, 'hour'))}>Custom Calendar same date time</button>
    <button type="button" onclick={() => info.onTypeChange(info.type === 'month' ? 'year' : 'month')}>Custom Calendar mode</button>
  </div>
{/snippet}
{#snippet content(value: Dayjs, info: CalendarCellRenderInfo)}
  <span class="custom-calendar-content" data-type={info.type}>{value.format('YYYY-MM-DD')}:{info.locale.cellDateFormat ?? 'raw'}</span>
  {@render info.originNode()}
{/snippet}
{#snippet full(value: Dayjs, info: CalendarCellRenderInfo)}
  <div class="custom-calendar-full" data-type={info.type} data-prefix={info.prefixCls}>
    {@render info.originNode()}
    <small>{info.locale.cellDateFormat ?? 'raw'}</small>
    <button type="button" onclick={event => { event.stopPropagation(); embedded++; }}>Cell action {value.format('YYYY-MM-DD')}</button>
    <input aria-label={`Cell note ${value.format('YYYY-MM-DD')}`} style="width:100%;min-width:0" />
  </div>
{/snippet}
{#snippet empty()}{/snippet}

<section id="calendar-fixture">
  <h2>Calendar</h2>
  <div class="controls">
    <label><input type="checkbox" bind:checked={controlledValue} /> Controlled Calendar value</label>
    <label><input type="checkbox" bind:checked={controlledMode} /> Controlled Calendar mode</label>
    <label><input type="checkbox" bind:checked={acceptValue} /> Accept Calendar value</label>
    <label><input type="checkbox" bind:checked={acceptMode} /> Accept Calendar mode</label>
    <label><input type="checkbox" bind:checked={fullscreen} /> Fullscreen Calendar</label>
    <label><input type="checkbox" bind:checked={showWeek} /> Show Calendar weeks</label>
    <label><input type="checkbox" bind:checked={blocked} /> Block Calendar sixteenth</label>
    <label><input type="checkbox" bind:checked={customHeader} /> Custom Calendar header</label>
    <label><input type="checkbox" bind:checked={translated} /> Partial Calendar locale</label>
    <label><input type="checkbox" bind:checked={dark} /> Dark Calendar</label>
    <label><input type="checkbox" bind:checked={compact} /> Compact Calendar</label>
    <label><input type="checkbox" bind:checked={styled} /> Styled Calendar</label>
    <label><input type="checkbox" bind:checked={nested} /> Replace Calendar config</label>
    <label><input type="checkbox" bind:checked={mounted} /> Mount Calendar</label>
    <label>Calendar range<select bind:value={range}>
      <option value="none">No Calendar range</option><option value="window">September date window</option>
      <option value="months">September-November months</option><option value="years">2018-2019 years</option>
    </select></label>
    <label>Calendar renderer<select bind:value={renderer}>
      <option value="none">Default Calendar cells</option><option value="cell">Calendar content snippet</option>
      <option value="full">Calendar full snippet</option>
      <option value="precedence">Calendar renderer precedence</option>
      <option value="empty">Calendar empty full snippet</option>
    </select></label>
    <label>Calendar external date<input bind:value={externalText} /></label>
    <button type="button" onclick={() => { ownerValue = dayjs.utc(externalText); }}>Set Calendar date</button>
    <button type="button" onclick={() => { ownerMode = ownerMode === 'month' ? 'year' : 'month'; }}>Set Calendar mode</button>
    <button type="button" onclick={() => { events = []; }}>Clear Calendar events</button>
    <button type="button" onclick={() => { instance++; }}>Remount Calendar</button>
  </div>
  <ConfigProvider
    theme={{ mode: dark ? 'dark' : 'light', compact, primary: 'purple' }}
    calendar={{
      class: 'calendar-context',
      style: 'outline-offset:4px',
      classNames: ({ props }) => ({ root: `context-${props.fullscreen ? 'full' : 'mini'}` }),
      styles: { root: 'outline-offset:2px', header: 'outline-offset:2px', item: 'outline-offset:2px' }
    }}
    locale={translated ? { calendar: { lang: { year: 'My year', month: 'My month', yearSelect: 'My year selector' } } } : undefined}
  >
    <ConfigProvider calendar={nested ? { class: 'nested-calendar-context' } : undefined}>
      <div class="calendar-holder" class:mini={!fullscreen}>
        {#if mounted}{#key instance}<Calendar
          value={controlledValue ? ownerValue : undefined}
          defaultValue={ownerValue}
          mode={controlledMode ? ownerMode : undefined}
          {fullscreen}
          {showWeek}
          {validRange}
          disabledDate={blocked ? value => value.date() === 16 : undefined}
          onChange={handleChange}
          onPanelChange={handlePanelChange}
          onSelect={handleSelect}
          headerRender={customHeader ? header : undefined}
          cellRender={renderer === 'cell' || renderer === 'precedence' ? content : undefined}
          fullCellRender={renderer === 'empty' ? empty : renderer === 'full' || renderer === 'precedence' ? full : undefined}
          class="fixture-calendar"
          rootClassName="calendar-owner"
          data-owner="calendar"
          classNames={({ props }) => ({
            root: `local-mode-${props.mode ?? 'unset'}`,
            header: 'local-calendar-header', body: 'local-calendar-body',
            content: 'local-calendar-grid', item: 'local-calendar-cell', itemContent: 'local-calendar-content'
          })}
          styles={styled ? {
            root: 'outline-offset:6px', header: 'outline-offset:6px', body: 'outline-offset:6px',
            content: 'outline-offset:6px', item: 'outline-offset:6px', itemContent: 'outline-offset:6px'
          } : undefined}
          style={styled ? 'outline-offset:8px' : undefined}
          bind:nativeElement
        />{/key}{/if}
      </div>
    </ConfigProvider>
  </ConfigProvider>
  <output aria-label="Calendar events">{events.join('|')}</output>
  <output aria-label="Calendar owner">{ownerValue.toISOString()}:{ownerMode}</output>
  <output aria-label="Calendar ref">{nativeElement?.tagName ?? 'none'}</output>
  <output aria-label="Calendar embedded actions">{embedded}</output>
  <form class="calendar-form" onsubmit={event => {
    event.preventDefault();
    formData = JSON.stringify([...new FormData(event.currentTarget)]);
  }}>
    <FormItem name="calendar-field" label="Calendar field" required>
      <Calendar defaultValue={dayjs.utc('2024-09-15T12:34:56.789Z')} fullscreen={false} />
    </FormItem>
    <button type="submit">Read Calendar form</button>
    <output aria-label="Calendar form data">{formData}</output>
  </form>
  <div class="custom-holder">
    <label><input type="checkbox" bind:checked={generatedMounted} /> Mount generated Calendar</label>
    <button type="button" onclick={() => { generatedValue = new Date('2025-01-31T23:45:12.345Z'); }}>Set generated Calendar date</button>
    <button type="button" onclick={() => { generatedMode = generatedMode === 'month' ? 'year' : 'month'; }}>Set generated Calendar mode</button>
    {#if generatedMounted}<CustomCalendar
      value={generatedValue}
      mode={generatedMode}
      fullscreen={false}
      class="generated-calendar"
      onChange={value => { generatedValue = value; }}
      onPanelChange={(_value, mode) => { generatedMode = mode; }}
      bind:nativeElement={generatedRef}
    />{/if}
    <output aria-label="Generated Calendar owner">{generatedValue.toISOString()}</output>
    <output aria-label="Generated Calendar ref">{generatedRef?.tagName ?? 'none'}</output>
  </div>
</section>
