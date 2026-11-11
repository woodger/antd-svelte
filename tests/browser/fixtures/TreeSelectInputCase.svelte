<script lang="ts">
  import { untrack } from 'svelte';
  import type { HTMLInputAttributes, HTMLTextareaAttributes } from 'svelte/elements';
  import { ConfigProvider, TreeSelect, type TreeSelectInputContext, type TreeSelectRef, type TreeSelectValue } from 'antd-svelte';
  import TreeSelectInputEditor from './TreeSelectInputEditor.svelte';
  import TreeSelectTextareaEditor from './TreeSelectTextareaEditor.svelte';
  import type { TreeSelectInputSample, TreeSelectInputUpdate } from './tree-select-input-cases';
  let { sample }: { sample: TreeSelectInputSample } = $props();
  let selected = $state<TreeSelectValue>(untrack(() => Array.isArray(sample.selected) ? [...sample.selected] : sample.selected));
  let search = $state(untrack(() => sample.initialSearch ?? ''));
  let options = $state(untrack(() => ({ searchable: sample.searchable !== false, disabled: sample.disabled ?? false, tabIndex: 3, ownPhase: 0 })));
  let events = $state<unknown[][]>([]);
  let control = $state<TreeSelectRef>();
  let root = $state<HTMLDivElement>();
  let inputField = $state<HTMLInputElement>();
  let textareaField = $state<HTMLInputElement | HTMLTextAreaElement>();
  let input = $derived(sample.input.includes('textarea') ? textareaField : inputField);
  function record(...event: unknown[]) { events = [...events, event]; }
  function ownEvent(type: string, event: Event) {
    if (sample.preventOwn) event.preventDefault();
    record('own', type, (event.currentTarget as HTMLInputElement | HTMLTextAreaElement).value,
      event instanceof KeyboardEvent ? event.key : null, event.defaultPrevented);
  }
  function ownProps() {
    if (!sample.own) return undefined;
    return {
      'data-input-own': 'true',
      oninput: (event: Event) => ownEvent('change', event),
      onkeydown: (event: KeyboardEvent) => ownEvent('keydown', event),
      onfocus: (event: FocusEvent) => ownEvent('focus', event),
      onblur: (event: FocusEvent) => ownEvent('blur', event),
      onpaste: (event: ClipboardEvent) => ownEvent('paste', event),
      oncompositionstart: (event: CompositionEvent) => ownEvent('compositionstart', event),
      oncompositionend: (event: CompositionEvent) => ownEvent('compositionend', event),
      ...(sample.own === 'attrs' ? {
        id: 'own-tree-select-input', name: 'own-query', title: 'Own title', role: 'searchbox',
        tabindex: 9, placeholder: 'Own placeholder', autocomplete: 'off' as const, maxlength: 30,
        'aria-label': 'Own input', 'aria-expanded': true, 'aria-controls': 'own-controls', 'aria-owns': 'own-owns',
        'aria-autocomplete': 'both' as const, 'aria-haspopup': 'tree' as const, 'aria-required': false,
        class: 'own-input', style: 'color:rgb(120,10,20)', disabled: false, readonly: false, autofocus: false
      } : {}),
      ...(sample.own === 'value' ? { value: 'Own', placeholder: 'Own placeholder' } : {}),
      ...(sample.own === 'value-undefined' ? { value: undefined, placeholder: 'Uncontrolled own placeholder' } : {}),
      ...(sample.own === 'live' ? {
        id: options.ownPhase ? 'own-live-after' : 'own-live-before',
        placeholder: options.ownPhase ? 'After placeholder' : 'Before placeholder', tabindex: options.ownPhase ? 8 : 6,
        'aria-label': options.ownPhase ? 'After input' : 'Before input', class: options.ownPhase ? 'own-input-after' : 'own-input',
        style: options.ownPhase ? 'color:rgb(10,20,130)' : 'color:rgb(120,10,20)'
      } : {})
    };
  }
  let inputOwn = $derived({ ...ownProps(), ...(sample.own === 'attrs' ? { type: 'search' as const } : {}) } satisfies HTMLInputAttributes);
  let textareaOwn = $derived(ownProps() satisfies HTMLTextareaAttributes | undefined);
  let common = $derived({
    id: 'tree-select-input-control', value: selected, multiple: sample.multiple,
    defaultOpen: sample.defaultOpen, disabled: options.disabled, autoFocus: sample.autoFocus,
    tabIndex: options.tabIndex, placeholder: 'Generated placeholder', maxLength: 2,
    'aria-label': 'Generated input', 'aria-required': true,
    classNames: { input: 'semantic-input' }, styles: { input: 'color:rgb(20,70,90);background-color:rgb(230,240,250)' },
    style: 'width:380px', treeData: [{ value: 'a', title: sample.label ?? 'Alpha' }, { value: 'b', title: 'Beta' }],
    tokenSeparators: sample.separators,
    showSearch: options.searchable ? { searchValue: sample.controlled ? search : undefined, autoClearSearchValue: sample.autoClear, filterTreeNode: false as const,
      onSearch: (text: string) => { record('search', text); if (sample.controlled === 'accept') search = text; } } : false as const,
    onChange: (next: TreeSelectValue) => { selected = next; record('change', next); },
    onSelect: (next: string | number) => record('select', next),
    onOpenChange: (next: boolean) => record('open', next),
    onInputKeyDown: (event: KeyboardEvent) => record('generated', 'inputkeydown', (event.currentTarget as HTMLInputElement | HTMLTextAreaElement).value, event.key, event.defaultPrevented),
    onKeyDown: (event: KeyboardEvent) => record('generated', 'keydown', (event.target as HTMLInputElement | HTMLTextAreaElement).value, event.key, event.defaultPrevented),
    onFocus: (event: FocusEvent) => record('generated', 'focus', (event.target as HTMLInputElement | HTMLTextAreaElement).value, null, event.defaultPrevented),
    onBlur: (event: FocusEvent) => record('generated', 'blur', (event.target as HTMLInputElement | HTMLTextAreaElement).value, null, event.defaultPrevented)
  });
  function update(patch: TreeSelectInputUpdate) {
    if (Object.hasOwn(patch, 'search')) search = patch.search!;
    options = { ...options, ...patch };
  }
