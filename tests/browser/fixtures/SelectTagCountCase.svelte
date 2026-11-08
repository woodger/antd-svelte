<script lang="ts">
  import { ConfigProvider, Select, type SelectOmittedTag } from 'antd-svelte';
  import { untrack } from 'svelte';
  import { getSelectTagCount, type SelectTagCountSample } from './select-tag-count-cases';

  let { sample }: { sample: SelectTagCountSample } = $props();
  let values = $state<(string | number)[]>(untrack(() => [...sample.values]));
  let changes = $state(0);
  let override = $state(false);
  let count = $state(2);
  let width = $state(untrack(() => sample.width ?? 400));
  let mounted = $state(true);
  let nestedInput = $state(false);
  let componentProps = $derived({
    maxTagCount: override ? count : getSelectTagCount(sample.count),
    maxTagTextLength: sample.textLength,
    maxTagPlaceholder: nestedInput ? inputPlaceholder
      : sample.placeholder === 'snippet' ? placeholder : sample.placeholder
  });
</script>

{#snippet placeholder(omitted: SelectOmittedTag<string | number>[])}
  <span data-omitted={JSON.stringify(omitted)}>{omitted.map(item =>
    `${typeof item.value}:${item.value}=${item.label}`).join('|')}</span>
{/snippet}
{#snippet inputPlaceholder()}
  <input aria-label="Summary field" value={'x'.repeat(100)} style="width:120px" />
{/snippet}

<label><input type="checkbox" bind:checked={override} />Override visible tag count</label>
<label>Visible tag count<input type="number" bind:value={count} /></label>
<label>Tag count width<input type="number" bind:value={width} /></label>
<label><input type="checkbox" bind:checked={mounted} />Mount counted Select</label>
<label><input type="checkbox" bind:checked={nestedInput} />Input inside summary</label>
<button type="button" id="tag-count-outside">Outside tag count</button>
<ConfigProvider theme={{ token: { motion: false } }}>
  <form aria-label="Tag count native form" onsubmit={event => event.preventDefault()}>
    <button type="reset">Reset tag count</button>
    <div data-tag-count style={`width:${width}px`}>
      {#if mounted}
      <Select {...componentProps} options={sample.options} mode={sample.mode === 'tags'
        ? 'tags' : 'multiple'} bind:value={values} defaultValue={sample.values}
        name="tag-count" aria-label="Counted values" allowClear
        onValueChange={() => { changes += 1; }} />
      {/if}
    </div>
  </form>
</ConfigProvider>
<output aria-label="Tag count values">{JSON.stringify(values)}</output>
<output aria-label="Tag count changes">{changes}</output>
