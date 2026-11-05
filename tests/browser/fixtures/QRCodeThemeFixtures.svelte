<script lang="ts">
  import reference from './ant-design-qrcode-theme-reference.json';
  import QRCodeThemeCase from './QRCodeThemeCase.svelte';

  let selected = $state('component-aliases');
  let sample = $derived(reference.cases.find(item => item.name === selected)!);
  let enabled = $state(true);
  let mounted = $state(true);
  let inherit = $state(true);
  let textColor = $state<string>();
  let coverBackground = $state<string>();
  let padding = $state<number>();
</script>

<section id="qrcode-theme-fixture">
  <h2>Source QRCode theme</h2>
  <select aria-label="QRCode theme preset" bind:value={selected}>
    {#each reference.cases as item}<option value={item.name}>{item.name}</option>{/each}
  </select>
  <label><input type="checkbox" bind:checked={enabled} /> Apply source QRCode theme</label>
  <label><input type="checkbox" bind:checked={inherit} /> Inherit child QRCode theme</label>
  <label><input type="checkbox" bind:checked={mounted} /> Mount themed QRCode controls</label>
  <button type="button" onclick={() => textColor = '#135200'}>Update QRCode global text</button>
  <button type="button" onclick={() => {
    coverBackground = '#e6f4ff';
    padding = 24;
  }}>Update QRCode cover and padding</button>
  <QRCodeThemeCase {sample} {enabled} {mounted} {inherit} {textColor} {coverBackground} {padding} />
</section>
