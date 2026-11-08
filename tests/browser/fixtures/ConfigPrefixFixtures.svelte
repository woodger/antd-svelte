<script lang="ts">
  import { ConfigProvider } from 'antd-svelte';
  import ConfigPrefixScope, { type ConfigPrefixSample } from './ConfigPrefixScope.svelte';
  import reference from './ant-design-config-prefix-reference.json';

  let selected = $state(reference.cases[0].sample.id as string);
  let live = $state(false);
  let prefix = $state('suite');
  let legacy = $state(false);
  let sample = $derived(live ? { id: 'live', prefix }
    : (reference.cases.find(entry => entry.sample.id === selected) ?? reference.cases[0]).sample);
</script>

<section id="config-prefix-fixture" aria-label="ConfigProvider global prefix">
  <label>Global prefix sample <select bind:value={selected}>
    {#each reference.cases as { sample }}<option value={sample.id}>{sample.id}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={live} /> Live global prefix</label>
  <label>Live prefix <input bind:value={prefix} /></label>
  <label><input type="checkbox" bind:checked={legacy} /> Legacy prefix theme</label>
  <ConfigProvider prefixCls={sample.prefix} direction={'rtl' in sample && sample.rtl ? 'rtl' : 'ltr'}
    theme={'noTheme' in sample && sample.noTheme ? legacy ? { mode: 'dark' } : undefined : { cssVar:
      'variablePrefix' in sample ? { prefix: sample.variablePrefix } : {} }}>
    <ConfigPrefixScope scope="normal" sample={sample as ConfigPrefixSample} />
    <ConfigProvider prefixCls={'childPrefix' in sample ? sample.childPrefix : undefined}
      theme={'childTheme' in sample && sample.childTheme ? {
        inherit: 'reset' in sample && sample.reset ? false : undefined,
        ...('clearVariablePrefix' in sample && sample.clearVariablePrefix
          ? { cssVar: { prefix: undefined } } : {}),
        token: { motion: false }
      } : undefined}>
      <ConfigPrefixScope scope="nested" sample={sample as ConfigPrefixSample} />
    </ConfigProvider>
  </ConfigProvider>
  <ConfigProvider theme={{ cssVar: {} }}>
    <ConfigPrefixScope scope="sibling" sample={sample as ConfigPrefixSample} local={false} />
  </ConfigProvider>
</section>
