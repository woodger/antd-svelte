<script lang="ts">
  import ResultSourceCase from './ResultSourceCase.svelte';
  import type { ResultSourceSample } from './ResultSourceCase.svelte';
  import reference from './ant-design-result-reference.json';
  import { ConfigProvider, Result } from 'antd-svelte';

  let selected = $state('default');
  let mounted = $state(true);
  let configured = $state(false);
  let prefix = $state<string>();
  let themed = $state(false);
  let rtl = $state(false);
  let sample = $derived.by((): ResultSourceSample => {
    const original = reference.cases.find(item => item.name === selected)! as ResultSourceSample;

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

<section id="result-source-fixture">
  <h2>Source Result API</h2>
  <label>Result source case<select bind:value={selected} onchange={reset}>
    {#each reference.cases as item}<option value={item.name}>{item.name}</option>{/each}
  </select></label>
  <button type="button" onclick={() => mounted = !mounted}>Toggle Result source mount</button>
  <button type="button" onclick={() => configured = !configured}>Configure Result source</button>
  <button type="button" onclick={() => prefix = 'live-result'}>Change Result source prefix</button>
  <button type="button" onclick={() => themed = !themed}>Theme Result source</button>
  <button type="button" onclick={() => rtl = !rtl}>RTL Result source</button>
  <input aria-label="Result source outside draft" value="Outside draft" />
  <button type="button">Before Result source</button>
  {#key selected}<ResultSourceCase {sample} {mounted} />{/key}
  <button type="button">After Result source</button>
  <ConfigProvider theme={{ cssVar: { key: 'result-sibling' },
    components: { Result: { titleFontSize: 15, iconFontSize: 33 } } }}>
    <Result id="result-source-sibling" title="Sibling Result" />
  </ConfigProvider>
</section>
