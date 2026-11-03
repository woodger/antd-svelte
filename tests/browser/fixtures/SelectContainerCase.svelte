<script lang="ts">
  import { untrack } from 'svelte';
  import {
    AutoComplete,
    ConfigProvider,
    Select,
    type AutoCompleteInput,
    type ConfigProviderProps
  } from 'antd-svelte';
  import type { SelectContainerCase } from './select-container-presets';

  let {
    sample,
    mounted = true,
    revision = 0,
    alternate = false,
    dark = false,
    componentTheme = false,
    inherit = true,
    onCall
  }: {
    sample: SelectContainerCase;
    mounted?: boolean;
    revision?: number;
    alternate?: boolean;
    dark?: boolean;
    componentTheme?: boolean;
    inherit?: boolean;
    onCall?: () => void;
  } = $props();
  const options = [
    { value: 'alpha', label: 'Alpha' },
    { value: 'beta', label: 'Beta' },
    { value: 'blocked', label: 'Blocked', disabled: true }
  ];
  let shadow = $state<ShadowRoot>();
  let calls = $state<{ getter: string; trigger: string; tag: string; }[]>([]);
  let searches = $state<string[]>([]);
  let values = $state<(string | string[] | undefined)[]>([]);
  let scrolls = $state(0);
  let parentOptions = $derived.by(() => {
    void revision;
    const target = alternate ? 'child' : sample.parent ?? 'parent';
    const props: Partial<ConfigProviderProps> = {};
    if (inherit && sample.parent !== 'none') props.getPopupContainer = trigger => {
      record('parent', trigger);
      return target === 'shadow' ? shadow ?? document.body
        : document.getElementById(`select-${target}`)!;
    };
    return props;
  });
  let childOptions = $derived.by(() => {
    void revision;
    const props: Partial<ConfigProviderProps> = {};
    if (sample.child === 'undefined') props.getPopupContainer = undefined;
    else if (sample.child === 'child') props.getPopupContainer = trigger => {
      record('child', trigger);
      return document.getElementById('select-child')!;
    };
    if (sample.resetTheme) props.theme = { inherit: false, token: { motion: false } };
    return props;
  });
  let localOptions = $derived.by(() => {
    void revision;
    if (sample.local === 'undefined') return { getPopupContainer: undefined };
    if (sample.local === 'local') return { getPopupContainer: (trigger: HTMLElement) => {
      record('local', trigger);
      return document.getElementById('select-local')!;
    } };
    return {};
  });

  function record(getter: string, trigger?: HTMLElement) {
    untrack(() => {
      onCall?.();
      calls.push({
        getter,
        trigger: trigger?.classList.contains('ant-select') ? 'select-root' : 'other',
        tag: trigger?.tagName.toLowerCase() ?? 'none'
      });
    });
  }
</script>

{#snippet textarea(control: AutoCompleteInput)}
  <textarea {...control.attributes} use:control.register rows="3"></textarea>
{/snippet}

<div id="select-parent" data-select-container="parent"></div>
<div id="select-child" data-select-container="child"></div>
<div id="select-local" data-select-container="local"></div>
<div id="select-shadow" data-select-container="shadow" {@attach element => {
  const root = element.attachShadow({ mode: 'open' });
  const style = element.ownerDocument.createElement('style');
  style.textContent = '[popover]{position:fixed;inset:auto;margin:0;border:0;box-sizing:border-box}';
  root.append(style);
  shadow = root;
}}></div>
<div style="width:280px;margin:100px">
  <ConfigProvider {...parentOptions} style={`--select-origin:${dark ? 'dark' : 'light'}`}
    theme={{
      mode: dark ? 'dark' : 'light',
      token: { motion: false },
      cssVar: { key: 'select-container' },
      components: componentTheme ? {
        Select: { optionHeight: 42, optionSelectedBg: '#123456', colorBgElevated: '#234567' }
      } : undefined
    }}>
    <ConfigProvider {...childOptions}>
      {#if mounted}
        <form id="select-container-form">
          {#if sample.component === 'select'}
            <Select {...localOptions} {options} showSearch name="selected" aria-label="Container select"
              onSearch={value => searches.push(value)} onValueChange={value => values.push(value)}
              onPopupScroll={() => scrolls++} />
          {:else if sample.component === 'select-multiple'}
            <Select {...localOptions} {options} mode="multiple" name="selected"
              aria-label="Container select" onSearch={value => searches.push(value)}
              onValueChange={value => values.push(value)} onPopupScroll={() => scrolls++} />
          {:else}
            <AutoComplete {...localOptions} {options} name="selected" aria-label="Container select"
              onSearch={value => searches.push(value)} onChange={value => values.push(value)}
              onPopupScroll={() => scrolls++}
              children={sample.component === 'auto-complete-textarea' ? textarea : undefined} />
          {/if}
        </form>
      {/if}
    </ConfigProvider>
  </ConfigProvider>
</div>
<output aria-label="Select container calls">{JSON.stringify(calls)}</output>
<output aria-label="Select container searches">{JSON.stringify(searches)}</output>
<output aria-label="Select container values">{JSON.stringify(values)}</output>
<output aria-label="Select container scrolls">{scrolls}</output>
