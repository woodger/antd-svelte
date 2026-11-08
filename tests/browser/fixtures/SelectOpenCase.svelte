<script lang="ts">
  import { untrack } from 'svelte';
  import { Select, type RenderEmptyContent } from 'antd-svelte';

  export interface SelectOpenSample {
    id: string;
    mode: 'single' | 'multiple' | 'tags';
    defaultOpen?: boolean;
    open?: boolean | null;
    disabled?: boolean;
    empty?: boolean;
    noContent?: boolean;
    emptyText?: RenderEmptyContent;
    values?: readonly string[];
    update?: { defaultOpen?: boolean; open?: boolean | null; disabled?: boolean };
    thenEnable?: boolean;
    action?: string;
  }

  let { sample }: { sample: SelectOpenSample } = $props();
  const options = [{ value: 'a', label: 'Alpha' },
    { value: 'b', label: 'Bravo', disabled: true }, { value: 'g', label: 'Gamma' }];
  let ownerOpen = $state<boolean | undefined>(untrack(() => sample.open ?? undefined));
  let initialOpen = $state(untrack(() => sample.defaultOpen));
  let disabled = $state(untrack(() => sample.disabled ?? false));
  let values = $state<string[]>(untrack(() => [...sample.values ?? []]));
  let events = $state<boolean[]>([]);
  let changes = $state<string[]>([]);

  function requestOpen(value: boolean) {
    events.push(value);
    if (sample.id === 'accepted') ownerOpen = value;
  }

  function update() {
    if ('open' in (sample.update ?? {})) ownerOpen = sample.update?.open ?? undefined;
    if ('defaultOpen' in (sample.update ?? {})) initialOpen = sample.update?.defaultOpen;
    if ('disabled' in (sample.update ?? {})) disabled = sample.update?.disabled ?? false;
  }
</script>

<form id="select-open-form" onsubmit={event => event.preventDefault()}>
  {#if sample.id === 'bound' || sample.id === 'bound-default'}
    <Select aria-label="Open choice" name="choice" {options} bind:open={ownerOpen}
      defaultOpen={initialOpen} showSearch
      onOpenChange={requestOpen}
      onValueChange={value => changes.push(JSON.stringify(value))} />
  {:else if sample.id === 'bound-multiple'}
    <Select aria-label="Open choice" name="choice" {options} mode="multiple"
      bind:open={ownerOpen} bind:value={values} showSearch
      onOpenChange={requestOpen}
      onValueChange={value => changes.push(JSON.stringify(value))} />
  {:else if sample.mode === 'single'}
    <Select aria-label="Open choice" name="choice" options={sample.empty ? [] : options}
      open={ownerOpen} defaultOpen={initialOpen} {disabled} defaultValue={sample.values?.[0]}
      notFoundContent={sample.noContent ? null : sample.emptyText} showSearch
      onOpenChange={requestOpen}
      onValueChange={value => changes.push(JSON.stringify(value))} />
  {:else}
    <Select aria-label="Open choice" name="choice" options={sample.empty ? [] : options}
      open={ownerOpen} defaultOpen={initialOpen} {disabled} mode={sample.mode} bind:value={values}
      notFoundContent={sample.noContent ? null : sample.emptyText} showSearch
      onOpenChange={requestOpen}
      onValueChange={value => changes.push(JSON.stringify(value))} />
  {/if}
  <button type="reset">Reset open choice</button>
</form>
<button type="button" onclick={update}>Update open sample</button>
<button type="button" onclick={() => { disabled = false; }}>Enable open sample</button>
<button type="button" onclick={() => { ownerOpen = ownerOpen ? false : true; }}>Toggle owner open</button>
<output id="select-open-owner">{String(ownerOpen)}</output>
<output id="select-open-events">{JSON.stringify(events)}</output>
<output id="select-open-changes">{changes.join('|')}</output>
