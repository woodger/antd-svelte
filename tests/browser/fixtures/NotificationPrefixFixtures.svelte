<script lang="ts">
  import { App, ConfigProvider, enUS } from 'antd-svelte';
  import NotificationPrefixScope from './NotificationPrefixScope.svelte';
  import NotificationPrefixApp from './NotificationPrefixApp.svelte';
  import type { NotificationPrefixSample } from './NotificationPrefixControl.svelte';
  import reference from './ant-design-notification-prefix-reference.json';

  let selected = $state(reference.cases[0].sample.id as string);
  let scope = $state('normal');
  let live = $state(false);
  let app = $state(false);
  let prefix = $state('suite');
  let local = $state('');
  let sample = $derived(live ? {
    id: `live-${app ? 'app' : 'holder'}`, prefix, local: local || undefined, app
  } :
    (reference.cases.find(entry => entry.sample.id === selected) ?? reference.cases[0])
      .sample as NotificationPrefixSample);
</script>

{#snippet content(local = true)}
  {#if sample.app}
    <App notification={{ prefixCls: local ? sample.local : undefined, duration: 0 }}>
      <NotificationPrefixApp {sample} />
    </App>
  {:else}<NotificationPrefixScope {sample} {local} />{/if}
{/snippet}

<section id="notification-prefix-fixture">
  <label>Notification prefix sample<select bind:value={selected}>
    {#each reference.cases as { sample }}<option value={sample.id}>{sample.id}</option>{/each}
  </select></label>
  <label>Notification prefix scope<select bind:value={scope}>
    {#each ['normal', 'nested', 'sibling'] as id}<option value={id}>{id}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={live} /> Live Notification prefix</label>
  <label><input type="checkbox" bind:checked={app} /> App Notification prefix mode</label>
  <label>Live Notification prefix value<input bind:value={prefix} /></label>
  <label>Local Notification prefix value<input bind:value={local} /></label>
  <ConfigProvider prefixCls={sample.prefix} direction={sample.rtl ? 'rtl' : 'ltr'} locale={enUS}
    theme={{ cssVar: sample.variablePrefix ? { prefix: sample.variablePrefix } : {},
      components: sample.aliases ? { Notification: {
        width: 420, fontSize: 17, fontSizeLG: 19, colorBgElevated: '#fffbe6', colorInfo: '#722ed1'
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
