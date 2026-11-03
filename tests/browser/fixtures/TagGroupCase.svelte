<script lang="ts">
  import { untrack } from 'svelte';
  import { CheckableTagGroup, ConfigProvider } from 'antd-svelte';
  import type { CheckableTagGroupProps, CheckableTagGroupSemantic } from 'antd-svelte';
  import type { TagGroupCase, TagGroupSelection } from './tag-group-presets';

  let { sample, changed = false }: { sample: TagGroupCase; changed?: boolean } = $props();
  let value = $state.raw<TagGroupSelection>(untrack(() => sample.value));
  let events = $state<TagGroupSelection[]>([]);
  let mounted = $state(true);
  let nativeElement = $state<HTMLDivElement>();
  let values = $derived({ ...sample, ...(changed ? sample.patch : {}) });
  const classNames: CheckableTagGroupSemantic = ({ props }) => ({
    root: `case-fn-${String(props.multiple)}-${String(props.disabled)}`,
    item: props.multiple ? 'case-fn-many' : 'case-fn-one'
  });
  const styles: CheckableTagGroupSemantic = ({ props }) => ({
    root: `padding:${props.multiple ? 8 : 4}px;opacity:${props.disabled ? '.4' : '.8'}`,
    item: `font-weight:${props.multiple ? 700 : 400};border-radius:3px`
  });
  let provider = $derived(sample.contextFunctions
    ? { ...sample.provider, classNames, styles } as unknown as typeof sample.provider
    : sample.provider);
  let options = $derived(values.options?.map(option =>
    sample.rich && typeof option === 'object' ? { ...option, label: richLabel } : option
  ));
  let groupProps = $derived({
    ...values,
    title: 'ignored title',
    options,
    value: values.uncontrolled ? undefined
      : changed && sample.patch && 'value' in sample.patch ? sample.patch.value : value,
    classNames: values.functions ? classNames : values.classNames,
    styles: values.functions ? styles : values.styles
  } as CheckableTagGroupProps);

  function handleChange(next: TagGroupSelection) {
    events = [...events, next];
    if (sample.accept) value = next;
  }
</script>

{#snippet richLabel()}<strong>Rich &lt;label&gt;</strong>{/snippet}

<ConfigProvider
  tag={provider}
  componentDisabled={sample.componentDisabled}
  direction={sample.direction}
  theme={{
    mode: sample.dark ? 'dark' : 'light',
    compact: sample.compact,
    token: { motion: false, ...sample.token }
  }}
>
  <form onsubmit={event => event.preventDefault()}>
    <button type="button">Before tag group</button>
    {#if mounted}
      <CheckableTagGroup
        {...groupProps}
        id="tag-group-api"
        role="group"
        aria-label="API tag group"
        aria-describedby="tag-group-help"
        data-tag-group-root=""
        data-marker="group"
        bind:nativeElement
        onChange={handleChange}
      />
    {/if}
    <button type="button">After tag group</button>
  </form>
</ConfigProvider>
<p id="tag-group-help">Choose tags</p>
<output aria-label="Tag group events">{JSON.stringify(events)}</output>
<output aria-label="Tag group ref">{nativeElement ? 'div' : 'empty'}</output>
<button type="button" onclick={() => mounted = !mounted}>Toggle API group</button>
<button type="button" onclick={() => nativeElement?.querySelector('button')?.focus()}>
  Focus API group item
</button>
