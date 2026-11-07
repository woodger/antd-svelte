<script lang="ts">
  import dayjs, { type Dayjs } from 'dayjs';
  import utc from 'dayjs/plugin/utc.js';
  import {
    TimePicker, ConfigProvider, Form, FormItem, createForm,
    type TimePickerCellRenderInfo, type TimePickerFocusOptions
  } from 'antd-svelte';

  dayjs.extend(utc);

  let value = $state<Dayjs | null>(dayjs.utc('2024-09-15T10:23:44.567Z'));
  let accept = $state(true);
  let needConfirm = $state(true);
  let use12Hours = $state(false);
  let stepped = $state(false);
  let milliseconds = $state(false);
  let precise = $state(false);
  let blocked = $state(false);
  let hideDisabledOptions = $state(false);
  let readOnly = $state(false);
  let preserve = $state(false);
  let preview = $state(true);
  let scroll = $state(false);
  let format = $state('default');
  let localSize = $state<'small' | 'medium' | 'large' | 'inherit'>('inherit');
  let parentSize = $state<'small' | 'medium' | 'large'>('medium');
  let variant = $state<'outlined' | 'filled' | 'borderless' | 'underlined' | 'inherit'>('inherit');
  let dark = $state(false);
  let compact = $state(false);
  let styled = $state(false);
  let nested = $state(false);
  let custom = $state(false);
  let renderPanel = $state(false);
  let footer = $state('default');
  let presets = $state(false);
  let defaultOpen = $state(false);
  let controlledOpen = $state(false);
  let open = $state(false);
  let acceptOpen = $state(true);
  let mounted = $state(true);
  let instance = $state(0);
  let disabled = $state(false);
  let allowClear = $state(true);
  let icons = $state(false);
  let element = $state<HTMLDivElement>();
  let picker = $state<{ focus(options?: TimePickerFocusOptions): void; blur(): void; }>();
  let events = $state<string[]>([]);
  let data = $state('');
  let footerClicks = $state(0);
  const form = createForm<{ time: Dayjs | null }>({
    initialValues: { time: null },
    rules: { time: [{ required: true, message: 'Choose a time' }] }
  });
  let submitted = $state('');
  let uncontrolledDefault = $state(dayjs.utc('2024-09-15T10:23:44.567Z'));
  let uncontrolledValue = $state('');

  function stamp(value: Dayjs | null) {
    return value?.toISOString() ?? 'null';
  }
</script>

<style>
  .controls { display: flex; flex-wrap: wrap; gap: 8px; margin-block: 12px; }
  .holder { max-width: 100%; margin-block: 16px; }
  output { display: block; overflow-wrap: anywhere; }
</style>

