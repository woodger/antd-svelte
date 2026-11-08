<script lang="ts">
  import { ConfigProvider, Select, type SelectOption } from 'antd-svelte';
  import { untrack } from 'svelte';
  import { getSelectComparator, type SelectSortSample } from './select-sort-cases';

  let { sample }: { sample: SelectSortSample } = $props();
  let values = $state<(string | number)[]>(untrack(() => [...sample.values]));
  let singleValue = $state<string | number>();
  let query = $state(untrack(() => sample.search));
  let sort = $state(untrack(() => sample.sort));
  let controlled = $state(true);
  let acceptQuery = $state(false);
  let reverseOptions = $state(false);
  let callbackQueries = $state<string[]>([]);
  let callbackOptionsOwned = $state(true);
  let changeCount = $state(0);
  let options = $derived(reverseOptions ? [...sample.options].reverse() : sample.options);
  let comparator = $derived(getSelectComparator(sort));
  let componentProps = $derived({
    options, name: 'sorted', 'aria-label': 'Sorted values',
    showSearch: {
      searchValue: controlled ? query : undefined, filterOption: sample.filter,
      optionFilterProp: sample.field, filterSort: comparator ? compare : undefined,
      onSearch: (next: string) => { if (acceptQuery) query = next; }
    },
    onValueChange: () => { changeCount += 1; }
  });

  function compare(
    a: SelectOption<string | number>, b: SelectOption<string | number>, info: { searchValue: string }
  ) {
    // plain diagnostics не становятся зависимостями сортировки.
    untrack(() => {
      if (!callbackQueries.includes(info.searchValue)) callbackQueries.push(info.searchValue);
      if (sample.mode !== 'tags' && (!options.includes(a) || !options.includes(b))) {
        callbackOptionsOwned = false;
      }
    });
    return comparator?.(a, b, info) ?? 0;
  }
</script>

<label>Sort strategy
  <select bind:value={sort}>
    {#each ['none', 'asc', 'desc', 'equal', 'query', 'value'] as name}
      <option value={name}>{name}</option>
    {/each}
  </select>
</label>
<label><input type="checkbox" bind:checked={controlled} />Controlled sort query</label>
<label><input type="checkbox" bind:checked={acceptQuery} />Accept sort query</label>
<label><input type="checkbox" bind:checked={reverseOptions} />Reverse owner options</label>
<ConfigProvider theme={{ token: { motion: false } }}>
  <form aria-label="Sorted native form" onsubmit={event => event.preventDefault()}>
    <div data-select-sort>
      {#if sample.mode === 'single'}
        <Select {...componentProps} bind:value={singleValue} />
      {:else}
        <Select {...componentProps} mode={sample.mode === 'tags' ? 'tags' : 'multiple'}
          bind:value={values} />
      {/if}
    </div>
  </form>
</ConfigProvider>
<output aria-label="Sorted selected values">{JSON.stringify(sample.mode === 'single'
  ? singleValue : values)}</output>
<output aria-label="Sort comparator queries">{JSON.stringify(callbackQueries)}</output>
<output aria-label="Sort comparator options owned">{callbackOptionsOwned}</output>
<output aria-label="Sort changes">{changeCount}</output>
