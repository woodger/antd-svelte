<script lang="ts">
  import { untrack } from 'svelte';
  import { ConfigProvider, TreeSelect, type TreeSelectTagInfo,
    type TreeSelectLabeledValue, type TreeSelectValue } from 'antd-svelte';
  import { treeTagData, treeTagValues, treeTagNumber, type TreeTagSample } from './tree-select-tag-cases';

  let { sample }: { sample: TreeTagSample } = $props();
  let updated = $state(false);
  let value = $state.raw<TreeSelectValue>(untrack(() => treeTagValues(sample)));
  let count = $state<number | 'responsive' | undefined>(untrack(() =>
    sample.count === 'responsive' ? 'responsive' : treeTagNumber(sample.count)));
  let length = $state(untrack(() => treeTagNumber(sample.length)));
  let width = $state(untrack(() => sample.width ?? 400));
  let opened = $state(false);
  let mounted = $state(true);
  let events = $state.raw<unknown[]>([]);
  let root = $state<HTMLDivElement>();
  let input = $state<HTMLInputElement>();
  let field = $derived(sample.alias ? 'code' : 'value');
  let label = $derived(sample.alias ? 'caption' : 'title');
  let children = $derived(sample.alias ? 'nodes' : 'children');
  let nodes = $derived.by(() => {
    const prepare = (nodes: readonly Record<string, unknown>[]): Record<string, unknown>[] => nodes.map(node => ({
      ...node,
      ...(node[field] === 0 && sample.kind === 'element' ? { [label]: opaqueLabel } : {}),
      ...(Array.isArray(node[children]) ? { [children]: prepare(node[children]) } : {})
    }));
    return prepare(treeTagData(sample, updated));
  });
  let customPlaceholder = $derived(sample.placeholderKind === 'snippet' ? placeholder
    : sample.placeholderKind === 'element' ? elementPlaceholder
      : sample.placeholderKind === 'input' ? inputPlaceholder : sample.placeholder);

  function literal(value: unknown): unknown {
    return typeof value === 'function' ? '[opaque]' : Array.isArray(value) ? value.map(literal) : value;
  }
  function labeled(value: unknown): unknown {
    return Array.isArray(value) ? value.map(labeled) : value && typeof value === 'object'
      ? Object.fromEntries(Object.entries(value).map(([key, value]) => [key, literal(value)])) : value;
  }
  function record(node?: Record<string, unknown>) {
    return node ? { value: node[field], label: literal(node[label]), payload: node.payload } : null;
  }
</script>

{#snippet opaqueLabel()}<em>Opaque label</em>{/snippet}
{#snippet title(node: Record<string, unknown>)}<em>Rich {node[label] as string}</em>{/snippet}
{#snippet placeholder(omitted: TreeSelectLabeledValue[])}
  <span data-tree-tag-omitted={JSON.stringify(omitted.map(item => ({ ...item, label: literal(item.label) })))}>{omitted.map(item =>
    `${typeof item.value}:${item.value}=${Array.isArray(item.label) ? item.label.join('') : String(item.label)}`).join('|')}</span>
{/snippet}
{#snippet elementPlaceholder()}<strong>Other values</strong>{/snippet}
{#snippet inputPlaceholder()}<input aria-label="Summary field" value={'x'.repeat(100)} style="width:120px" />{/snippet}
{#snippet renderTag(info: TreeSelectTagInfo)}
  <span data-tree-tag-custom={JSON.stringify({ value: info.value, index: info.index, disabled: info.disabled,
    closable: info.closable, isMaxTag: info.isMaxTag, onCloseType: typeof info.onClose })}>
    <span data-tree-tag-label>{@render info.label()}</span>
    {#if info.closable}<button type="button" data-tree-tag-close={String(info.value)} aria-label={`Close ${info.value}`}
      onmousedown={event => { if (sample.stopClose) { event.preventDefault(); event.stopPropagation(); } }}
      onclick={event => {
        events = [...events, { kind: 'close', value: info.value }];
        info.onClose(event);
      }}>Close</button>{/if}
  </span>
{/snippet}

<section data-tree-tag-scope>
  <ConfigProvider direction={sample.rtl ? 'rtl' : 'ltr'} theme={{ token: { motion: false } }}>
    <form aria-label="Tree tag native form" onsubmit={event => event.preventDefault()}>
      <div data-tree-tag-control style={`width:${width}px`}>
        {#if mounted}<TreeSelect aria-label="Tree tag values" name="tree-tags" treeData={nodes}
          fieldNames={sample.alias ? { value: field, label, children } : undefined}
          treeDataSimpleMode={sample.simple} prefixCls={sample.prefix}
          multiple={sample.strictOnly ? false : !sample.single}
          treeCheckable={sample.checkable} treeCheckStrictly={sample.strict}
          labelInValue={sample.labeled || sample.strict} showCheckedStrategy={sample.strategy}
          treeDefaultExpandAll disabled={sample.disabled}
          value={sample.controlled ? value : undefined}
          defaultValue={sample.controlled ? undefined : treeTagValues(sample)}
          open={opened} onOpenChange={open => { events = [...events, { kind: 'open', open }]; opened = open; }}
          maxTagTextLength={length} maxTagCount={count} maxTagPlaceholder={customPlaceholder}
          tagRender={sample.renderer ? renderTag : undefined}
          treeTitleRender={sample.titleRenderer ? title : undefined}
          maxCount={sample.maxCount} allowClear showSearch={{ treeNodeFilterProp: label }}
          bind:nativeElement={root} bind:inputElement={input}
          onChange={(next, labels, extra) => {
            events = [...events, { kind: 'change', value: labeled(next ?? null),
              labels: labels === null ? null : labels.map(literal), triggerValue: extra.triggerValue }];
            if (sample.controlled === 'accept') value = next;
          }}
          onSelect={(value, node) => { events = [...events, { kind: 'select', value, node: record(node) }]; }}
          onDeselect={(value, node) => { events = [...events, { kind: 'deselect', value, node: record(node) }]; }}
          onClear={() => { events = [...events, { kind: 'clear' }]; }} />{/if}
      </div>
    </form>
  </ConfigProvider>
  <button onclick={() => { count = sample.nextCount; }}>Update tree tag count</button>
  <button onclick={() => { length = sample.nextLength; }}>Update tree tag length</button>
  <button onclick={() => { updated = true; }}>Update tree tag data</button>
  <button onclick={() => { mounted = !mounted; }}>Toggle tree tag mount</button>
  <button onclick={() => { width = 200; }}>Narrow tree tags</button>
  <button onclick={() => { width = 400; }}>Widen tree tags</button>
  <input aria-label="Tree tag outside draft" />
  <output data-tree-tag-events>{JSON.stringify(events)}</output>
  <output data-tree-tag-refs>{String(Boolean(root))}:{String(Boolean(input))}</output>
</section>
