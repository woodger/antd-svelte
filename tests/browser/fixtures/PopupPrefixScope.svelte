<script lang="ts">
  import { ConfigProvider, Tooltip, Popover, Popconfirm, Slider } from 'antd-svelte';

  export type PopupPrefixKind = 'tooltip' | 'popover' | 'popconfirm' | 'single' | 'range';
  export interface PopupPrefixSample {
    id: string;
    kind: PopupPrefixKind;
    prefix?: string;
    childPrefix?: string;
    variablePrefix?: string;
    rtl?: boolean;
    local?: string;
  }
  let { scope, sample, local = true }: {
    scope: string;
    sample: PopupPrefixSample;
    local?: boolean;
  } = $props();
  let kind = $derived(sample.kind);
  let family = $derived(kind === 'single' || kind === 'range' ? 'slider' : kind);
  let prefix = $derived(local && sample.local !== undefined
    ? sample.local ? `${sample.local}-${family}` : '' : undefined);
  let position = $derived(30 + ['normal', 'nested', 'sibling'].indexOf(scope) * 400);

  function container(trigger?: HTMLElement) {
    return trigger?.closest<HTMLElement>('[data-popup-prefix-scope]')
      ?.querySelector<HTMLElement>('[data-prefix-portal]') ?? document.body;
  }
</script>

<div data-popup-prefix-scope={scope}
  style={`position:fixed;top:250px;left:${position}px;width:220px`}>
  <ConfigProvider getPopupContainer={container}>
    <div data-prefix-widget={kind}>
      {#if kind === 'single'}
        <Slider prefixCls={prefix} defaultValue={25}
          tooltip={{ open: true, placement: 'top', autoAdjustOverflow: false }} />
      {:else if kind === 'range'}
        <Slider prefixCls={prefix} range defaultValue={[25, 75]}
          tooltip={{ open: true, placement: 'top', autoAdjustOverflow: false }} />
      {:else if kind === 'tooltip'}
        <Tooltip prefixCls={prefix} open title="Title" placement="top"
          autoAdjustOverflow={false} destroyOnHidden>
          <button type="button" data-prefix-anchor>Anchor</button>
        </Tooltip>
      {:else if kind === 'popover'}
        <Popover prefixCls={prefix} open title="Title" content="Content" placement="top"
          autoAdjustOverflow={false} destroyOnHidden>
          <button type="button" data-prefix-anchor>Anchor</button>
        </Popover>
      {:else}
        <Popconfirm prefixCls={prefix} open title="Title" description="Details" placement="top"
          autoAdjustOverflow={false} destroyOnHidden okText="OK" cancelText="Cancel">
          <button type="button" data-prefix-anchor>Anchor</button>
        </Popconfirm>
      {/if}
    </div>
  </ConfigProvider>
  <div data-prefix-portal></div>
  <input aria-label={`${scope} widget draft`} value="initial draft" />
</div>
