<script lang="ts">
  import { Segmented } from 'antd-svelte';
  import { segmentedConfigRecord, type SegmentedConfigSample } from './segmented-config-presets';

  let { sample, id }: { sample: SegmentedConfigSample; id: string; } = $props();
  let local = $derived(segmentedConfigRecord('local' in sample ? sample.local : undefined, 'local'));
  let selection = $state<string | undefined>('a');
  let events = $state<string[]>([]);
  let nativeElement = $state<HTMLDivElement>();
  let label = $derived('labelKind' in sample
    ? sample.labelKind === 'zero' ? 0 : sample.labelKind === 'empty' ? '' : undefined
    : 'Alpha');
</script>

{#snippet icon()}<svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M0 0h12v12H0z" /></svg>{/snippet}
<div data-segmented-config={id} style="width:360px;color:rgb(31, 41, 51)">
  <Segmented {...local} rootClassName={local?.class ? 'segcfg-local-root-class' : undefined}
    name={`config-${id}`} aria-label={`Segmented config ${id}`}
    options={[{ value: 'a', label, title: 'Icon option', icon }, { value: 'b', label: 'Beta' },
      { value: 'c', label: 'Disabled', disabled: true }]}
    bind:value={selection} bind:nativeElement onChange={next => events = [...events, next]}
    size={'size' in sample ? sample.size as 'small' : undefined}
    shape={'shape' in sample ? sample.shape as 'round' : undefined}
    orientation={'vertical' in sample && sample.vertical ? 'vertical' : undefined}
    disabled={'disabled' in sample && sample.disabled} />
  {#if id === 'normal'}
    <output aria-label="Segmented config events">{JSON.stringify(events)}</output>
    <output aria-label="Segmented config ref">{nativeElement ? 'mounted' : 'empty'}</output>
  {/if}
</div>
