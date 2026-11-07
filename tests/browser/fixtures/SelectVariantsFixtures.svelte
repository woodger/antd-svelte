<script lang="ts">
  import { ConfigProvider, Select, enUS, theme, type SelectProps } from 'antd-svelte';
  import reference from './ant-design-select-variants-reference.json' with { type: 'json' };

  let { sample }: { sample?: typeof reference.cases[number]; } = $props();
  let selectedCase = $state('single-default');
  let current = $derived(sample ?? reference.cases.find(item => item.name === selectedCase)
    ?? reference.cases[0]);
  let override = $state<'preset' | NonNullable<SelectProps['variant']>>('preset');
  let appearance = $derived(override !== 'preset' ? override
    : current.variant === 'outlined' || current.variant === 'filled'
      || current.variant === 'borderless' || current.variant === 'underlined'
      ? current.variant : undefined);
  let status = $derived<SelectProps['status']>(current.status === 'error' || current.status === 'warning'
    ? current.status : undefined);
  let single = $state<string | undefined>('alpha');
  let multiple = $state<string[]>(['alpha']);
  let searchable = $state(false);
  let changes = $state(0);
  const options = [{ value: 'alpha', label: 'Alpha' },
    { value: 'beta', label: 'Beta', disabled: true }, { value: 'gamma', label: 'Gamma' }];

  function resetCase() {
    override = 'preset';
    single = 'alpha';
    multiple = ['alpha'];
    changes = 0;
  }
</script>

<section id="select-variants-fixture" aria-label="Select variants fixture">
  <label>Select variant case<select aria-label="Select variant case" bind:value={selectedCase}
      onchange={resetCase}>
      {#each reference.cases as item}<option value={item.name}>{item.name}</option>{/each}
    </select></label>
  <label>Select variant override<select aria-label="Select variant override" bind:value={override}>
    <option>preset</option><option>outlined</option><option>filled</option>
    <option>borderless</option><option>underlined</option>
  </select></label>
  <label><input type="checkbox" bind:checked={searchable} /> Search in variant select</label>
  <ConfigProvider locale={enUS} direction={current.direction === 'rtl' ? 'rtl' : 'ltr'}
    theme={{ cssVar: {}, token: { motion: false }, algorithm: current.theme === 'dark'
      ? theme.darkAlgorithm : current.theme === 'compact' ? theme.compactAlgorithm
        : theme.defaultAlgorithm }}>
    <form id="select-variant-control" aria-label="Select variant form" style="width:220px">
      {#if current.mode === 'multiple'}
        <Select {options} mode="multiple" variant={appearance} bordered={current.bordered}
          disabled={current.disabled} {status} bind:value={multiple} allowClear
          showSearch={searchable} name="choice" aria-label="Variant select"
          onValueChange={() => { changes++; }} />
      {:else}
        <Select {options} variant={appearance} bordered={current.bordered}
          disabled={current.disabled} {status} bind:value={single} allowClear
          showSearch={searchable} name="choice" aria-label="Variant select"
          onValueChange={() => { changes++; }} />
      {/if}
    </form>
  </ConfigProvider>
  <output aria-label="Select variant changes">{changes}</output>
</section>
