<script lang="ts">
  import { untrack } from 'svelte';
  import {
    ConfigProvider,
    Dropdown,
    Popconfirm,
    Popover,
    Slider,
    Tooltip,
    TypographyText,
    type ConfigProviderProps,
    type SliderTooltipConfig,
    type TooltipProps
  } from 'antd-svelte';
  import type { OverlayContainerCase } from './overlay-container-presets';
  import OverlayContainerContent from './OverlayContainerContent.svelte';

  let {
    sample,
    opened = $bindable(false),
    mounted = true,
    revision = 0,
    alternate = false,
    dark = false,
    componentTheme = false,
    onCall
  }: {
    sample: OverlayContainerCase;
    opened?: boolean;
    mounted?: boolean;
    revision?: number;
    alternate?: boolean;
    dark?: boolean;
    componentTheme?: boolean;
    onCall?: () => void;
  } = $props();
  let shadow = $state<ShadowRoot>();
  let calls = $state<{ getter: string; trigger: string; tag: string; }[]>([]);
  let parentOptions = $derived.by(() => {
    void revision;
    const target = alternate ? 'child' : sample.parent ?? 'parent';
    const options: Partial<ConfigProviderProps> = {};
    if (sample.parent !== 'none') options.getPopupContainer = trigger => {
      record('parent', trigger);
      return target === 'shadow' ? shadow ?? document.body
        : document.getElementById(`overlay-${target}`)!;
    };
    return options;
  });
  let childOptions = $derived.by(() => {
    const options: Partial<ConfigProviderProps> = {};
    if (sample.child === 'undefined') options.getPopupContainer = undefined;
    else if (sample.child === 'child') options.getPopupContainer = trigger => {
      record('child', trigger);
      return document.getElementById('overlay-child')!;
    };
    if (sample.resetTheme) options.theme = { inherit: false, token: { motion: false } };
    return options;
  });
  let localOptions = $derived.by(() => {
    const options: Pick<TooltipProps, 'getPopupContainer'> = {};
    if (sample.local === 'undefined') options.getPopupContainer = undefined;
    else if (sample.local === 'local') options.getPopupContainer = trigger => {
      record('local', trigger);
      return document.getElementById('overlay-local')!;
    };
    return options;
  });
  let tooltipOptions = $derived.by(() => {
    const options: SliderTooltipConfig = { open: opened };
    if (sample.tooltip === 'undefined') options.getPopupContainer = undefined;
    else if (sample.tooltip === 'tooltip') options.getPopupContainer = trigger => {
      record('tooltip', trigger);
      return document.getElementById('overlay-tooltip')!;
    };
    return options;
  });

  function record(getter: string, trigger?: HTMLElement) {
    untrack(() => {
      onCall?.();
      calls.push({
        getter,
        trigger: trigger?.getAttribute('data-overlay-trigger')
          ?? (trigger?.classList.contains('ant-slider-handle') ? 'slider-handle'
            : trigger?.classList.contains('ant-typography') ? 'typography' : 'other'),
        tag: trigger?.tagName.toLowerCase() ?? 'none'
      });
    });
  }
</script>

{#snippet content()}<OverlayContainerContent />{/snippet}
{#snippet trigger()}
  {#if sample.svg}
    <svg width="40" height="30" data-overlay-trigger="svg" aria-hidden="true">
      <rect width="40" height="30" />
    </svg>
  {:else}
    <button type="button" data-overlay-trigger={sample.component}>Overlay trigger</button>
  {/if}
{/snippet}

<div id="overlay-parent" data-overlay-container="parent"></div>
<div id="overlay-child" data-overlay-container="child"></div>
<div id="overlay-local" data-overlay-container="local"></div>
<div id="overlay-tooltip" data-overlay-container="tooltip"></div>
<div id="overlay-shadow" data-overlay-container="shadow" {@attach element => {
  const root = element.attachShadow({ mode: 'open' });
  const style = element.ownerDocument.createElement('style');
  style.textContent = '[popover]{position:fixed;inset:auto;margin:0;border:0;padding:0}';
  root.append(style);
  shadow = root;
}}></div>
<div style="width:280px;margin:100px">
  <ConfigProvider {...parentOptions}
    style={`--overlay-origin:${dark ? 'dark' : 'light'}`} theme={{
      mode: dark ? 'dark' : 'light',
      token: { motion: false },
      cssVar: { key: 'overlay-container' },
      components: componentTheme ? {
        Tooltip: { colorBgSpotlight: '#123456' },
        Popover: { colorBgElevated: '#234567', titleMinWidth: 185 },
        Dropdown: { colorBgElevated: '#345678' }
      } : undefined
    }}>
    <ConfigProvider {...childOptions}>
      {#if mounted}
        {#if sample.component === 'tooltip'}
          <Tooltip {...localOptions} title={content} bind:open={opened}
            mouseEnterDelay={0} mouseLeaveDelay={0}>{@render trigger()}</Tooltip>
        {:else if sample.component === 'popover'}
          <Popover {...localOptions} {content} bind:open={opened} trigger="click"
            mouseEnterDelay={0} mouseLeaveDelay={0}>{@render trigger()}</Popover>
        {:else if sample.component === 'popconfirm'}
          <Popconfirm {...localOptions} title="Confirm overlay" description={content}
            bind:open={opened} okText="Confirm" cancelText="Cancel">
            {@render trigger()}
          </Popconfirm>
        {:else if sample.component === 'dropdown'}
          <Dropdown getPopupContainer={localOptions.getPopupContainer} bind:open={opened}
            trigger="click" mouseEnterDelay={0} mouseLeaveDelay={0} menu={{ items: [
              { key: 'alpha', label: 'Alpha command' }, { key: 'beta', label: 'Beta command' }
            ] }}>{@render trigger()}</Dropdown>
        {:else if sample.component === 'typography'}
          <TypographyText style="width:120px;display:inline-block" data-overlay-trigger="typography"
            ellipsis={{ tooltip: { ...localOptions, open: opened } }}
            children="A long typography label which needs a tooltip for its full content" />
        {:else if sample.component === 'slider-range'}
          <Slider range defaultValue={[20, 60]} tooltip={tooltipOptions} />
        {:else}
          <Slider defaultValue={30} tooltip={tooltipOptions} />
        {/if}
      {/if}
    </ConfigProvider>
  </ConfigProvider>
</div>
<output aria-label="Overlay container calls">{JSON.stringify(calls)}</output>
