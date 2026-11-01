<script lang="ts">
  import { theme, type MappingAlgorithm } from 'antd-svelte';

  let algorithm = $state('default');
  let colorPrimary = $state('#1677ff');
  let fontSize = $state(14);
  let motion = $state(true);
  let focusOutline = $state(true);
  const algorithms: Record<string, MappingAlgorithm | readonly MappingAlgorithm[]> = {
    default: theme.defaultAlgorithm,
    dark: theme.darkAlgorithm,
    compact: theme.compactAlgorithm,
    'dark-compact': [theme.darkAlgorithm, theme.compactAlgorithm]
  };
  let token = $derived(theme.getDesignToken({
    algorithm: algorithms[algorithm],
    token: { colorPrimary, fontSize, motion, focusOutline }
  }));
</script>

<style>
  section { padding: 20px; }
  .controls { display: flex; flex-wrap: wrap; gap: 8px; margin-block: 16px; }
  .preview { padding: 12px; border: 1px solid; }
  output { display: block; overflow-wrap: anywhere; }
  .json { max-height: 80px; overflow: auto; font-family: monospace; }
</style>

<section id="theme-tokens-fixture">
  <h2>Source design tokens</h2>
  <div class="controls">
    <label>Algorithm <select bind:value={algorithm} aria-label="Token algorithm">
      <option value="default">Default</option><option value="dark">Dark</option>
      <option value="compact">Compact</option><option value="dark-compact">Dark compact</option>
    </select></label>
    <label>Primary <input aria-label="Token primary" bind:value={colorPrimary} /></label>
    <label>Font <input type="number" aria-label="Token font size" bind:value={fontSize} /></label>
    <label><input type="checkbox" bind:checked={motion} /> Token motion</label>
    <label><input type="checkbox" bind:checked={focusOutline} /> Token focus outline</label>
  </div>
  <div class="preview" data-testid="token-preview"
    style:background={token.colorBgContainer} style:color={token.colorText}
    style:border-color={token.colorBorder} style:border-radius={`${token.borderRadius}px`}
    style:font-size={`${token.fontSize}px`}>
    Source token preview
  </div>
  <output aria-label="Token primary result">{token.colorPrimary}</output>
  <output aria-label="Token font result">{token.fontSize}</output>
  <output aria-label="Token height result">{token.controlHeight}</output>
  <output aria-label="Token duration result">{token.motionDurationSlow}</output>
  <output aria-label="Token focus result">{token.lineWidthFocus}</output>
  <output class="json" aria-label="Full design tokens">{JSON.stringify(token)}</output>
</section>
