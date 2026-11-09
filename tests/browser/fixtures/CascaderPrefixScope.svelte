<script lang="ts">
  import { untrack } from 'svelte';
  import {
    Cascader, CascaderPanel, type CascaderOption, type CascaderProps, type CascaderValue
  } from 'antd-svelte';

  export interface CascaderPrefixSample {
    id: string;
    prefix?: string;
    childPrefix?: string;
    variablePrefix?: string;
    local?: string;
    rtl?: boolean;
    aliases?: boolean;
    size?: CascaderProps['size'];
    variant?: CascaderProps['variant'];
    status?: CascaderProps['status'];
    disabled?: boolean;
    loading?: boolean;
    empty?: boolean;
    opened?: boolean;
    mode?: string;
    panel?: boolean;
    search?: boolean;
    portal?: boolean;
  }
  let { sample, local = true }: { sample: CascaderPrefixSample; local?: boolean } = $props();
  const options: CascaderOption[] = [{ value: 'p', label: 'Parent', children: [
    { value: 'a', label: 'Alpha' }, { value: 'b', label: 'Beta' },
    { value: 'd', label: 'Disabled', disabled: true }
  ] }, { value: 'c', label: 'Gamma' }];
  let value = $state<CascaderValue<boolean> | undefined>(untrack(() =>
    sample.empty || sample.panel ? undefined : sample.mode ? [['p', 'b']] : ['p', 'b']));
  let events = $state<string[]>([]);
  let root = $state<HTMLDivElement>();
  let editor = $state<HTMLInputElement>();
  let target = $state<HTMLDivElement>();
  let common = $derived({
    prefixCls: local ? sample.local : undefined, options: sample.empty ? [] : options,
    multiple: sample.mode === 'multiple', value, disabled: sample.disabled,
    class: 'fixture-cascader-prefix', notFoundContent: 'No results', 'aria-label': 'Prefix choices',
    onChange: (next: CascaderValue<boolean> | undefined) => {
      value = next;
      events.push(`change:${JSON.stringify(next)}`);
    }
  });
</script>

<form id="prefix-path-form">
  {#if sample.panel}
    <CascaderPanel {...common} bind:nativeElement={root} />
  {:else}
    <Cascader {...common} style="width:280px"
      size={sample.size} variant={sample.variant} status={sample.status} loading={sample.loading}
      bind:nativeElement={root} bind:inputElement={editor} allowClear
      getPopupContainer={sample.portal ? () => target! : undefined}
      showSearch={{ filter: () => true, onSearch: text => events.push(`search:${text}`) }} />
  {/if}
</form>
<div bind:this={target} data-cascader-prefix-portal></div>
<output aria-label="Cascader prefix events">{events.join('|')}</output>
<output aria-label="Cascader prefix value">{JSON.stringify(value)}</output>
<output aria-label="Cascader prefix refs">{Boolean(root && (sample.panel || editor && root.contains(editor)))}</output>
