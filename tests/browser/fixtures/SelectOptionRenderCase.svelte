<script lang="ts">
  import { untrack } from 'svelte';
  import { Select, type SelectFlattenOption, type SelectOption } from 'antd-svelte';

  export interface SelectOptionRenderSample {
    id: string;
    mode: 'single' | 'multiple' | 'tags';
    options: readonly SelectOption<string | number>[];
    values: readonly (string | number)[];
    renderer?: string;
    sort?: boolean;
    search?: string;
    field?: string;
    filter?: boolean;
    maxCount?: number;
  }
  let { sample }: { sample: SelectOptionRenderSample } = $props();
  let renderer = $state<'custom' | 'default' | 'alternate'>('custom');
  let enabled = $state(true);
  let events = $state<string[]>([]);
  let single = $state<string | number>(untrack(() => sample.values[0]));
  let multiple = $state<(string | number)[]>(untrack(() => [...sample.values]));

  function metadata(option: SelectFlattenOption<string | number>, index: number) {
    return JSON.stringify({
      key: option.key,
      value: option.value,
      label: option.label,
      index,
      group: option.group ?? null,
      groupOption: option.groupOption ?? null,
      hasGroupOption: Object.hasOwn(option, 'groupOption'),
      owner: sample.options.includes(option.data),
      rawDisabled: option.data.disabled ?? null,
      desc: option.data.desc ?? null
    });
  }

  function hotkey(event: KeyboardEvent) {
    if (!event.ctrlKey || !event.altKey) return;
    if (event.key === 'r') renderer = renderer === 'custom' ? 'alternate' : 'custom';
    if (event.key === 'd') renderer = renderer === 'default' ? 'custom' : 'default';
    if (event.key === 'h') enabled = !enabled;
  }
</script>

<svelte:window onkeydown={hotkey} />

{#snippet optionContent(option: SelectFlattenOption<string | number>, info: { index: number })}
  <span data-option-metadata={metadata(option, info.index)}>{#if sample.renderer === 'alternate' || renderer === 'alternate'}<em>Rendered {option.value}</em>
    {:else if sample.renderer !== 'empty'}<span><b>{option.label}</b> / {option.data.desc ?? 'no desc'}</span>{/if}</span>
{/snippet}

<form id="option-render-form" onsubmit={event => event.preventDefault()}>
  {#if enabled}
    {#if sample.mode === 'single'}
      <Select aria-label="Rendered choice" name="choice" options={sample.options}
        bind:value={single} optionRender={renderer === 'default' ? undefined : optionContent}
        showSearch={{ searchValue: sample.search, filterOption: sample.filter,
          optionFilterProp: sample.field,
          filterSort: sample.sort ? (a, b) => a.label.localeCompare(b.label, 'en') : undefined }}
        onValueChange={value => events.push(JSON.stringify(value))} />
    {:else}
      <Select aria-label="Rendered choice" name="choice" options={sample.options}
        mode={sample.mode} bind:value={multiple} maxCount={sample.maxCount}
        optionRender={renderer === 'default' ? undefined : optionContent}
        showSearch={{ searchValue: sample.search, filterOption: sample.filter,
          optionFilterProp: sample.field,
          filterSort: sample.sort ? (a, b) => a.label.localeCompare(b.label, 'en') : undefined }}
        onValueChange={value => events.push(JSON.stringify(value))} />
    {/if}
  {/if}
  <button type="reset">Reset rendered choice</button>
</form>
<output id="option-render-events">{events.join('|')}</output>
