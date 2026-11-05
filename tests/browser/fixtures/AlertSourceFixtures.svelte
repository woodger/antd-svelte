<script lang="ts">
  import AlertSourceCase from './AlertSourceCase.svelte';
  import type { AlertSourceSample } from './AlertSourceCase.svelte';
  import reference from './ant-design-alert-reference.json';

  let selected = $state('default');
  let mounted = $state(true);
  let configured = $state(false);
  let prefix = $state<string>();
  let themed = $state(false);
  let sample = $derived.by((): AlertSourceSample => {
    const original = reference.cases.find(item => item.name === selected)! as AlertSourceSample;

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

<section id="alert-source-fixture">
  <h2>Source Alert API</h2>
  <label>Alert source case<select bind:value={selected} onchange={reset}>
    {#each reference.cases as item}<option value={item.name}>{item.name}</option>{/each}
  </select></label>
  <button type="button" onclick={() => mounted = !mounted}>Toggle Alert source mount</button>
  <button type="button" onclick={() => configured = !configured}>Configure Alert source</button>
  <button type="button" onclick={() => prefix = 'live-alert'}>Change Alert source prefix</button>
  <button type="button" onclick={() => themed = !themed}>Theme Alert source</button>
  <button type="button">Before Alert source</button>
  <span id="close-label">Owner close</span><span id="close-help">Owner help</span>
  {#key selected}<AlertSourceCase {sample} {mounted} />{/key}
  <button type="button">After Alert source</button>
</section>
