<script lang="ts">
  import EmptySourceCase from './EmptySourceCase.svelte';
  import type { EmptySourceSample } from './EmptySourceCase.svelte';
  import reference from './ant-design-empty-reference.json';

  let selected = $state('default');
  let mounted = $state(true);
  let configured = $state(false);
  let prefix = $state<string>();
  let themed = $state(false);
  let rtl = $state(false);
  let sample = $derived.by((): EmptySourceSample => {
    const original = reference.cases.find(item => item.name === selected)! as EmptySourceSample;

    return {
      ...original,
      ...(configured ? { provider: 'function', semantic: 'function' } : {}),
      ...(themed ? { theme: 'aliases' } : {}),
      ...(rtl ? { rtl: true } : {}),
      props: { ...original.props, ...(prefix === undefined ? {} : { prefixCls: prefix }) }
    };
  });

  function reset() {
    mounted = true;
    configured = false;
    prefix = undefined;
    themed = false;
    rtl = false;
  }
</script>

<section id="empty-source-fixture">
  <h2>Source Empty API</h2>
  <label>Empty source case<select bind:value={selected} onchange={reset}>
    {#each reference.cases as item}<option value={item.name}>{item.name}</option>{/each}
  </select></label>
  <button type="button" onclick={() => mounted = !mounted}>Toggle Empty source mount</button>
  <button type="button" onclick={() => configured = !configured}>Configure Empty source</button>
  <button type="button" onclick={() => prefix = 'live-empty'}>Change Empty source prefix</button>
  <button type="button" onclick={() => themed = !themed}>Theme Empty source</button>
  <button type="button" onclick={() => rtl = !rtl}>RTL Empty source</button>
  <input aria-label="Empty source outside draft" value="Outside draft" />
  <button type="button">Before Empty source</button>
  {#key selected}<EmptySourceCase {sample} {mounted} />{/key}
  <button type="button">After Empty source</button>
</section>
