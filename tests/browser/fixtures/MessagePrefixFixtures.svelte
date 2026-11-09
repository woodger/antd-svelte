<script lang="ts">
  import { App, ConfigProvider, enUS } from 'antd-svelte';
  import MessagePrefixScope from './MessagePrefixScope.svelte';
  import MessagePrefixApp from './MessagePrefixApp.svelte';
  import type { MessagePrefixSample } from './MessagePrefixControl.svelte';
  import reference from './ant-design-message-prefix-reference.json';

  let selected = $state(reference.cases[0].sample.id as string);
  let scope = $state('normal');
  let live = $state(false);
  let prefix = $state('suite');
  let local = $state('');
  let sample = $derived(live ? { id: 'live', prefix, local: local || undefined } :
    (reference.cases.find(entry => entry.sample.id === selected) ?? reference.cases[0])
      .sample as MessagePrefixSample);
</script>

{#snippet content(local = true)}
  {#if sample.app}
    <App message={{ prefixCls: local ? sample.local : undefined, duration: 0 }}>
      <MessagePrefixApp {sample} />
    </App>
  {:else}<MessagePrefixScope {sample} {local} />{/if}
{/snippet}

<section id="message-prefix-fixture">
  <label>Message prefix sample<select bind:value={selected}>
    {#each reference.cases as { sample }}<option value={sample.id}>{sample.id}</option>{/each}
  </select></label>
  <label>Message prefix scope<select bind:value={scope}>
    {#each ['normal', 'nested', 'sibling'] as id}<option value={id}>{id}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={live} /> Live Message prefix</label>
  <label>Live Message prefix value<input bind:value={prefix} /></label>
  <label>Local Message prefix value<input bind:value={local} /></label>
  <ConfigProvider prefixCls={sample.prefix} direction={sample.rtl ? 'rtl' : 'ltr'} locale={enUS}
    theme={{ cssVar: sample.variablePrefix ? { prefix: sample.variablePrefix } : {},
      components: sample.aliases ? { Message: {
        contentPadding: '11px 21px', contentBg: '#fffbe6', fontSize: 17, colorInfo: '#722ed1'
      } } : undefined }}>
    {#key `${sample.id}:${scope}`}
      {#if scope === 'nested'}
        <ConfigProvider prefixCls={sample.childPrefix}>{@render content()}</ConfigProvider>
      {:else if scope === 'sibling'}
        <ConfigProvider prefixCls="ant" direction="ltr" theme={{ inherit: false, cssVar: {} }}>
          {@render content(false)}
        </ConfigProvider>
      {:else}{@render content()}{/if}
    {/key}
  </ConfigProvider>
</section>