{#snippet customCell(unit: number | 'am' | 'pm', info: TimePickerCellRenderInfo)}
  <span class="custom-time-cell" data-type={info.type} data-unit={info.subType}>
    {@render info.originNode()}<small>{unit}</small>
  </span>
{/snippet}
{#snippet panel(content: import('svelte').Snippet)}
  <section class="custom-time-panel" aria-label="Custom time panel">{@render content()}</section>
{/snippet}
{#snippet extra()}<button type="button" onclick={() => { footerClicks++; }}>Modern time footer</button>{/snippet}
{#snippet legacy()}<button type="button" onclick={() => { footerClicks++; }}>Legacy time footer</button>{/snippet}
{#snippet empty()}{/snippet}
{#snippet suffix()}<span class="custom-time-suffix">T</span>{/snippet}
{#snippet clear()}<span class="custom-time-clear">C</span>{/snippet}
{#snippet presetLabel()}<span>Afternoon time preset</span>{/snippet}

<section id="time-picker-fixture">
  <h2>TimePicker</h2>
  <div class="controls">
    <label><input type="checkbox" bind:checked={accept} /> Accept time changes</label>
    <label><input type="checkbox" bind:checked={needConfirm} /> Confirm time</label>
    <label><input type="checkbox" bind:checked={use12Hours} /> Twelve hour time</label>
    <label><input type="checkbox" bind:checked={stepped} /> Stepped time</label>
    <label><input type="checkbox" bind:checked={milliseconds} /> Time milliseconds</label>
    <label><input type="checkbox" bind:checked={precise} /> Precise time milliseconds</label>
    <label><input type="checkbox" bind:checked={blocked} /> Restricted time</label>
    <label><input type="checkbox" bind:checked={hideDisabledOptions} /> Hide disabled time units</label>
    <label><input type="checkbox" bind:checked={readOnly} /> Readonly time input</label>
    <label><input type="checkbox" bind:checked={preserve} /> Preserve invalid time</label>
    <label><input type="checkbox" bind:checked={preview} /> Preview time hover</label>
    <label><input type="checkbox" bind:checked={scroll} /> Change time on scroll</label>
    <label><input type="checkbox" bind:checked={defaultOpen} /> Default open time</label>
    <label><input type="checkbox" bind:checked={controlledOpen} /> Controlled time popup</label>
    <label><input type="checkbox" bind:checked={acceptOpen} /> Accept time popup changes</label>
    <label><input type="checkbox" bind:checked={mounted} /> Mount time picker</label>
    <label><input type="checkbox" bind:checked={disabled} /> Disable time picker</label>
    <label><input type="checkbox" bind:checked={allowClear} /> Clearable time</label>
    <label><input type="checkbox" bind:checked={icons} /> Custom time icons</label>
    <label><input type="checkbox" bind:checked={dark} /> Dark time picker</label>
    <label><input type="checkbox" bind:checked={compact} /> Compact time picker</label>
    <label><input type="checkbox" bind:checked={styled} /> Styled time picker</label>
    <label><input type="checkbox" bind:checked={nested} /> Replace time picker config</label>
    <label><input type="checkbox" bind:checked={custom} /> Custom time cells</label>
    <label><input type="checkbox" bind:checked={renderPanel} /> Custom time panel</label>
    <label><input type="checkbox" bind:checked={presets} /> Time presets</label>
    <label>Time format<select aria-label="Time format" bind:value={format}>
      <option value="default">Default time format</option><option value="short">Short time format</option>
      <option value="callback">Callback time format</option><option value="array">Time input formats</option>
    </select></label>
    <label>Time size<select aria-label="Time size" bind:value={localSize}>
      <option value="inherit">Inherit time size</option><option value="small">Small time size</option>
      <option value="medium">Middle time size</option><option value="large">Large time size</option>
    </select></label>
    <label>Time parent size<select aria-label="Time parent size" bind:value={parentSize}>
      <option value="small">Small parent time size</option><option value="medium">Middle parent time size</option>
      <option value="large">Large parent time size</option>
    </select></label>
    <label>Time variant<select aria-label="Time variant" bind:value={variant}>
      <option value="inherit">Inherit time variant</option><option value="outlined">Outlined time</option>
      <option value="filled">Filled time</option><option value="borderless">Borderless time</option>
      <option value="underlined">Underlined time</option>
    </select></label>
    <label>Time footer<select aria-label="Time footer" bind:value={footer}>
      <option value="default">Default time footer</option><option value="modern">Modern time footer</option>
      <option value="legacy">Legacy time footer</option><option value="empty">Empty time footer</option>
    </select></label>
    <button type="button" onclick={() => {
      value = null;
      instance++;
      events = [];
    }}>Start empty time picker</button>
    <button type="button" onclick={() => { value = dayjs.utc('2025-02-28T18:45:56.789Z'); }}>Set external time</button>
    <button type="button" onclick={() => { events = []; }}>Clear time events</button>
    <button type="button" onclick={() => picker?.focus({ cursor: 'all' })}>Focus time ref</button>
    <button type="button" onclick={() => picker?.blur()}>Blur time ref</button>
    <button type="button" onclick={() => { open = !open; }}>Toggle owned time popup</button>
  </div>
  <ConfigProvider
    componentSize={parentSize}
    theme={{ mode: dark ? 'dark' : 'light', compact, primary: 'purple' }}
    timePicker={{
      class: 'time-context',
      variant: 'filled',
      style: 'outline-offset:4px',
      classNames: ({ props }) => ({
        root: `context-time-${props.size ?? 'raw'}`, popup: 'context-time-popup'
      }),
      styles: { root: 'outline-offset:2px', popup: { root: 'outline-offset:2px' } }
    }}
  >
    <ConfigProvider timePicker={nested ? { class: 'nested-time-context' } : undefined}>
      <form onsubmit={event => {
        event.preventDefault();
        data = JSON.stringify([...new FormData(event.currentTarget)]);
      }}>
        <div class="holder">
          <label for="fixture-time">Meeting time</label>
          {#if mounted}{#key instance}<TimePicker
            bind:this={picker}
            bind:nativeElement={element}
            id="fixture-time"
            name="time"
            {value}
            {needConfirm}
            {use12Hours}
            {hideDisabledOptions}
            open={controlledOpen ? open : undefined}
            onOpenChange={next => {
              events.push(`open:${next}`);
              if (acceptOpen) open = next;
            }}
            onChange={(next, text) => {
              events.push(`change:${stamp(next)}:${JSON.stringify(text)}`);
              if (accept) value = next;
            }}
            onCalendarChange={(next, text, info) => events.push(
              `calendar:${stamp(next)}:${text}:${JSON.stringify(info)}`
            )}
            onSelect={next => events.push(`select:${stamp(next)}`)}
            onOk={next => events.push(`ok:${stamp(next)}`)}
            onClear={() => events.push('clear')}
            inputReadOnly={readOnly}
            preserveInvalidOnBlur={preserve}
            previewValue={preview ? 'hover' : false}
            changeOnScroll={scroll}
            hourStep={stepped ? 2 : 1}
            minuteStep={stepped ? 15 : 1}
            secondStep={stepped ? 10 : 1}
            showMillisecond={milliseconds ? true : undefined}
            millisecondStep={precise ? 1 : 100}
            defaultOpenValue={defaultOpen ? dayjs.utc('2024-02-29T15:16:17.123Z') : undefined}
            disabledTime={blocked ? () => ({
              disabledHours: () => [11, 12],
              disabledMinutes: hour => hour === 10 ? [30] : []
            }) : undefined}
            format={format === 'callback' ? value => `Time ${value.format('HH:mm:ss')}`
              : format === 'array' ? ['HH:mm', 'H:m'] : format === 'short' ? 'HH:mm' : undefined}
            size={localSize === 'inherit' ? undefined : localSize}
            variant={variant === 'inherit' ? undefined : variant}
            disabled={disabled || undefined}
            allowClear={allowClear ? { clearIcon: icons ? clear : undefined } : false}
            suffixIcon={icons ? suffix : undefined}
            prefix={icons ? 'At' : undefined}
            cellRender={custom ? customCell : undefined}
            panelRender={renderPanel ? panel : undefined}
            renderExtraFooter={footer === 'modern' ? extra : footer === 'empty' ? empty : undefined}
            addon={footer === 'legacy' || footer === 'modern' || footer === 'empty'
              ? legacy : undefined}
            presets={presets ? [
              { label: 'Morning time preset', value: dayjs.utc('2024-09-15T09:10:11.123Z') },
              { label: presetLabel, value: () => dayjs.utc('2024-09-15T15:20:30.456Z') }
            ] : undefined}
            class="fixture-time-picker"
            rootClassName="time-owner"
            classNames={({ props }) => ({
              root: `local-time-${props.size ?? 'raw'}`,
              input: 'local-time-input',
              suffix: 'local-time-suffix',
              prefix: 'local-time-prefix',
              popup: {
                root: 'local-time-popup',
                content: 'local-time-content',
                item: 'local-time-item',
                footer: 'local-time-footer',
                container: 'local-time-container'
              }
            })}
            styles={styled ? {
              root: 'outline-offset:6px',
              input: 'outline-offset:6px',
              suffix: 'outline-offset:6px',
              prefix: 'outline-offset:6px',
              popup: {
                root: 'outline-offset:6px',
                content: 'outline-offset:6px',
                item: 'outline-offset:6px',
                footer: 'outline-offset:6px',
                container: 'outline-offset:6px'
              }
            } : undefined}
            style={styled ? 'outline-offset:8px' : undefined}
          />{/key}{/if}
        </div>
        <button type="submit">Read time FormData</button>
      </form>
    </ConfigProvider>
  </ConfigProvider>
  <output aria-label="Time value">{stamp(value)}</output>
  <output aria-label="Time mode">{value?.isUTC() ? 'UTC' : 'local'}</output>
  <output aria-label="Time events">{events.join('|')}</output>
  <output aria-label="Time data">{data}</output>
  <output aria-label="Time ref">{element?.tagName ?? 'none'}</output>
  <output aria-label="Time footer clicks">{footerClicks}</output>
  <label for="uncontrolled-time">Uncontrolled time</label>
  <TimePicker
    id="uncontrolled-time"
    defaultValue={uncontrolledDefault}
    onChange={next => { uncontrolledValue = stamp(next); }}
  />
  <button type="button" onclick={() => {
    uncontrolledDefault = dayjs.utc('2025-02-28T18:45:56.789Z');
  }}>Change default time</button>
  <output aria-label="Uncontrolled time value">{uncontrolledValue}</output>
  <Form {form} onFinish={values => { submitted = stamp(values.time); }}>
    <FormItem name="time" label="Required time">
      <TimePicker value={form.values.time} onChange={next => form.setFieldValue('time', next)} />
    </FormItem>
    <button type="submit">Submit time form</button>
    <button type="button" onclick={() => form.resetFields()}>Reset time form</button>
  </Form>
  <output aria-label="Submitted time">{submitted}</output>
</section>
