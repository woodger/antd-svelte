<script lang="ts">
  import type { Snippet } from 'svelte';
  import { Tabs, type TabsItem, type TabsMoreProps, type TabsType, type TabsProps } from 'antd-svelte';

  export interface TabsPrefixSample {
    id: string;
    prefix?: string;
    childPrefix?: string;
    variablePrefix?: string;
    local?: string;
    rtl?: boolean;
    aliases?: boolean;
    overflow?: boolean;
    card?: boolean;
    editable?: boolean;
    size?: string;
    placement?: string;
  }

  let { scope, sample, local = true }: {
    scope: string;
    sample: TabsPrefixSample;
    local?: boolean;
  } = $props();
  let nativeElement = $state<HTMLDivElement>();
  let activeKey = $state('a');
  let events = $state<string[]>([]);
  const labels = [alpha, beta, gamma, delta, epsilon, zeta];
  let rootPrefix = $derived(scope === 'sibling' ? 'ant'
    : (scope === 'nested' && sample.childPrefix || sample.prefix || 'ant'));
  let prefix = $derived(local && sample.local || `${rootPrefix}-tabs`);
  let type = $derived<TabsType | undefined>(sample.editable ? 'editable-card'
    : sample.card ? 'card' : undefined);
  let placement = $derived<TabsProps['tabPlacement']>(
    sample.placement === 'start' || sample.placement === 'end' || sample.placement === 'bottom'
      ? sample.placement : 'top'
  );
  let items = $derived<TabsItem[]>(labels
    .slice(0, sample.overflow ? 6 : 3).map((label, index) => ({
      key: String.fromCharCode(97 + index),
      label,
      children: editor,
      disabled: index === 1
    })));
  let more = $derived<TabsMoreProps>({
    trigger: 'click',
    ...(sample.id === 'live' ? { popupRender: popupContent }
      : sample.overflow ? { visible: true } : {})
  });
</script>

{#snippet alpha()}<span class="fixture-tab-label">Alpha</span>{/snippet}
{#snippet beta()}<span class="fixture-tab-label">Beta</span>{/snippet}
{#snippet gamma()}<span class="fixture-tab-label">Gamma</span>{/snippet}
{#snippet delta()}<span class="fixture-tab-label">Delta</span>{/snippet}
{#snippet epsilon()}<span class="fixture-tab-label">Epsilon</span>{/snippet}
{#snippet zeta()}<span class="fixture-tab-label">Zeta</span>{/snippet}
{#snippet editor()}
  <input aria-label={`${scope} tabs panel draft`} value="Draft"
    style="width:90px;height:32px;box-sizing:border-box;font:inherit;padding:0;border:1px solid" />
{/snippet}
{#snippet popupContent(menu: Snippet)}
  {@render menu()}
  <input aria-label={`${scope} tabs popup draft`} value="Popup"
    style="width:90px;height:32px;box-sizing:border-box;font:inherit;padding:0;border:1px solid" />
{/snippet}
<section data-tabs-prefix-scope={scope} data-tabs-prefix-base={prefix}
  style={`width:${sample.overflow ? 260 : 480}px`}>
  <Tabs id={`${scope}-tabs-prefix`} {items} bind:activeKey bind:nativeElement
    prefixCls={local ? sample.local : undefined} {type} {more}
    size={sample.size === 'small' || sample.size === 'large' ? sample.size : undefined}
    tabPlacement={placement} onChange={key => events.push(`change:${key}`)}
    classNames={({ props }) => ({
      root: `fixture-tabs-prefix fixture-raw-${props.prefixCls === undefined ? 'unset' : props.prefixCls || 'empty'}`,
      popup: { root: `fixture-tabs-popup-${scope}` }
    })} />
  <output aria-label={`${scope} Tabs prefix ref`}>{nativeElement ? 'mounted' : 'empty'}</output>
  <output aria-label={`${scope} Tabs prefix events`}>{events.join('|')}</output>
  <button type="button" onclick={() => { activeKey = 'c'; }}>Select third {scope} tab</button>
</section>
