<script lang="ts">
  import { untrack, type Snippet } from 'svelte';
  import { ConfigProvider, TreeSelect } from 'antd-svelte';
  import type { TreeSelectPointerSample } from './tree-select-pointer-cases';
  let { sample }: { sample: TreeSelectPointerSample } = $props();
  let open = $state(untrack(() => sample.controlled?.endsWith('-open') ?? false));
  let events = $state<unknown[][]>([]);
  let inputElement = $state<HTMLInputElement>();
  let nativeElement = $state<HTMLDivElement>();
  // Raw UMD keeps omitted multiple showSearch readonly. Use an explicit Native
  // readonly counterpart; separate explicit Source true cases verify Native's
  // documented editable multiple default without changing the raw capture.
  let search = $derived(sample.nativeSearchDefault ? undefined
    : sample.search === 'object' ? {} : sample.search ?? (sample.multiple || sample.checked ? false : undefined));
  function record(kind: string, event: MouseEvent | FocusEvent) {
    events.push(kind === 'focus' || kind === 'blur'
      ? [kind, (event.currentTarget as Element).tagName]
      : [kind, (event.currentTarget as Element).tagName, event.defaultPrevented, event.target === inputElement]);
  }
</script>
{#snippet label()}<b data-pointer-label>Alpha</b>{/snippet}
{#snippet prefix()}{#if sample.prefixButton}<button type="button" data-pointer-prefix onclick={() => events.push(['prefix-click'])}>Prefix</button>{:else}<b data-pointer-prefix>Prefix</b>{/if}{/snippet}
{#snippet suffix()}<b data-pointer-suffix>Suffix</b>{/snippet}
{#snippet popup(menu: Snippet)}{@render menu()}<input aria-label="Pointer draft" value="Draft" />{/snippet}
<ConfigProvider theme={{ token: { motion: false }, cssVar: { key: 'tree-select-pointer' } }}>
  <output data-pointer-events hidden>{JSON.stringify(events)}</output>
  <div data-pointer-control style="margin:64px;width:320px" data-pointer-refs={Boolean(inputElement && nativeElement)}>
    <TreeSelect bind:inputElement bind:nativeElement aria-label="Pointer selection" style="width:320px"
      treeData={[{ value: 'a', title: label }, { value: 'b', title: 'Beta' }]}
      defaultValue={sample.multiple || sample.checked ? ['a'] : 'a'} multiple={sample.multiple}
      treeCheckable={sample.checked} disabled={sample.disabled} defaultOpen={sample.defaultOpen}
      allowClear={sample.clear} onClear={() => events.push(['clear'])}
      onChange={value => events.push(['change', value ?? null])}
      getPopupContainer={sample.insideRoot ? trigger => trigger : undefined}
      popupRender={sample.draft ? popup : undefined}
      open={sample.controlled ? open : undefined} showAction={sample.showAction}
      showSearch={search} {prefix}
      suffix={sample.defaultSuffix ? undefined : suffix}
      onOpenChange={value => {
        events.push(['open', value]);
        if (sample.controlled?.startsWith('accept-')) open = value;
      }}
      onMouseDown={event => record('mouse-down', event)} onClick={event => record('click', event)}
      onFocus={event => record('focus', event)} onBlur={event => record('blur', event)} />
  </div>
</ConfigProvider>
<button type="button">Outside pointer</button>
