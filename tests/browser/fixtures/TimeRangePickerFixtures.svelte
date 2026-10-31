<script lang="ts">
  import dayjs, { type Dayjs } from 'dayjs';
  import utc from 'dayjs/plugin/utc.js';
  import {
    TimeRangePicker, ConfigProvider, Form, FormItem, createForm,
    type RangePickerValue, type TimePickerCellRenderInfo,
    type TimeRangePickerFocusOptions
  } from 'antd-svelte';

  dayjs.extend(utc);
  const initial: RangePickerValue = [
    dayjs.utc('2024-09-15T10:23:44.567Z'), dayjs.utc('2024-09-15T17:45:56.789Z')
  ];
  let value = $state.raw<RangePickerValue | null>(initial);
  let defaults = $state.raw<RangePickerValue>(initial);
  let accept = $state(true);
  let controlledValue = $state(true);
  let needConfirm = $state(true);
  let order = $state(true);
  let emptyStart = $state(false);
  let emptyEnd = $state(false);
  let lockedStart = $state(false);
  let lockedEnd = $state(false);
  let disabled = $state(false);
  let readOnly = $state(false);
  let preserve = $state(false);
  let preview = $state(true);
  let scroll = $state(false);
  let use12Hours = $state(false);
  let milliseconds = $state(false);
  let precise = $state(false);
  let stepped = $state(false);
  let restricted = $state(false);
  let fromRestricted = $state(false);
  let defaultOpen = $state(false);
  let controlledOpen = $state(false);
  let acceptOpen = $state(true);
  let open = $state(false);
  let showNow = $state(false);
  let mounted = $state(true);
  let instance = $state(0);
  let format = $state('default');
  let allowClear = $state(true);
  let icons = $state(false);
  let styled = $state(false);
  let nested = $state(false);
  let dark = $state(false);
  let compact = $state(false);
  let custom = $state(false);
  let renderPanel = $state(false);
  let footer = $state(false);
  let presets = $state(false);
  let fit = $state(false);
  let controlledPanel = $state(false);
  let defaultPanel = $state(false);
  const pickerValues: [Dayjs, Dayjs] = [
    dayjs.utc('2024-09-15T06:07:08.123Z'), dayjs.utc('2024-09-15T18:19:20.456Z')
  ];
  let size = $state<'small' | 'middle' | 'large' | 'inherit'>('inherit');
  let variant = $state<'outlined' | 'filled' | 'borderless' | 'underlined' | 'inherit'>('inherit');
  let root = $state<HTMLDivElement>();
  let start = $state<HTMLInputElement>();
  let end = $state<HTMLInputElement>();
  let picker = $state<{
    focus(options?: TimeRangePickerFocusOptions | 0 | 1): void;
    blur(): void;
  }>();
  let events = $state<string[]>([]);
  let focusEvents = $state<string[]>([]);
  let panelEvents = $state<string[]>([]);
  let data = $state('');
  let submitted = $state('');
  const form = createForm<{ interval: RangePickerValue | null }>({
    initialValues: { interval: null },
    rules: { interval: [{ required: true, message: 'Choose a time interval' }] }
  });

  function stamp(value: Dayjs | null | undefined) {
    return value?.toISOString() ?? 'null';
  }
  function stamps(value: RangePickerValue | null) {
    return value?.map(stamp).join(',') ?? 'null';
  }
</script>

<style>
  .controls { display:flex;flex-wrap:wrap;gap:8px;margin-block:12px; }
  .holder { max-width:100%;margin-block:16px; }
  output { display:block;overflow-wrap:anywhere; }
</style>

