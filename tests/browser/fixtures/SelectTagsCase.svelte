<script lang="ts">
  import {
    ConfigProvider, Select, type SelectProps, type SelectTokenSeparators
  } from 'antd-svelte';
  import { untrack } from 'svelte';
  import { selectTagsBaseOptions, type SelectTagsSample } from './select-tags-cases';

  let {
    sample, phase = 'interaction', nativeChecks = false, missingOptions = false,
    tokenSeparators, inputHandlers, maxCount
  }: {
    sample: SelectTagsSample;
    phase?: 'interaction' | 'options';
    nativeChecks?: boolean;
    missingOptions?: boolean;
    tokenSeparators?: SelectTokenSeparators;
    maxCount?: number;
    inputHandlers?: Pick<SelectProps<string | number, 'tags'>,
      'onpaste' | 'oncompositionstart' | 'oncompositionend'>;
  } = $props();
  let values = $state<(string | number)[]>(untrack(() => [...(sample.values ?? [])]));
  let events = $state<unknown[]>([]);
  let options = $derived(missingOptions ? [] : sample.options ?? selectTagsBaseOptions);
  let searchConfig = $derived({
    searchValue: phase === 'options' ? sample.search : sample.controlled,
    optionFilterProp: sample.optionFilterProp,
    autoClearSearchValue: sample.autoClear,
    filterOption: sample.filter === 'none' ? () => false : sample.filter === 'label'
      ? (search: string, option: { label: string }) => option.label.includes(search)
      : sample.filter,
    onSearch: (query: string) => { events = [...events, { type: 'search', query }]; }
  });
</script>

<ConfigProvider theme={{ token: { motion: false } }}>
  <form aria-label="Tags native form" onsubmit={event => event.preventDefault()}>
    <button type="button" id="tags-outside">Outside</button>
    {#if nativeChecks}<button type="reset">Reset tags</button>{/if}
    <div data-select-tags>
      <Select mode={sample.mode ?? 'tags'} {options} {tokenSeparators} {maxCount}
        {...inputHandlers}
        bind:value={values} defaultValue={sample.values}
        name="tags" aria-label="Tags" required={nativeChecks} allowClear={nativeChecks || sample.clear}
        showSearch={searchConfig} onValueChange={next => {
          values = next;
          events = [...events, { type: 'change', values: next }];
        }} />
    </div>
  </form>
</ConfigProvider>
<output aria-label="Tags values">{JSON.stringify(values)}</output>
<output aria-label="Tags events">{JSON.stringify(events)}</output>
