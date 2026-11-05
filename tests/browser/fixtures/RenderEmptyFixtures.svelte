<script lang="ts">
  import RenderEmptyCase from './RenderEmptyCase.svelte';
  import type { RenderEmptySample } from './RenderEmptyCase.svelte';
  import type { RenderEmptyComponent } from 'antd-svelte';
  import reference from './ant-design-render-empty-reference.json';

  let selected = $state('Select-text');
  let renderer = $state<string>();
  let alternate = $state(false);
  let suffix = $state('');
  let observedText = $state('[]');
  const observed: (RenderEmptyComponent | undefined)[] = [];
  let sample = $derived.by((): RenderEmptySample => {
    const original = reference.cases.find(item => item.name === selected)! as RenderEmptySample;
    return { ...original, ...(renderer ? { renderer } : {}) };
  });

  function reset() {
    renderer = undefined;
    alternate = false;
    suffix = '';
    observed.length = 0;
    observedText = '[]';
  }
</script>

<section id="render-empty-fixture">
  <h2>ConfigProvider renderEmpty</h2>
  <label>Render empty case<select bind:value={selected} onchange={reset}>
    {#each reference.cases as item}<option value={item.name}>{item.name}</option>{/each}
  </select></label>
  <button type="button" onclick={() => renderer = 'snippet'}>Use empty snippet</button>
  <button type="button" onclick={() => alternate = !alternate}>Replace empty producer</button>
  <button type="button" onclick={() => suffix += '!'}>Change empty producer value</button>
  <button type="button" onclick={() => renderer = 'absent'}>Remove empty producer</button>
  <button type="button" onclick={() => observedText = JSON.stringify(observed)}>Read empty calls</button>
  <button type="button">Before render empty</button>
  {#key selected}<RenderEmptyCase {sample} {alternate} {suffix} {observed} />{/key}
  <button type="button">After render empty</button>
  <output aria-label="Render empty calls">{observedText}</output>
</section>
