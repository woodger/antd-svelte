<script lang="ts">
  import { untrack, type Snippet } from 'svelte';
  import { ConfigProvider, Form, FormItem, SpaceCompact, TreeSelect, createForm, enUS,
    type TreeSelectLabel, type TreeSelectProps, type TreeSelectSuffix, type TreeSelectSuffixInfo,
    type TreeSelectTagInfo, type TreeSelectValue } from 'antd-svelte';
  import { treeSelectSurfaceData, type TreeSelectSurfaceContent, type TreeSelectSurfaceSample }
    from './tree-select-surface-cases';
  import TreeSelectSurfacePopup from './TreeSelectSurfacePopup.svelte';

  let { sample }: { sample: TreeSelectSurfaceSample; } = $props();
  const form = createForm<{ selection?: TreeSelectValue; }>({ initialValues: {} });
  let mounted = $state(true);
  let events = $state.raw<unknown[][]>([]);
  let lifecycle = $state.raw<string[]>([]);
  let query = $state(untrack(() => sample.searchValue));
  let prefixCls = $derived(sample.rtl ? 'surface-choice' : undefined);
  let showSearch = $derived<TreeSelectProps['showSearch']>(
    sample.keepSearch || sample.searchValue !== undefined || sample.showSearch
      ? { searchValue: query, autoClearSearchValue: !sample.keepSearch, onSearch: next => {
        record('search', next);
        if (sample.searchValue !== undefined && !sample.holdValue) query = next;
      } } : sample.showSearch
  );
  let options = $derived<TreeSelectProps>({
    prefixCls,
    treeData: sample.emptyData ? [] : treeSelectSurfaceData,
    multiple: sample.multiple,
    defaultOpen: sample.defaultOpen,
    disabled: sample.disabled,
    loading: sample.loading,
    ...(sample.holdValue ? { value: sample.value } : { defaultValue: sample.value }),
    prefix: content(sample.prefix),
    suffix: suffixContent(sample.suffix),
    suffixIcon: content(sample.suffixIcon),
    allowClear: typeof sample.allowClear === 'object'
      ? { ...sample.allowClear, clearIcon: content(sample.allowClear.clearIcon) } : sample.allowClear,
    removeIcon: content(sample.removeIcon),
    tagRender: sample.tagRender ? tag : undefined,
    popupRender: sample.popup === 'empty' ? emptyPopup : sample.popup ? popup : undefined,
    showSearch,
    notFoundContent: 'No nodes',
    onClear: () => record('clear'),
    onChange: (value, labels, extra) => record('change', value ?? null, labels, extra.triggerValue ?? null),
    onOpenChange: open => record('open', open),
    onSelect: value => record('select', value),
    onDeselect: value => record('deselect', value),
    getPopupContainer: trigger => trigger.closest('[data-tree-select-surface]')!
      .querySelector<HTMLElement>('[data-surface-target]')!
  });

  function content(value: TreeSelectSurfaceContent | undefined): TreeSelectLabel {
    return value && typeof value === 'object' ? 'kind' in value ? rich : value.map(content) : value;
  }
  function suffixContent(value: TreeSelectSurfaceSample['suffix']): TreeSelectSuffix {
    return value && typeof value === 'object' && 'kind' in value && value.kind === 'info'
      ? suffixInfo : content(value);
  }
  function record(kind: string, ...args: unknown[]) { events = [...events, [kind, ...args]]; }
  function onLife(event: string) { lifecycle = [...lifecycle, event]; }
</script>

{#snippet rich()}<strong data-surface-rich>Custom</strong>{/snippet}
{#snippet suffixInfo(info: TreeSelectSuffixInfo)}<span data-surface-suffix-info={JSON.stringify(info)}>Suffix</span>{/snippet}
{#snippet tag(info: TreeSelectTagInfo)}<b data-surface-tag>{@render info.label()}</b>{/snippet}
{#snippet popup(menu: Snippet)}<TreeSelectSurfacePopup {menu} {onLife} replace={sample.popup === 'replace'} />{/snippet}
{#snippet emptyPopup(_menu: Snippet)}{/snippet}
{#snippet control()}
  {#if mounted}<TreeSelect {...options} aria-label="Surface selection" name="selection" style="width:320px" />{/if}
{/snippet}

<ConfigProvider locale={enUS} direction={sample.rtl ? 'rtl' : 'ltr'} prefixCls={sample.rtl ? 'surface' : undefined}
  theme={{ token: { motion: false } }}>
  <div data-tree-select-surface data-surface-prefix={prefixCls ?? 'ant-select'} style="margin:64px">
    {#if sample.popup === 'wrap' && !sample.emptyData}
      <Form {form} aria-label="Surface form">
        <FormItem name="selection" validateStatus="error">
          <SpaceCompact size="large">{@render control()}</SpaceCompact>
        </FormItem>
      </Form>
    {:else}{@render control()}{/if}
    <button type="button" style="position:absolute;top:32px;right:32px">Outside selection</button>
    <button type="button" onclick={() => { mounted = false; }}>Unmount selection</button>
    <div data-surface-target></div>
    <output data-surface-events>{JSON.stringify(events)}</output>
    <output data-surface-lifecycle>{JSON.stringify(lifecycle)}</output>
  </div>
</ConfigProvider>
