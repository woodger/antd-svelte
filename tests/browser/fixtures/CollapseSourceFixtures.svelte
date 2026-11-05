<script lang="ts">
  import CollapseSourceCase from './CollapseSourceCase.svelte';
  import type { CollapseSourceSample } from './CollapseSourceCase.svelte';
  import reference from './ant-design-collapse-reference.json';

  let selected = $state('default');
  let mounted = $state(true);
  let configured = $state(false);
  let prefix = $state<string>();
  let themed = $state(false);
  let sample = $derived.by((): CollapseSourceSample => {
    const original = reference.cases.find(item => item.name === selected)! as CollapseSourceSample;

    return {
      ...original,
      ...(configured ? { provider: 'function', semantic: 'function' } : {}),
      ...(themed ? { theme: 'tokens' } : {}),
      props: { ...original.props, ...(prefix === undefined ? {} : { prefixCls: prefix }) }
    };
  });

  function reset() {
    mounted = true;
    configured = false;
    prefix = undefined;
    themed = false;
  }
</script>

<section id="collapse-source-fixture">
  <h2>Source Collapse API</h2>
  <label>Collapse source case<select bind:value={selected} onchange={reset}>
    {#each reference.cases as item}<option value={item.name}>{item.name}</option>{/each}
  </select></label>
  <button type="button" onclick={() => mounted = !mounted}>Toggle Collapse source mount</button>
  <button type="button" onclick={() => configured = !configured}>Configure Collapse source</button>
  <button type="button" onclick={() => prefix = 'live-collapse'}>Change Collapse source prefix</button>
  <button type="button" onclick={() => themed = !themed}>Theme Collapse source</button>
  <button type="button">Before Collapse source</button>
  {#key selected}<CollapseSourceCase {sample} {mounted} />{/key}
  <button type="button">After Collapse source</button>
</section>
