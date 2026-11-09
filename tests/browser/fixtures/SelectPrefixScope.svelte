<script lang="ts">
  import { untrack } from 'svelte';
  import { Select, type SelectProps } from 'antd-svelte';

  export interface SelectPrefixSample {
    id: string;
    prefix?: string;
    childPrefix?: string;
    variablePrefix?: string;
    local?: string;
    rtl?: boolean;
    aliases?: boolean;
    size?: SelectProps['size'];
    mode?: 'multiple' | 'tags';
    variant?: SelectProps['variant'];
    status?: SelectProps['status'];
    disabled?: boolean;
    loading?: boolean;
    empty?: boolean;
    opened?: boolean;
    portal?: boolean;
    responsive?: boolean;
  }
  let { sample, local = true }: { sample: SelectPrefixSample; local?: boolean } = $props();
  const options = [
    { value: 'a', label: 'Alpha' }, { value: 'b', label: 'Beta' },
    { value: 'c', label: 'Gamma' }, { value: 'd', label: 'Disabled', disabled: true }
  ];
  let single = $state<string | undefined>(untrack(() => sample.empty ? undefined : 'b'));
  let multiple = $state<string[]>(['b']);
  let events = $state<string[]>([]);
  let target = $state<HTMLDivElement>();
  let choice = $derived({
    prefixCls: local ? sample.local : undefined, options: sample.empty ? [] : options,
    size: sample.size, variant: sample.variant, status: sample.status,
    disabled: sample.disabled, loading: sample.loading,
    allowClear: true, notFoundContent: 'No results', 'aria-label': 'Prefix choices',
    class: 'fixture-select-prefix', style: 'width:280px',
    showSearch: { filterOption: false, onSearch: (value: string) => events.push(`search:${value}`) },
    getPopupContainer: sample.portal ? () => target! : undefined
  });
</script>

<form id="prefix-choices-form">
  {#if sample.mode}
    <Select {...choice} mode={sample.mode} bind:value={multiple} name="choices"
      maxTagCount={sample.responsive ? 'responsive' : undefined}
      onValueChange={value => events.push(`change:${value?.join(',') ?? ''}`)} />
  {:else}
    <Select {...choice} bind:value={single} name="choices"
      onValueChange={value => events.push(`change:${value ?? ''}`)} />
  {/if}
</form>
<div bind:this={target} data-select-prefix-portal></div>
<output aria-label="Select prefix events">{events.join('|')}</output>
