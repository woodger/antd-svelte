<script lang="ts">
  import {
    Anchor, ConfigProvider, theme,
    type AnchorConfig, type AnchorDirection, type AnchorItem
  } from 'antd-svelte';
  import { anchorConfigProfile } from './anchor-config-presets';
  import reference from './ant-design-anchor-config-reference.json' with { type: 'json' };

  let { sample, probeSSR = false }: {
    sample?: typeof reference.cases[number];
    probeSSR?: boolean;
  } = $props();
  let selectedCase = $state('default');
  let current = $derived(sample ?? reference.cases.find(item => item.name === selectedCase)
    ?? reference.cases[0]);
  let updated = $state(false);
  let recolored = $state(false);
  let localUpdated = $state(false);
  let classOnly = $state(false);
  let classContext = $state<AnchorConfig>({ class: 'context-anchor-plain' });
  let clicks = $state(0);
  let changes = $state<string[]>([]);
  let context = $derived<AnchorConfig>({ ...anchorConfigProfile(current.context),
    ...(updated || recolored ? {
      style: updated ? 'opacity:0.6;outline-offset:7px' : undefined,
      styles: info => {
        const original = anchorConfigProfile(current.context).styles;
        return { ...(typeof original === 'function' ? original(info) : original),
          ...(updated ? { itemTitle: 'color:#722ed1;padding:20px 28px' } : {}),
          indicator: `background-color:${recolored ? '#d4380d' : '#722ed1'}` };
      }
    } : {}) });
  let nested = $derived<AnchorConfig | undefined>(current.nested === 'empty' ? {}
    : current.nested === 'replace' ? { class: 'context-replaced' } : undefined);
  let local = $derived<AnchorConfig>({ ...anchorConfigProfile(current.local, true),
    ...(localUpdated ? { styles: { itemTitle: 'color:#873800;padding:12px 16px',
      indicator: 'background-color:#873800' } } : {}) });
  let direction = $derived<AnchorDirection>(current.direction === 'horizontal'
    ? 'horizontal' : 'vertical');
  const items: AnchorItem[] = [
    { key: 'one', href: '#anchor-config-one', title: 'First', children: [
      { key: 'nested', href: '#anchor-config-nested', title: 'Nested' }
    ] },
    { key: 'two', href: '#anchor-config-two', title: 'Second' }
  ];
  const getCurrentAnchor = () => '#anchor-config-two';

  function serverContainer(): Window {
    throw new Error('Anchor must not read its container during SSR');
  }

  function resetCase() {
    updated = false;
    recolored = false;
    localUpdated = false;
    classOnly = false;
    classContext.class = 'context-anchor-plain';
    clicks = 0;
    changes = [];
  }
</script>

<style>
  .anchor-config-main :global(.context-anchor-layout .ant-anchor-link-title) { padding: 18px 24px; }
</style>

<section id="anchor-config-fixture">
  <h2>Anchor component configuration</h2>
  <label>Anchor config preset<select aria-label="Anchor config preset"
    bind:value={selectedCase} onchange={resetCase}>
    {#each reference.cases as item}<option value={item.name}>{item.name}</option>{/each}
  </select></label>
  <button onclick={() => { updated = !updated; }}>Update Anchor layout styles</button>
  <button onclick={() => { recolored = !recolored; }}>Recolor Anchor indicator</button>
  <button onclick={() => { localUpdated = !localUpdated; }}>Update local Anchor styles</button>
  <button onclick={() => { classOnly = true; }}>Use Anchor class configuration</button>
  <button onclick={() => { classContext.class = 'context-anchor-layout'; }}>Expand Anchor class layout</button>
  <output aria-label="Configured Anchor clicks">{clicks}</output>
  <output aria-label="Configured Anchor changes">{JSON.stringify(changes)}</output>
  <ConfigProvider anchor={classOnly ? classContext : context} direction={current.rtl ? 'rtl' : 'ltr'}
    theme={{ cssVar: {}, token: { motion: false }, algorithm: current.theme === 'dark'
      ? theme.darkAlgorithm : current.theme === 'compact' ? theme.compactAlgorithm
        : theme.defaultAlgorithm, components: current.token ? { Anchor: { algorithm: true,
          colorPrimary: '#eb2f96', linkPaddingBlock: 9, linkPaddingInlineStart: 23 } } : undefined }}>
    <ConfigProvider anchor={nested}>
      <div class="anchor-config-main" dir={current.rtl ? 'rtl' : 'ltr'}
        style="width:680px;color:rgb(0,0,0)">
        {#key current.name}
          <Anchor {...local} {items} {direction} offsetTop={12} bounds={5}
            affix={!!current.affix} showInkInFixed={current.showInk !== false} {getCurrentAnchor}
            getContainer={probeSSR ? serverContainer : undefined}
            onClick={() => { clicks++; }} onChange={href => { changes = [...changes, href]; }} />
        {/key}
      </div>
    </ConfigProvider>
  </ConfigProvider>
  <ConfigProvider theme={{ cssVar: {}, token: { motion: false } }}>
    <Anchor class="outside-anchor-config" affix={false}
      items={[{ key: 'outside', href: '#outside-config', title: 'Outside' }]} />
  </ConfigProvider>
</section>
