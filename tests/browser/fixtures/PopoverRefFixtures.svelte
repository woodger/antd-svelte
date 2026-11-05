<script lang="ts">
  import { ConfigProvider } from 'antd-svelte';
  import reference from './ant-design-popover-ref-reference.json';
  import PopoverRefCase from './PopoverRefCase.svelte';

  let source = $state(true);
  let name = $state(reference.cases[0].name);
  let sample = $derived(reference.cases.find(item => item.name === name)!);
</script>

<section id="popover-ref-fixture">
  <h2>Popover imperative ref</h2>
  <label><input type="checkbox" bind:checked={source} /> Source ref config</label>
  <select aria-label="Popover ref case" bind:value={name}>
    {#each reference.cases as item}<option value={item.name}>{item.name}</option>{/each}
  </select>
  <ConfigProvider theme={source ? { cssVar: {}, token: { motion: false } }
    : { mode: 'light', primary: 'blue' }}
    popover={source ? {} : undefined} popconfirm={source ? {} : undefined}>
    {#key sample.name}<PopoverRefCase {sample} />{/key}
  </ConfigProvider>
</section>
