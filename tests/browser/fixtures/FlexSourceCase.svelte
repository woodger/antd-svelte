<script lang="ts">
  import { untrack } from 'svelte';
  import { ConfigProvider, Flex, Input, type FlexConfig } from 'antd-svelte';
  import FlexCustomRoot from './FlexCustomRoot.svelte';
  import FlexNoRefRoot from './FlexNoRefRoot.svelte';
  import { flexSourceCases, flexSourceTheme } from './flex-source-cases';

  let { preset = 'prefix-native', mounted = true, alternate = false }: {
    preset?: string;
    mounted?: boolean;
    alternate?: boolean;
  } = $props();
  const sample = untrack(() => flexSourceCases.find(sample => sample.name === preset)!);
  const { component, ...raw } = sample.props;
  let rootOverride = $state<'div' | 'section' | 'custom' | 'plain'>();
  let kind = $derived(rootOverride ?? component ?? 'div');
  let Root = $derived(kind === 'custom' ? FlexCustomRoot : kind === 'plain' ? FlexNoRefRoot : kind);
  let prefixOverride = $state<string>();
  let nativeElement = $state<HTMLElement>();
  let events = $state(0);
  let lastTarget = $state('');
  let provider = $derived<FlexConfig | undefined>(alternate ? {
    vertical: true, class: 'alternate-flex', style: 'gap:37px'
  } : sample.provider);
  const itemStyle = 'all:unset;box-sizing:border-box;width:60px;height:30px;flex-shrink:0;font:inherit;color:inherit;border:1px solid black';
</script>

{#snippet items()}
  <button type="button" style={itemStyle}>First item</button>
  <input aria-label="Flex source draft" value="Draft" style={itemStyle} />
  <button type="button" style={itemStyle}>Last item</button>
{/snippet}

<ConfigProvider flex={provider} direction={sample.rtl ? 'rtl' : 'ltr'} theme={flexSourceTheme(sample)}>
  <ConfigProvider flex={sample.child ?? undefined}>
    <div data-flex-source style={`width:${sample.width ?? 360}px;font:21px/31px Arial;color:rgb(20,30,40)`}>
      {#if mounted}<Flex {...raw} component={Root} label="Root" bind:nativeElement
        prefixCls={prefixOverride ?? sample.props.prefixCls}
        children={sample.empty ? undefined : items} onclick={event => {
          events++;
          lastTarget = `${event.target instanceof HTMLElement ? event.target.tagName : 'none'}:${event.currentTarget.tagName}`;
        }} />{/if}
    </div>
  </ConfigProvider>
</ConfigProvider>
<button type="button" onclick={() => prefixOverride = 'updated-flex'}>Change Flex prefix</button>
<button type="button" onclick={() => prefixOverride = ''}>Reset Flex prefix</button>
<button type="button" onclick={() => rootOverride = 'custom'}>Use custom Flex root</button>
<button type="button" onclick={() => rootOverride = 'plain'}>Use plain Flex root</button>
<button type="button" onclick={() => rootOverride = 'section'}>Use section Flex root</button>
<output aria-label="Flex source ref">{nativeElement?.tagName ?? 'none'}</output>
<output aria-label="Flex source events">{events}</output>
<output aria-label="Flex source event target">{lastTarget}</output>
<div data-flex-neighbor><Flex gap="middle"><Input aria-label="Flex sibling" /><span>Neighbor</span></Flex></div>
