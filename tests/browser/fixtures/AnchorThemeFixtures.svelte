<script lang="ts">
  import { Anchor, ConfigProvider, type AnchorItem, type ThemeConfig } from 'antd-svelte';
  import { anchorThemePresets } from './anchor-theme-presets';

  let preset = $state('default');
  let enabled = $state(true);
  let mounted = $state(true);
  let hashed = $state(true);
  let compact = $state(false);
  let parentAliases = $state(false);
  let spacingOverride = $state(false);
  let color = $state('');
  let container = $state<HTMLDivElement>();
  let clicks = $state(0);
  let changes = $state<string[]>([]);
  const items: AnchorItem[] = [
    { key: 'overview', href: '#theme-overview', title: 'Overview' },
    {
      key: 'delivery', href: '#theme-delivery', title: 'Delivery',
      children: [{ key: 'details', href: '#theme-details', title: 'Details' }]
    },
    { key: 'payment', href: '#theme-payment', title: 'Payment' }
  ];
  const directions = ['vertical', 'horizontal'] as const;
  const current = () => '#theme-delivery';
  let config = $derived<ThemeConfig>({
    ...anchorThemePresets[preset],
    hashed,
    cssVar: { ...anchorThemePresets[preset].cssVar, key: 'anchor-source-scope' },
    components: color ? {
      ...anchorThemePresets[preset].components,
      Anchor: { ...anchorThemePresets[preset].components?.Anchor, colorPrimary: color }
    } : anchorThemePresets[preset].components
  });
</script>

<style>
  .samples { width:300px;max-width:100%;margin-block:24px; }
</style>

<section id="anchor-theme-fixture">
  <h2>Source Anchor tokens</h2>
  <label>Anchor token preset <select bind:value={preset} aria-label="Anchor token preset">
    {#each Object.keys(anchorThemePresets) as name}<option value={name}>{name}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={enabled} /> Apply source Anchor tokens</label>
  <label><input type="checkbox" bind:checked={mounted} /> Mount themed Anchor</label>
  <label><input type="checkbox" bind:checked={hashed} /> Hash themed Anchor</label>
  <label><input type="checkbox" bind:checked={compact} /> Native compact Anchor</label>
  <label><input type="checkbox" bind:checked={parentAliases} /> Parent Anchor aliases</label>
  <label><input type="checkbox" bind:checked={spacingOverride} /> Override Anchor spacing</label>
  <label>Anchor color override <input bind:value={color} /></label>
  {#if mounted}
    <ConfigProvider theme={enabled ? config : { compact }}>
      <div class="samples" style={parentAliases ? '--ant-font-size:30px;--ant-color-text:red' : undefined}>
        {#each directions as direction}
          <Anchor class={`anchor-token-${direction}`} {direction} affix={false} showInkInFixed
            {items} getCurrentAnchor={current} />
        {/each}
        <Anchor class="anchor-token-main" {items} affix={false} showInkInFixed
          getContainer={() => container!} onClick={() => clicks++}
          onChange={next => { changes = [...changes, next]; }}
          styles={spacingOverride ? { root: '--ant-anchor-link-padding-inline-start:31px' } : undefined}
          style={spacingOverride ? '--ant-anchor-link-padding-inline-start:37px' : undefined} />
      </div>
      <div bind:this={container} id="anchor-theme-scroll" style="height:200px;overflow:auto">
        <div id="theme-overview" style="height:200px">Overview section</div>
        <div id="theme-delivery" style="height:200px">Delivery section</div>
        <div id="theme-details" style="height:200px">Details section</div>
        <div id="theme-payment" style="height:600px">Payment section</div>
      </div>
    </ConfigProvider>
  {/if}
  <output aria-label="Anchor theme clicks">{clicks}</output>
  <output aria-label="Anchor theme changes">{JSON.stringify(changes)}</output>
</section>