{#snippet customCell(unit: number | 'am' | 'pm', info: TimePickerCellRenderInfo)}
  <span class="custom-interval-cell" data-range={info.range} data-unit={info.subType}>
    {@render info.originNode()}<small>{unit}</small>
  </span>
{/snippet}
{#snippet panel(content: import('svelte').Snippet)}
  <section aria-label="Interval panel renderer">{@render content()}</section>
{/snippet}
{#snippet extra(mode: 'time')}<span>Interval footer {mode}</span>{/snippet}
{#snippet suffix()}<span class="interval-suffix">T</span>{/snippet}
{#snippet clear()}<span class="interval-clear">C</span>{/snippet}
{#snippet separator()}<span>until</span>{/snippet}

<section id="time-range-picker-fixture">
  <h2>TimeRangePicker</h2>
  <div class="controls">
    <label><input type="checkbox" bind:checked={accept} /> Accept interval changes</label>
    <label><input type="checkbox" bind:checked={controlledValue} /> Controlled interval value</label>
    <label><input type="checkbox" bind:checked={needConfirm} /> Confirm interval</label>
    <label><input type="checkbox" bind:checked={order} /> Order interval</label>
    <label><input type="checkbox" bind:checked={emptyStart} /> Allow empty interval start</label>
    <label><input type="checkbox" bind:checked={emptyEnd} /> Allow empty interval end</label>
    <label><input type="checkbox" bind:checked={lockedStart} /> Lock interval start</label>
    <label><input type="checkbox" bind:checked={lockedEnd} /> Lock interval end</label>
    <label><input type="checkbox" bind:checked={disabled} /> Disable interval</label>
    <label><input type="checkbox" bind:checked={readOnly} /> Readonly interval</label>
    <label><input type="checkbox" bind:checked={preserve} /> Preserve invalid interval</label>
    <label><input type="checkbox" bind:checked={preview} /> Preview interval hover</label>
    <label><input type="checkbox" bind:checked={scroll} /> Change interval on scroll</label>
    <label><input type="checkbox" bind:checked={use12Hours} /> Twelve hour interval</label>
    <label><input type="checkbox" bind:checked={milliseconds} /> Interval milliseconds</label>
    <label><input type="checkbox" bind:checked={precise} /> Precise interval milliseconds</label>
    <label><input type="checkbox" bind:checked={stepped} /> Stepped interval</label>
    <label><input type="checkbox" bind:checked={restricted} /> Restricted interval units</label>
    <label><input type="checkbox" bind:checked={fromRestricted} /> Restrict interval from start</label>
    <label><input type="checkbox" bind:checked={defaultOpen} /> Default interval open values</label>
    <label><input type="checkbox" bind:checked={controlledOpen} /> Controlled interval popup</label>
    <label><input type="checkbox" bind:checked={acceptOpen} /> Accept interval popup changes</label>
    <label><input type="checkbox" bind:checked={showNow} /> Show interval Now</label>
    <label><input type="checkbox" bind:checked={mounted} /> Mount interval</label>
    <label><input type="checkbox" bind:checked={allowClear} /> Clearable interval</label>
    <label><input type="checkbox" bind:checked={icons} /> Custom interval icons</label>
    <label><input type="checkbox" bind:checked={styled} /> Styled interval</label>
    <label><input type="checkbox" bind:checked={nested} /> Replace range config</label>
    <label><input type="checkbox" bind:checked={dark} /> Dark interval</label>
    <label><input type="checkbox" bind:checked={compact} /> Compact interval</label>
    <label><input type="checkbox" bind:checked={custom} /> Custom interval cells</label>
    <label><input type="checkbox" bind:checked={renderPanel} /> Custom interval panel</label>
    <label><input type="checkbox" bind:checked={footer} /> Extra interval footer</label>
    <label><input type="checkbox" bind:checked={presets} /> Interval presets</label>
    <label><input type="checkbox" bind:checked={fit} /> Fit interval width</label>
    <label><input type="checkbox" bind:checked={controlledPanel} /> Controlled interval panel</label>
    <label><input type="checkbox" bind:checked={defaultPanel} /> Default interval panel</label>
    <label>Interval format<select aria-label="Interval format" bind:value={format}>
      <option value="default">Default</option><option value="short">Short</option>
      <option value="callback">Callback</option><option value="array">Input formats</option>
    </select></label>
    <label>Interval size<select aria-label="Interval size" bind:value={size}>
      <option value="inherit">Inherit</option><option value="small">Small</option>
      <option value="middle">Middle</option><option value="large">Large</option>
    </select></label>
    <label>Interval variant<select aria-label="Interval variant" bind:value={variant}>
      <option value="inherit">Inherit</option><option value="outlined">Outlined</option>
      <option value="filled">Filled</option><option value="underlined">Underlined</option>
      <option value="borderless">Borderless</option>
    </select></label>
    <button type="button" onclick={() => {
      value = null;
      instance++;
      events = [];
      focusEvents = [];
      panelEvents = [];
    }}>Start empty interval</button>
    <button type="button" onclick={() => {
      value = [dayjs.utc('2025-02-28T18:45:56.789Z'), dayjs.utc('2025-03-01T19:20:30.123Z')];
    }}>Set external interval</button>
    <button type="button" onclick={() => { defaults = [null, null]; }}>Change interval default</button>
    <button type="button" onclick={() => { events = []; }}>Clear interval events</button>
    <button type="button" onclick={() => picker?.focus({ index: 1, cursor: 'all' })}>Focus interval ref</button>
    <button type="button" onclick={() => picker?.focus(1)}>Focus numeric interval ref</button>
    <button type="button" onclick={() => picker?.blur()}>Blur interval ref</button>
    <button type="button" onclick={() => { open = !open; }}>Toggle owned interval popup</button>
    <button type="button">Outside interval</button>
  </div>
  <ConfigProvider
    componentSize="middle"
    theme={{ mode: dark ? 'dark' : 'light', compact, primary: 'purple' }}
    timePicker={{
      class: 'unused-time-context', style: 'outline-offset:88px', variant: 'filled',
      classNames: ({ props }) => ({
        root: `context-interval-${props.size ?? 'raw'} ${Array.isArray(props.value)
          ? 'context-range-value' : 'context-empty-value'}`,
        popup: 'context-interval-popup'
      }),
      styles: { root: 'outline-offset:2px', popup: { root: 'outline-offset:2px' } }
    }}
    rangePicker={{ class: 'range-context', style: 'outline-offset:4px',
      variant: 'underlined', separator }}
  >
    <ConfigProvider rangePicker={nested ? { class: 'nested-range-context' } : undefined}>
      <form onsubmit={event => {
        event.preventDefault();
        data = JSON.stringify([...new FormData(event.currentTarget)]);
      }}>
        <label for="interval-start">Interval start</label>
        <label for="interval-end">Interval end</label>
        <div class="holder">
          {#if mounted}{#key instance}<TimeRangePicker
            bind:this={picker}
            bind:nativeElement={root}
            bind:startInput={start}
            bind:endInput={end}
            id={{ start: 'interval-start', end: 'interval-end' }}
            name="interval"
            value={controlledValue ? value : undefined}
            defaultValue={defaults}
            pickerValue={controlledPanel ? pickerValues : undefined}
            defaultPickerValue={defaultPanel ? pickerValues : undefined}
            {needConfirm}
            {order}
            {use12Hours}
            {showNow}
            open={controlledOpen ? open : undefined}
            disabled={disabled ? true : lockedStart || lockedEnd
              ? [lockedStart, lockedEnd] : undefined}
            allowEmpty={[emptyStart, emptyEnd]}
            inputReadOnly={readOnly}
            preserveInvalidOnBlur={preserve}
            previewValue={preview ? 'hover' : false}
            changeOnScroll={scroll}
            hourStep={stepped ? 2 : 1}
            minuteStep={stepped ? 15 : 1}
            secondStep={stepped ? 10 : 1}
            showMillisecond={milliseconds ? true : undefined}
            millisecondStep={precise ? 1 : 100}
            defaultOpenValue={defaultOpen ? [
              dayjs.utc('2024-02-29T08:09:10.123Z'), dayjs.utc('2024-03-01T18:19:20.456Z')
            ] : undefined}
            disabledTime={(date, part, info) => ({
              disabledHours: () => restricted ? [11, 12] : [],
              disabledMinutes: hour => fromRestricted && part === 'end'
                && info.from && hour === info.from.hour() ? [0, 15, 30] : [],
              disabledSeconds: () => date.second() === 59 && restricted ? [59] : []
            })}
            format={format === 'short' ? 'HH:mm'
              : format === 'array' ? ['HH:mm', 'H:m']
              : format === 'callback' ? value => `At ${value.format('HH:mm:ss')}` : undefined}
            size={size === 'inherit' ? undefined : size}
            variant={variant === 'inherit' ? undefined : variant}
            allowClear={allowClear ? { clearIcon: icons ? clear : undefined } : false}
            suffixIcon={icons ? suffix : undefined}
            prefix={icons ? 'At' : undefined}
            cellRender={custom ? customCell : undefined}
            panelRender={renderPanel ? panel : undefined}
            renderExtraFooter={footer ? extra : undefined}
            presets={presets ? [{ label: 'Afternoon interval', value: () => [
              dayjs.utc('2024-09-15T15:20:30.123Z'), dayjs.utc('2024-09-15T18:40:50.789Z')
            ] }] : undefined}
            onOpenChange={next => {
              events.push(`open:${next}`);
              if (acceptOpen) open = next;
            }}
            onChange={(next, texts) => {
              events.push(`change:${stamps(next)}:${JSON.stringify(texts)}`);
              if (accept) value = next;
            }}
            onCalendarChange={(next, texts, info) => events.push(
              `calendar:${info.range}:${stamps(next)}:${JSON.stringify(texts)}`
            )}
            onOk={next => events.push(`ok:${stamps(next)}`)}
            onClear={() => events.push('clear')}
            onPickerValueChange={(next, info) => panelEvents.push(
              `${info.source}:${info.range}:${stamps(next)}:${JSON.stringify(info.mode)}`
            )}
            onFocus={(event, info) => focusEvents.push(
              `focus:${info.range}:${(event.currentTarget as HTMLElement).tagName}`
            )}
            onBlur={(event, info) => focusEvents.push(
              `blur:${info.range}:${(event.currentTarget as HTMLElement).tagName}`
            )}
            class="fixture-time-range"
            rootClassName="interval-owner"
            classNames={({ props }) => ({
              root: `local-interval-${props.size ?? 'raw'} variant-${props.variant ?? 'raw'}`,
              input: 'local-interval-input', prefix: 'local-interval-prefix',
              suffix: 'local-interval-suffix', popup: {
                root: 'local-interval-popup', content: 'local-interval-content',
                item: 'local-interval-item', footer: 'local-interval-footer',
                container: 'local-interval-container'
              }
            })}
            styles={styled ? { root: 'outline-offset:6px', input: 'outline-offset:6px',
              popup: { root: 'outline-offset:6px', content: 'outline-offset:6px',
                item: 'outline-offset:6px', footer: 'outline-offset:6px',
                container: 'outline-offset:6px' } } : undefined}
            style={[styled ? 'outline-offset:8px' : undefined,
              fit ? 'width:100%' : undefined].filter(Boolean).join(';') || undefined}
          />{/key}{/if}
        </div>
        <button type="submit">Read interval FormData</button>
      </form>
    </ConfigProvider>
  </ConfigProvider>
  <output aria-label="Interval value">{stamps(value)}</output>
  <output aria-label="Interval events">{events.join('|')}</output>
  <output aria-label="Interval focus">{focusEvents.join('|')}</output>
  <output aria-label="Interval panels">{panelEvents.join('|')}</output>
  <output aria-label="Interval refs">{root?.tagName ?? 'none'},{start?.tagName ?? 'none'},{end?.tagName ?? 'none'}</output>
  <output aria-label="Interval data">{data}</output>
  <Form {form} onFinish={values => { submitted = stamps(values.interval); }} class="interval-form">
    <FormItem name="interval" label="Form interval">
      <TimeRangePicker
        value={form.values.interval}
        onChange={next => form.setFieldValue('interval', next)}
      />
    </FormItem>
    <button type="submit">Submit interval form</button>
    <button type="reset">Reset interval form</button>
  </Form>
  <output aria-label="Submitted interval">{submitted}</output>
</section>
