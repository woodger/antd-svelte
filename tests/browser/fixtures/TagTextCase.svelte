<script lang="ts">
  import { Cascader, ConfigProvider, Select, type CascaderValue } from 'antd-svelte';
  import { getTagTextLimit, type TagTextSample } from './tag-text-cases';

  let { sample }: { sample: TagTextSample } = $props();
  let override = $state(false);
  let length = $state(2);
  let tagMode = $state(false);
  let changes = $state(0);
  let values = $state(['a']);
  let paths = $state<CascaderValue<true>>([['a']]);
  let componentProps = $derived({
    options: [{ value: 'a', label: sample.text }],
    maxTagTextLength: override ? length : getTagTextLimit(sample.length),
    'aria-label': 'Truncated values'
  });
</script>

<label><input type="checkbox" bind:checked={override} />Override tag text length</label>
<label>Tag text length<input type="number" bind:value={length} /></label>
<label><input type="checkbox" bind:checked={tagMode} />Free text tags</label>
<ConfigProvider theme={{ token: { motion: false } }}>
  <form aria-label="Tag text native form" onsubmit={event => event.preventDefault()}>
    <div data-tag-text>
      {#if sample.component === 'select'}
        <Select {...componentProps} mode={tagMode ? 'tags' : 'multiple'} bind:value={values}
          name="tag-text" onValueChange={() => { changes += 1; }} />
      {:else}
        <Cascader {...componentProps} multiple value={paths}
          onChange={next => { paths = next; changes += 1; }} />
      {/if}
    </div>
  </form>
</ConfigProvider>
<output aria-label="Tag text values">{JSON.stringify(sample.component === 'select'
  ? values : paths)}</output>
<output aria-label="Tag text changes">{changes}</output>
