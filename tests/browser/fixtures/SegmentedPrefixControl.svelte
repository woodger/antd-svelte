<script lang="ts">
  import { ConfigProvider, Segmented } from 'antd-svelte';
  import type { SegmentedPrefixSample } from './segmented-prefix-presets';

  let { id, prefix, sample }: { id: string; prefix?: string; sample: SegmentedPrefixSample; }
    = $props();
  let value = $state('a');
  let events = $state<string[]>([]);
  let nativeElement = $state<HTMLDivElement>();
  let label = $derived(sample.labelKind === 'zero' ? 0 : sample.labelKind === 'empty' ? '' : 'Alpha');
</script>

{#snippet icon()}
  <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M0 0h12v12H0z" /></svg>
{/snippet}

<div data-segmented-prefix-case={id} style="width:360px;color:rgb(31,41,51)">
  <ConfigProvider direction={id === 'vertical' ? 'rtl' : 'ltr'}>
    <Segmented bind:value bind:nativeElement prefixCls={prefix} name={`prefix-${id}`}
      aria-label={`Prefix control ${id}`}
      options={[
        { value: 'a', label, icon, title: 'Icon option', tooltip: 'Prefix help' },
        { value: 'b', label: 'Beta' }, { value: 'c', label: 'Disabled', disabled: true }
      ]}
      size={id === 'small' ? 'small' : id === 'large' ? 'large' : undefined}
      block={id === 'block'} shape={id === 'block' ? 'round' : 'default'}
      orientation={id === 'vertical' ? 'vertical' : undefined} disabled={id === 'disabled'}
      classNames={sample.styled ? { root: 'prefix-custom-root', item: 'prefix-custom-item',
        label: 'prefix-custom-label', icon: 'prefix-custom-icon' } : undefined}
      styles={sample.styled ? { root: 'padding:8px', label: 'padding-inline:15px',
        icon: 'color:#722ed1' } : undefined}
      style={sample.styled ? 'padding:9px' : undefined}
      onChange={next => events = [...events, next]} />
  </ConfigProvider>
</div>
{#if id === 'normal'}
  <output aria-label="Segmented prefix value">{value}</output>
  <output aria-label="Segmented prefix events">{JSON.stringify(events)}</output>
  <output aria-label="Segmented prefix ref">{nativeElement ? 'mounted' : 'empty'}</output>
{/if}
