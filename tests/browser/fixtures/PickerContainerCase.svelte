<script lang="ts">
  import { untrack } from 'svelte';
  import dayjs, { type Dayjs } from 'dayjs';
  import {
    ConfigProvider,
    DatePicker,
    RangePicker,
    TimePicker,
    TimeRangePicker,
    type ConfigProviderProps,
    type DatePickerProps,
    type RangePickerValue
  } from 'antd-svelte';
  import type { PickerContainerCase } from './picker-container-presets';
  import PickerContainerFooter from './PickerContainerFooter.svelte';

  let {
    sample,
    mounted = true,
    revision = 0,
    alternate = false,
    dark = false,
    disabled = false,
    onCall
  }: {
    sample: PickerContainerCase;
    mounted?: boolean;
    revision?: number;
    alternate?: boolean;
    dark?: boolean;
    disabled?: boolean;
    onCall?: () => void;
  } = $props();
  const base = dayjs('2026-05-14T10:20:30.123');
  let value = $state.raw<Dayjs | null>(base);
  let range = $state.raw<RangePickerValue>([base, base.add(1, 'day')]);
  let nativeRoot = $state<HTMLDivElement>();
  let startInput = $state<HTMLInputElement>();
  let endInput = $state<HTMLInputElement>();
  let shadow = $state<ShadowRoot>();
  let calls = $state<{
    getter: string;
    args: number;
    tag: string;
    trigger: string;
  }[]>([]);
  let values = $state<unknown[]>([]);
  let openings = $state<boolean[]>([]);
  let parentOptions = $derived.by(() => {
    void revision;
    const props: Partial<ConfigProviderProps> = {};
    if (sample.parent !== 'none') {
      props.getPopupContainer = getter('parent', alternate ? 'child' : sample.parent ?? 'parent');
    }
    return props;
  });
  let childOptions = $derived.by(() => {
    void revision;
    const props: Partial<ConfigProviderProps> = {};
    if (sample.child) {
      props.getPopupContainer = sample.child === 'undefined' ? undefined : getter('child', 'child');
    }
    if (sample.resetTheme) props.theme = { inherit: false, token: { motion: false } };
    return props;
  });
  let localOptions = $derived.by(() => {
    void revision;
    const props: Pick<DatePickerProps, 'getPopupContainer'> = {};
    if (sample.local) {
      props.getPopupContainer = sample.local === 'undefined' ? undefined
        : getter('local', alternate ? 'child' : sample.local);
    }
    return props;
  });
  let time = $derived(sample.component.startsWith('time'));
  let format = $derived(time ? 'HH:mm:ss.SSS'
    : sample.showTime ? 'YYYY-MM-DD HH:mm:ss.SSS' : 'YYYY-MM-DD');
  let shared = $derived({
    ...localOptions,
    disabled,
    format,
    defaultOpen: Boolean(sample.initial),
    placement: sample.placement,
    style: 'width:100%',
    name: 'selected',
    'aria-label': 'Picker entry',
    renderExtraFooter: footer,
    onOpenChange: (next: boolean) => openings.push(next)
  });

  function getter(name: string, target: string) {
    return sample.initial === 'zero'
      ? (...args: [HTMLElement?]) => get(name, target, args)
      : (trigger?: HTMLElement) => get(name, target, [trigger]);
  }
  function get(getter: string, target: string, args: [HTMLElement?]) {
    untrack(() => {
      onCall?.();
      const trigger = args[0];
      calls.push({
        getter,
        args: args.length,
        tag: trigger?.tagName.toLowerCase() ?? 'none',
        trigger: trigger?.classList.contains('ant-picker') ? 'picker-root' : 'other'
      });
    });
    return target === 'shadow' ? shadow ?? document.body
      : document.getElementById(`picker-${target}`) ?? document.body;
  }
  function changeSingle(next: Dayjs | null) {
    value = next;
    values.push(next?.format('YYYY-MM-DD HH:mm:ss.SSS') ?? null);
  }
  function changeRange(next: RangePickerValue | null) {
    range = next ?? [null, null];
    values.push(range.map(value => value?.format('YYYY-MM-DD HH:mm:ss.SSS') ?? null));
  }
</script>

{#snippet footer()}<PickerContainerFooter />{/snippet}

<div id="picker-parent" data-picker-container="parent"></div>
<div id="picker-child" data-picker-container="child"></div>
<div id="picker-local" data-picker-container="local"></div>
<div id="picker-shadow" data-picker-container="shadow" {@attach element => {
  const root = element.attachShadow({ mode: 'open' });
  const style = element.ownerDocument.createElement('style');
  root.append(style);
  // Потребитель выбирает собственные стили ShadowRoot; библиотека их не переносит.
  function syncStyle() {
    const css = Array.from(element.ownerDocument.head.querySelectorAll('style'))
      .map(node => node.textContent).join('\n');
    if (style.textContent !== css) style.textContent = css;
  }
  const observer = new MutationObserver(syncStyle);
  observer.observe(element.ownerDocument.head, {
    childList: true,
    subtree: true,
    characterData: true
  });
  syncStyle();
  shadow = root;
  return () => observer.disconnect();
}}></div>
<div style="width:600px;margin:500px 200px">
  <ConfigProvider {...parentOptions} direction={sample.rtl ? 'rtl' : undefined}
    style={`--picker-origin:${dark ? 'dark' : 'light'}`} theme={{
      mode: dark ? 'dark' : 'light',
      token: { motion: false }
    }}>
    <ConfigProvider {...childOptions}>
      <form id="picker-container-form">
        {#if mounted}
          {#if sample.component === 'date'}
            <DatePicker {...shared} {value} onChange={changeSingle}
              bind:nativeElement={nativeRoot} showTime={sample.showTime ? {
                format: 'HH:mm:ss.SSS', millisecondStep: 1
              } : false} />
          {:else if sample.component === 'date-range'}
            <RangePicker {...shared} value={range} onChange={changeRange}
              bind:nativeElement={nativeRoot} bind:startInput bind:endInput
              showTime={sample.showTime ? { format: 'HH:mm:ss.SSS', millisecondStep: 1 } : false} />
          {:else if sample.component === 'time'}
            <TimePicker {...shared} {value} onChange={changeSingle}
              bind:nativeElement={nativeRoot} showMillisecond millisecondStep={1} />
          {:else}
            <TimeRangePicker {...shared} value={range} onChange={changeRange}
              bind:nativeElement={nativeRoot} bind:startInput bind:endInput
              showMillisecond millisecondStep={1} />
          {/if}
        {/if}
      </form>
    </ConfigProvider>
  </ConfigProvider>
</div>
<output aria-label="Picker container calls">{JSON.stringify(calls)}</output>
<output aria-label="Picker container values">{JSON.stringify(values)}</output>
<output aria-label="Picker container openings">{JSON.stringify(openings)}</output>
<output aria-label="Picker container refs">{JSON.stringify({
  root: Boolean(nativeRoot),
  start: Boolean(startInput),
  end: Boolean(endInput)
})}</output>
