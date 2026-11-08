<script lang="ts">
  import {
    App,
    ConfigProvider,
    type AppInstance,
    type AppProps,
    type NotificationPlacement
  } from 'antd-svelte';
  import AppConsumer from './AppConsumer.svelte';
  import reference from './ant-design-app-reference.json';

  interface Sample {
    id: string;
    component?: 'main' | false;
    rtl?: boolean;
    prefix?: string;
    aliases?: boolean;
    context?: boolean;
    local?: boolean;
  }
  let selected = $state('default');
  let sample = $derived((reference.cases.find(entry => entry.sample.id === selected)
    ?? reference.cases[0]).sample as Sample);
  let component = $state<AppProps['component']>('div');
  let maxCount = $state(2);
  let top = $state(40);
  let placement = $state<NotificationPlacement>('bottomLeft');
  let duration = $state(0);
  let mounted = $state(true);
  let nested = $state(false);
  let firstApi = $state.raw<AppInstance>();
  let api = $state.raw<AppInstance>();
  let nativeElement = $state<HTMLElement>();

  function receiveApi(next: AppInstance) {
    firstApi ??= next;
    api = next;
  }

  function hotkey(event: KeyboardEvent) {
    if (!event.ctrlKey || !event.altKey) return;
    if (event.key === 'h') mounted = !mounted;
  }
</script>

<svelte:window onkeydown={hotkey} />

<section id="app-fixture" aria-label="App context fixture">
  <label>App sample <select bind:value={selected}>
    {#each reference.cases.filter(entry => entry.sample.id !== 'global-prefix') as { sample }}
      <option value={sample.id}>{sample.id}</option>
    {/each}
  </select></label>
  <label>App root <select bind:value={component}>
    <option value="div">div</option><option value="section">section</option>
    <option value={false}>fragment</option>
  </select></label>
  <label>App maxCount <input type="number" bind:value={maxCount} /></label>
  <label>App notice top <input type="number" bind:value={top} /></label>
  <label>App notice duration <input type="number" bind:value={duration} /></label>
  <label>App notification placement <select bind:value={placement}>
    <option value="bottomLeft">bottomLeft</option><option value="topRight">topRight</option>
  </select></label>
  <label><input type="checkbox" bind:checked={nested} /> Nested App</label>
  <output id="app-identity">{Boolean(api && firstApi
    && ['message', 'notification', 'modal'].every(key =>
      api![key as keyof AppInstance] === firstApi![key as keyof AppInstance]))}</output>
  <output id="app-native-tag">{nativeElement?.tagName.toLowerCase() ?? 'none'}</output>
  <div id="app-host">
    {#if mounted}
      <ConfigProvider direction={sample.rtl ? 'rtl' : undefined}
        theme={{ hashed: false, cssVar: {}, components: sample.aliases ? { App: {
          colorText: '#123456', fontSize: 20, fontFamily: 'monospace', lineHeight: 2
        } } : undefined }}
        app={sample.context ? { class: 'context-app', style: 'color:#abcdef;padding:5px' } : undefined}
        style={sample.component === false
          ? 'color:#000;font-size:16px;line-height:normal;font-family:"Times New Roman"' : undefined}>
        <App component={sample.component ?? component} prefixCls={sample.prefix}
          class={sample.local ? 'local-app' : undefined}
          style={sample.local ? 'color:#112233;padding:7px' : undefined}
          message={{ maxCount, duration, top }}
          notification={{ maxCount, duration, placement, top, bottom: 50 }}
          bind:nativeElement>
          <AppConsumer onApi={receiveApi} />
          {#if nested}
            <App message={{ top: 64 }} notification={{ bottom: 72 }}>
              <AppConsumer scope="nested" />
            </App>
          {/if}
        </App>
      </ConfigProvider>
    {/if}
  </div>
</section>
