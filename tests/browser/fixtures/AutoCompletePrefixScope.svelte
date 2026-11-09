<script lang="ts">
  import { untrack } from 'svelte';
  import { AutoComplete, type AutoCompleteProps } from 'antd-svelte';
  import AutoCompletePrefixInput from './AutoCompletePrefixInput.svelte';

  export interface AutoCompletePrefixSample {
    id: string;
    prefix?: string;
    childPrefix?: string;
    variablePrefix?: string;
    local?: string;
    rtl?: boolean;
    aliases?: boolean;
    size?: AutoCompleteProps['size'];
    variant?: AutoCompleteProps['variant'];
    status?: AutoCompleteProps['status'];
    disabled?: boolean;
    empty?: boolean;
    opened?: boolean;
    groups?: boolean;
    input?: string;
    inputVariant?: AutoCompleteProps['variant'];
    portal?: boolean;
  }
  let { sample, local = true }: { sample: AutoCompletePrefixSample; local?: boolean } = $props();
  const options = [
    { value: 'a', label: 'Alpha' }, { value: 'b', label: 'Beta' },
    { value: 'c', label: 'Gamma' }, { value: 'd', label: 'Disabled', disabled: true }
  ];
  let value = $state<string | undefined>(untrack(() => sample.empty ? undefined : 'b'));
  let events = $state<string[]>([]);
  let root = $state<HTMLDivElement>();
  let editor = $state<HTMLInputElement | HTMLTextAreaElement>();
  let target = $state<HTMLDivElement>();
</script>

{#snippet custom(control: import('antd-svelte').AutoCompleteInput)}
  <AutoCompletePrefixInput {control} textarea={sample.input === 'textarea'}
    variant={sample.inputVariant} />
{/snippet}
<form id="prefix-completion-form">
  <AutoComplete prefixCls={local ? sample.local : undefined}
    options={sample.empty ? [] : sample.groups ? [{ label: 'Group', options }] : options}
    {value} name="query" class="fixture-auto-complete-prefix" style="width:280px"
    size={sample.size} variant={sample.variant} status={sample.status}
    disabled={sample.disabled} allowClear notFoundContent="No results"
    aria-label="Prefix choices" children={sample.input ? custom : undefined}
    bind:nativeElement={root} bind:inputElement={editor}
    getPopupContainer={sample.portal ? () => target! : undefined}
    showSearch={{ filterOption: false, onSearch: text => events.push(`search:${text}`) }}
    onChange={next => { value = next; events.push(`change:${next ?? ''}`); }}
    onSelect={next => events.push(`select:${next}`)} />
</form>
<div bind:this={target} data-auto-complete-prefix-portal></div>
<output aria-label="AutoComplete prefix events">{events.join('|')}</output>
<output aria-label="AutoComplete prefix refs">{Boolean(root && editor && root.contains(editor))}</output>
