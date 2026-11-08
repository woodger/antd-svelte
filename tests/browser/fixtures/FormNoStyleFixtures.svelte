<script lang="ts">
  import { untrack } from 'svelte';
  import reference from './ant-design-form-no-style-reference.json';
  import FormNoStyleCase, { type FormNoStyleSample } from './FormNoStyleCase.svelte';
  import FormNoStyleCompositionFixtures from './FormNoStyleCompositionFixtures.svelte';

  let { initialCase = 'default', initialMetadata = false }: {
    initialCase?: string;
    initialMetadata?: boolean;
  } = $props();
  let selected = $state(untrack(() => initialCase));
  const samples: FormNoStyleSample[] = [
    ...reference.cases.map(({ sample }) => sample as FormNoStyleSample),
    { id: 'event-order', pair: true }, { id: 'async', async: true },
    { id: 'nested' }, { id: 'list' }
  ];
  let sample = $derived(samples.find(({ id }) => id === selected)!);
</script>

<section id="form-no-style-fixture" aria-label="Form no style">
  <label>Form no style sample
    <select bind:value={selected}>
      {#each samples as sample}<option value={sample.id}>{sample.id}</option>{/each}
    </select>
  </label>
  {#key selected}
    {#if selected === 'nested' || selected === 'list'}
      <FormNoStyleCompositionFixtures list={selected === 'list'} />
    {:else}<FormNoStyleCase {sample} {initialMetadata} />{/if}
  {/key}
</section>
