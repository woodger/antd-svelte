<script lang="ts">
  import { ConfigProvider, Select, Tag, type SelectTagInfo, type SelectOption } from 'antd-svelte';
  import { untrack } from 'svelte';
  import type { SelectTagRenderSample } from './select-tag-render-cases';

  let { sample }: { sample: SelectTagRenderSample } = $props();
  let values = $state<(string | number)[]>(untrack(() => [...sample.values]));
  let single = $state<string | number | undefined>(untrack(() => sample.values[0]));
  let events = $state<unknown[]>([]);
  let nativeTag = $state(false);
  let hideRenderer = $state(false);
  let responsive = $state(false);
  let width = $state(400);
  let count = $derived<number | 'responsive' | undefined>(responsive ? 'responsive' : sample.count);
  const options: readonly SelectOption<string | number>[] = [
    { value: 'a', label: 'Alpha' },
    { value: 'locked', label: 'Locked', disabled: true },
    { value: 0, label: 'Zero' }
  ];
  let componentProps = $derived({
    options, disabled: sample.disabled, maxTagCount: count,
    maxTagTextLength: sample.textLength,
    tagRender: hideRenderer ? undefined : nativeTag ? renderNativeTag : renderTag,
    'aria-label': 'Custom rendered tags', name: 'custom-tags',
    showSearch: { onSearch: (query: string) => { events = [...events, { type: 'search', query }]; } },
    onOpenChange: (open: boolean) => { events = [...events, { type: 'open', open }]; }
  });
</script>

{#snippet renderTag(info: SelectTagInfo<string | number>)}
  <span data-custom-tag={JSON.stringify({
    value: info.value, index: info.index, disabled: info.disabled, closable: info.closable,
    isMaxTag: info.isMaxTag, onCloseType: typeof info.onClose
  })}>
    <span data-custom-label>{@render info.label()}</span>
    {#if info.closable}<button type="button" aria-label={`Close ${typeof info.value}:${info.value}`}
      onmousedown={event => {
        if (sample.stopClose) {
          event.preventDefault();
          event.stopPropagation();
        }
      }} onclick={event => {
        events = [...events, { type: 'close', value: info.value }];
        info.onClose(event);
      }}>Close</button>{/if}
  </span>
{/snippet}
{#snippet renderNativeTag(info: SelectTagInfo<string | number>)}
  <Tag closable={info.closable} onClose={info.onClose} disabled={info.disabled}
    closeLabel={`Native close ${typeof info.value}:${info.value}`} style="margin-inline-end:4px"
    onmousedown={event => {
      event.preventDefault();
      event.stopPropagation();
    }}>
    {@render info.label()}
  </Tag>
{/snippet}

<label><input type="checkbox" bind:checked={nativeTag} />Use native Tag renderer</label>
<label><input type="checkbox" bind:checked={hideRenderer} />Restore default tag renderer</label>
<label><input type="checkbox" bind:checked={responsive} />Responsive custom tags</label>
<label>Custom tag width<input type="number" bind:value={width} /></label>
<ConfigProvider theme={{ token: { motion: false } }}>
  <div data-tag-render style={`width:${width}px`}>
    {#if sample.mode === 'single'}
      <Select {...componentProps} value={single} onValueChange={next => { single = next; }} />
    {:else}
      <Select {...componentProps} mode={sample.mode === 'tags' ? 'tags' : 'multiple'}
        bind:value={values} onValueChange={next => {
          events = [...events, { type: 'change', values: next }];
        }} />
    {/if}
  </div>
</ConfigProvider>
<output aria-label="Tag render values">{JSON.stringify(values)}</output>
<output aria-label="Tag render events">{JSON.stringify(events)}</output>
