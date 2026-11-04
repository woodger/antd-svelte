<script lang="ts">
  import { untrack } from 'svelte';
  import { ConfigProvider, Divider, Input, type DividerConfig } from 'antd-svelte';
  import {
    dividerConfigCases,
    dividerConfigClasses,
    dividerConfigStyles,
    dividerConfigProvider,
    dividerConfigTheme
  } from './divider-config-cases';

  let { preset = 'prefix-native', mounted = true, alternate = false }: {
    preset?: string;
    mounted?: boolean;
    alternate?: boolean;
  } = $props();
  const sample = untrack(() => dividerConfigCases.find(sample => sample.name === preset)!);
  let prefixOverride = $state<string>();
  let prefix = $derived(prefixOverride ?? sample.props.prefixCls);
  let nativeElement = $state<HTMLDivElement>();
  let provider = $derived<DividerConfig | undefined>(alternate ? {
    class: 'alternate-provider', styles: { content: 'padding-inline-end:37px' }
  } : dividerConfigProvider(sample));
  let localClasses = $derived(sample.functions === 'empty' ? () => undefined
    : sample.functions === 'both' || sample.functions === 'local'
      ? dividerConfigClasses : sample.props.classNames);
  let localStyles = $derived(sample.functions === 'empty' ? () => undefined
    : sample.functions === 'both' || sample.functions === 'local'
      ? dividerConfigStyles : sample.props.styles);
</script>

<ConfigProvider divider={provider} componentSize={sample.contextSize}
  direction={sample.rtl ? 'rtl' : 'ltr'} theme={dividerConfigTheme(sample)}>
  <ConfigProvider divider={sample.child ?? undefined}>
    <div data-divider-config-case style="width:360px">
      {#if mounted}<Divider {...sample.props} prefixCls={prefix} bind:nativeElement
        classNames={localClasses} styles={localStyles} />{/if}
    </div>
  </ConfigProvider>
  {#if mounted}<div><span data-divider-inline>Start<Divider prefixCls={prefix} orientation="vertical" />End</span></div>{/if}
  <Input aria-label="Divider config neighbor" />
</ConfigProvider>
<button type="button" onclick={() => prefixOverride = 'updated-divider'}>Change Divider prefix</button>
<button type="button" onclick={() => prefixOverride = ''}>Reset Divider prefix</button>
<output aria-label="Configured Divider ref">{nativeElement?.tagName ?? 'none'}</output>
<ConfigProvider theme={{ mode: 'dark', primary: 'green' }}>
  <div data-divider-config-neighbor><Divider>Neighbor</Divider><Input aria-label="Divider sibling" /></div>
</ConfigProvider>
