<script lang="ts">
  import reference from './ant-design-upload-config-reference.json';
  import UploadConfigScope, { type UploadConfigSample } from './UploadConfigScope.svelte';

  const samples = [...reference.cases, ...reference.progress];
  let selected = $state(0);
  let live = $state(false);
  let provider = $state('object');
  let mounted = $state(true);
  let requestOnly = $state(false);
  let localRequest = $state(false);
  let hold = $state(false);
  let events = $state<string[]>([]);
  let sample = $derived<UploadConfigSample>(live ? { id: 'live', provider }
    : samples[selected].sample);
</script>

<section id="upload-config-fixture">
  <label>Upload config sample<select bind:value={selected}>
    {#each samples as entry, index}<option value={index}>{entry.sample.id}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={live} /> Live Upload config</label>
  <label><input type="checkbox" bind:checked={mounted} /> Mount Upload config</label>
  <label><input type="checkbox" bind:checked={requestOnly} /> Configured request mode</label>
  <label><input type="checkbox" bind:checked={localRequest} /> Local configured request</label>
  <label><input type="checkbox" bind:checked={hold} /> Hold configured requests</label>
  <label>Live Upload provider<select bind:value={provider}>
    {#each ['object', 'callback', 'empty'] as value}<option value={value}>{value}</option>{/each}
  </select></label>
  <input aria-label="Upload config editor" value="Draft" />
  {#key live ? 'live' : selected}
    {#if mounted}<UploadConfigScope {sample} {requestOnly} {localRequest} {hold}
      onEvent={event => events.push(event)} />{/if}
  {/key}
  <output aria-label="Retained configured request events">{JSON.stringify(events)}</output>
</section>
