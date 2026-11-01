<script lang="ts">
  import dayjs, { type Dayjs } from 'dayjs';
  import utc from 'dayjs/plugin/utc.js';
  import { ConfigProvider, DatePicker, RangePicker, SpaceCompact, TimePicker, TimeRangePicker,
    type RangePickerValue } from 'antd-svelte';

  dayjs.extend(utc);
  const initial = dayjs.utc('2024-09-15T10:23:44.567Z');
  let kind = $state('date');
  let value = $state<Dayjs | null>(initial);
  let range = $state<RangePickerValue | null>([initial, initial.add(1, 'day')]);
  let empty = $state(false);
  let chinese = $state(false);
  let spacing = $state(true);
  let waveDisabled = $state(false);
  let font = $state(15);
  let oks = $state(0);
  let submits = $state(0);
  let reports = $state<Record<string, unknown>[]>([]);
  let locale = $derived({ lang: { ok: chinese ? '确定' : 'Apply' } });
</script>

<section id="picker-button-fixture">
  <h2>Picker Button composition</h2>
  <label>Footer picker kind <select aria-label="Footer picker kind" bind:value={kind}>
    <option value="date">Date</option><option value="range">Date range</option>
    <option value="time">Time</option><option value="time-range">Time range</option>
  </select></label>
  <label><input type="checkbox" bind:checked={empty} /> Empty footer value</label>
  <label><input type="checkbox" bind:checked={chinese} /> Chinese confirmation text</label>
  <label><input type="checkbox" bind:checked={spacing} /> Space confirmation text</label>
  <label><input type="checkbox" bind:checked={waveDisabled} /> Disable footer Wave</label>
  <label>Footer token font <input type="number" bind:value={font} /></label>
  <ConfigProvider componentSize="large" theme={{
    cssVar: { key: 'picker-button-source' },
    components: { Button: { colorPrimary: '#00b96b', algorithm: true,
      contentFontSizeSM: font, fontWeight: 600 } }
  }} button={{
    class: 'source-picker-button',
    shape: 'round',
    autoInsertSpace: spacing,
    classNames: ({ props }) => ({ root: `footer-${props.size}-${typeof props.children}` }),
    styles: { root: 'outline-offset:3px' }
  }} wave={{
    disabled: waveDisabled,
    triggerType: 'pointerdown',
    showEffect: (target, info) => reports.push({
      component: info.component, event: info.event.type, target: target.tagName,
      primary: info.token.colorPrimary, className: target.className
    })
  }}>
    <form onsubmit={event => { event.preventDefault(); submits++; }}>
      <SpaceCompact size="large">
        {#key kind}
          {#if kind === 'date' || kind === 'time'}
            <label for="footer-single">Footer value</label>
            {#if kind === 'date'}
              <DatePicker id="footer-single" name="footer-value" value={empty ? null : value}
                defaultPickerValue={initial} showTime={{ millisecondStep: 1 }}
                format="YYYY-MM-DD HH:mm:ss.SSS" needConfirm {locale}
                onChange={next => { value = next; }} onOk={() => oks++} />
            {:else}
              <TimePicker id="footer-single" name="footer-value" value={empty ? null : value}
                defaultPickerValue={initial} format="HH:mm:ss.SSS" millisecondStep={1} needConfirm
                {locale} onChange={next => { value = next; }} onOk={() => oks++} />
            {/if}
          {:else}
            <label for="footer-start">Footer start</label><label for="footer-end">Footer end</label>
            {#if kind === 'range'}
              <RangePicker id={{ start: 'footer-start', end: 'footer-end' }} name="footer-range"
                value={empty ? null : range} defaultPickerValue={[initial, initial.add(1, 'day')]}
                showTime={{ millisecondStep: 1 }} format="YYYY-MM-DD HH:mm:ss.SSS" needConfirm
                {locale} onChange={next => { range = next; }} onOk={() => oks++} />
            {:else}
              <TimeRangePicker id={{ start: 'footer-start', end: 'footer-end' }} name="footer-range"
                value={empty ? null : range} defaultPickerValue={[initial, initial.add(1, 'day')]}
                format="HH:mm:ss.SSS" millisecondStep={1} needConfirm {locale}
                onChange={next => { range = next; }} onOk={() => oks++} />
            {/if}
          {/if}
        {/key}
      </SpaceCompact>
    </form>
  </ConfigProvider>
  <output aria-label="Footer Wave reports">{JSON.stringify(reports)}</output>
  <output aria-label="Footer confirmations">{oks}</output>
  <output aria-label="Footer submits">{submits}</output>
  <output aria-label="Footer value">{value?.toISOString() ?? 'null'}</output>
  <output aria-label="Footer UTC">{value?.isUTC() ? 'UTC' : 'local'}</output>
</section>
