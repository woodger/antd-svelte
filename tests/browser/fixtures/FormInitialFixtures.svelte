<script lang="ts">
  import { untrack } from 'svelte';
  import { ConfigProvider } from 'antd-svelte';
  import reference from './ant-design-form-initial-reference.json';
  import FormInitialCase, { type FormInitialSample } from './FormInitialCase.svelte';

  let { initialCase = 'text' }: { initialCase?: string } = $props();
  let selected = $state(untrack(() => initialCase));
  const samples: FormInitialSample[] = [
    ...reference.cases.map(({ sample }) => sample),
    { id: 'update', initialValue: 'First' },
    { id: 'late-overlap', parentInitial: true, name: ['profile', 'name'],
      initialValue: 'Child', childHidden: true },
    ...reference.lateMount.map(({ sample }) => ({
      ...sample, id: `late-${sample.id}`, show: false, initialValue: 'Local',
      preset: 'stored' in sample || 'set' in sample
    }))
  ];
  let sample = $derived(samples.find(({ id }) => id === selected)!);
</script>

<section id="form-initial-fixture" aria-label="Form field initial values">
  <label>Form initial sample
    <select bind:value={selected}>
      {#each samples as sample}<option value={sample.id}>{sample.id}</option>{/each}
    </select>
  </label>
  <ConfigProvider theme={{ cssVar: {}, token: { motion: false } }}>
    {#key selected}<FormInitialCase {sample} />{/key}
  </ConfigProvider>
</section>
