<script lang="ts">
  import { ConfigProvider, Popconfirm, Popover, Tooltip, type ThemeConfig } from 'antd-svelte';
  import { overlayThemePresets } from './overlay-theme-presets';

  let preset = $state('default');
  let mounted = $state(true);
  let enabled = $state(true);
  let hashed = $state(true);
  let arrow = $state(true);
  let colorOverride = $state('');
  let arrowSize = $state<number | undefined>();
  let tooltipOpen = $state<boolean | undefined>(false);
  let popoverOpen = $state<boolean | undefined>(false);
  let confirmOpen = $state<boolean | undefined>(false);
  let editor = $state('Popup draft');
  let changes = $state(0);
  let confirmations = $state(0);
  let resolveConfirm = $state<(() => void) | undefined>();
  let config = $derived<ThemeConfig>({
    ...overlayThemePresets[preset],
    cssVar: { ...overlayThemePresets[preset].cssVar, key: 'overlay-source-scope' },
    hashed,
    token: arrowSize === undefined ? overlayThemePresets[preset].token
      : { ...overlayThemePresets[preset].token, sizePopupArrow: arrowSize },
    components: colorOverride ? {
      ...overlayThemePresets[preset].components,
      Popover: { ...overlayThemePresets[preset].components?.Popover, colorBgElevated: colorOverride }
    } : overlayThemePresets[preset].components
  });

  function openSamples() {
    tooltipOpen = true;
    popoverOpen = true;
    confirmOpen = true;
  }
</script>

<style>
  .samples { display: flex; align-items: start; justify-content: space-around; gap: 12px; margin-block: 48px; }
</style>

{#snippet content()}
  Popover content
  <label>Popup editor <input bind:value={editor} /></label>
{/snippet}
{#snippet description()}
  Confirm description
  <Popover title="Nested title" content="Nested content" trigger="click"
    popupClass="themed-nested-popover"><button type="button">Nested themed panel</button></Popover>
{/snippet}

<section id="overlay-theme-fixture">
  <h2>Source overlay tokens</h2>
  <label>Overlay token preset <select bind:value={preset} aria-label="Overlay token preset">
    {#each Object.keys(overlayThemePresets) as name}<option value={name}>{name}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={mounted} /> Mount themed overlays</label>
  <label><input type="checkbox" bind:checked={enabled} /> Apply source overlay tokens</label>
  <label><input type="checkbox" bind:checked={hashed} /> Hash themed overlays</label>
  <label><input type="checkbox" bind:checked={arrow} /> Show themed arrows</label>
  <label>Overlay color override <input bind:value={colorOverride} /></label>
  <label>Global arrow width <input type="number" bind:value={arrowSize} /></label>
  {#if mounted}
    <ConfigProvider theme={enabled ? config : undefined}>
      <div class="samples" id="overlay-theme-samples">
        <button type="button" onclick={openSamples}>Open themed overlays</button>
        <Tooltip title="Tooltip reference" bind:open={tooltipOpen} placement="bottom" {arrow}
          autoAdjustOverflow={false} onOpenChange={() => changes++}>
          <button type="button" id="themed-tooltip-anchor">Tooltip</button>
        </Tooltip>
        <Popover title="Popover title" {content} bind:open={popoverOpen} placement="bottom" {arrow}
          autoAdjustOverflow={false} trigger="click" popupClass="themed-popover"
          onOpenChange={() => changes++}>
          <button type="button" id="themed-popover-anchor">Popover</button>
        </Popover>
        <Popconfirm title="Confirm title" {description} bind:open={confirmOpen}
          placement="bottom" {arrow} autoAdjustOverflow={false}
          okText="Confirm" cancelText="Cancel" onOpenChange={() => changes++}
          onConfirm={() => {
            confirmations++;
            return new Promise<void>(resolve => { resolveConfirm = resolve; });
          }}>
          <button type="button" id="themed-confirm-anchor">Popconfirm</button>
        </Popconfirm>
      </div>
    </ConfigProvider>
  {/if}
  <button type="button" onclick={() => {
    resolveConfirm?.();
    resolveConfirm = undefined;
  }}>
    Resolve themed confirmation
  </button>
  <output aria-label="Overlay open changes">{changes}</output>
  <output aria-label="Themed confirmations">{confirmations}</output>
</section>
