<script lang="ts">
  import reference from './ant-design-select-token-separators-reference.json';
  import SelectTagsCase from './SelectTagsCase.svelte';
  import { getSelectTokenSeparators, type SelectTokenSample } from './select-token-cases';

  let selected = $state(reference.cases[0].sample.id as string);
  let nativeChecks = $state(false);
  let semicolon = $state(false);
  let cancelPaste = $state(false);
  let cancelComposition = $state(false);
  let nativeEvents = $state<string[]>([]);
  let sample = $derived((reference.cases.find(entry => entry.sample.id === selected)
    ?? reference.cases[0]).sample as SelectTokenSample);

  function recordNative(this: HTMLInputElement, event: Event) {
    nativeEvents = [...nativeEvents, `${event.type}:${this === event.currentTarget}`];
    if (event.type === 'paste' && cancelPaste
      || event.type === 'compositionend' && cancelComposition) event.preventDefault();
  }
</script>

<section id="select-token-fixture" aria-label="Select token separators">
  <label>Token sample
    <select bind:value={selected}>
      {#each reference.cases as { sample }}<option value={sample.id}>{sample.id}</option>{/each}
    </select>
  </label>
  <label><input type="checkbox" bind:checked={nativeChecks} />Native token constraints</label>
  <label><input type="checkbox" bind:checked={semicolon} />Use semicolon tokens</label>
  <label><input type="checkbox" bind:checked={cancelPaste} />Cancel token paste</label>
  <label><input type="checkbox" bind:checked={cancelComposition} />Cancel composition end</label>
  {#each [sample] as current (current.id)}
    <SelectTagsCase sample={current} {nativeChecks}
      tokenSeparators={semicolon ? [';'] : getSelectTokenSeparators(current)}
      inputHandlers={{
        onpaste: recordNative, oncompositionstart: recordNative, oncompositionend: recordNative
      }} />
  {/each}
</section>
<output aria-label="Token native events">{JSON.stringify(nativeEvents)}</output>