</script>

{#snippet inputRender(context: TreeSelectInputContext<HTMLInputElement>)}
  <TreeSelectInputEditor {context} kind={sample.input} />
{/snippet}
{#snippet textareaRender(context: TreeSelectInputContext<HTMLTextAreaElement>)}
  <TreeSelectTextareaEditor {context} kind={sample.input} />
{/snippet}
<div data-tree-select-input-case={sample.id} data-input-refs={Boolean(root && input)}>
  <ConfigProvider theme={{ cssVar: { key: 'tree-select-input-source' }, token: { motion: false } }}>
    {#if sample.input.includes('textarea')}
      <TreeSelect {...common} components={{ input: sample.own ? { render: textareaRender, props: textareaOwn } : textareaRender }}
        bind:this={control} bind:nativeElement={root} bind:inputElement={textareaField} />
    {:else}
      <TreeSelect {...common} components={{ input: sample.own ? { render: inputRender, props: inputOwn } : inputRender }}
        bind:this={control} bind:nativeElement={root} bind:inputElement={inputField} />
    {/if}
  </ConfigProvider>
  <output data-input-events>{JSON.stringify(events)}</output>
  <output data-input-selected>{JSON.stringify(selected ?? null)}</output>
  <output data-input-controlled>{JSON.stringify(search)}</output>
  <output data-input-bound-refs>{JSON.stringify({ nativeTag: root?.tagName ?? null,
    nativeIsEditor: root === input, nativeContainsEditor: root?.contains(input ?? null) ?? false })}</output>
  <button type="button" data-input-ref-focus hidden onclick={() => control?.focus({ preventScroll: true })}>Focus input ref</button>
  <button type="button" data-input-ref-blur hidden onclick={() => control?.blur()}>Blur input ref</button>
  <div data-input-update {@attach node => {
    const listener = (event: Event) => update((event as CustomEvent<TreeSelectInputUpdate>).detail);
    node.addEventListener('fixtureupdate', listener);
    return () => node.removeEventListener('fixtureupdate', listener);
  }}></div>
</div>
<button type="button" style="display:block;margin-top:320px">Outside input tree</button>
