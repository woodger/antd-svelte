<script lang="ts">
  import { untrack } from 'svelte';
  import { ConfigProvider, TreeSelect, type TreeSelectLabel, type TreeSelectLabeledValue,
    type TreeSelectTagInfo, type TreeSelectValue } from 'antd-svelte';
  import TreeSelectRichLabel from './TreeSelectRichLabel.svelte';
  import { treeLabelData, treeLabelValues, type TreeLabelSample } from './tree-select-label-cases';

  let { sample, interactive = false, probeIntro = false }: {
    sample: TreeLabelSample;
    interactive?: boolean;
    probeIntro?: boolean;
  } = $props();
  let data = $state.raw(untrack(() => treeLabelData(sample)));
  let value = $state.raw<TreeSelectValue>(untrack(() => treeLabelValues(sample)));
  let version = $state(untrack(() => sample.version ?? 'Old'));
  let enabled = $state(untrack(() => sample.renderer !== false));
  let opened = $state(false);
  let mounted = $state(true);
  let showHistory = $state(untrack(() => !interactive));
  let history = $state.raw<TreeSelectLabeledValue[][]>([]);
  let events = $state.raw<unknown[]>([]);
  let lifecycle = $state.raw<string[]>([]);
  let introCount = $state(0);
  let root = $state<HTMLDivElement>();
  let editor = $state<HTMLInputElement>();
  let field = $derived(sample.alias ? 'code' : 'value');
  let labelField = $derived(sample.alias ? 'caption' : 'title');
  let children = $derived(sample.alias && !sample.simple ? 'nodes' : 'children');
  let titleRenderer = $derived(enabled ? version === 'Old' ? oldTitle : newTitle : undefined);

  function literal(label: unknown): unknown {
    return typeof label === 'function' ? '[rendered]' : Array.isArray(label) ? label.map(literal) : label;
  }
  function eventValue(value: unknown): unknown {
    return Array.isArray(value) ? value.map(eventValue) : value && typeof value === 'object'
      ? { ...value, label: literal(Reflect.get(value, 'label')) } : value;
  }
  function find(list: readonly Record<string, unknown>[], value: unknown): Record<string, unknown> | undefined {
    for (const node of list) {
      if (node[field] === value) return node;
      const child = Array.isArray(node[children]) && find(node[children], value);
      if (child) return child;
    }
  }
  function record(node?: Record<string, unknown>) {
    return node ? { value: node[field], label: literal(node[labelField]), payload: node.payload,
      payloadRef: find(data, node[field])?.payload === node.payload } : null;
  }
  function change(next: TreeSelectValue, labels: TreeSelectLabel[] | null, triggerValue?: string | number) {
    events = [...events, { kind: 'change', value: eventValue(next ?? null),
      labels: labels === null ? null : labels.map(literal), triggerValue }];
    const list = next == null ? [] : Array.isArray(next) ? next : [next];
    history = [...history, labels === null ? list as TreeSelectLabeledValue[]
      : list.map((value, index) => ({ value: value as string | number, label: labels[index] }))];
    if (sample.controlled === 'accept') value = next;
  }
  function onLife(event: string) { lifecycle = [...lifecycle, event]; }
  function recordIntro(_element: HTMLElement) {
    introCount++;
    return { duration: 0 };
  }
</script>

{#snippet oldTitle(node: Record<string, unknown>)}<TreeSelectRichLabel {node} {field} {labelField}
  version="Old" {interactive} {onLife} />{/snippet}
{#snippet newTitle(node: Record<string, unknown>)}<TreeSelectRichLabel {node} {field} {labelField}
  version="New" {interactive} {onLife} />{/snippet}
{#snippet content(label: TreeSelectLabel)}{#if typeof label === 'function'}{@render label()}{:else if Array.isArray(label)}{#each label as part}{@render content(part)}{/each}{:else if typeof label === 'string' || typeof label === 'number'}{label}{/if}{/snippet}
{#snippet records(items: TreeSelectLabeledValue[])}
  {#each items as item (item.value)}<span data-renderer-record={JSON.stringify({
    value: item.value, halfChecked: item.halfChecked, disabled: item.disabled,
    kind: typeof item.label === 'function' ? 'rendered' : Array.isArray(item.label) ? 'array'
      : item.label === null ? 'null' : typeof item.label, key: Object.hasOwn(item, 'key')
  })}><span data-record-label>{@render content(item.label)}</span></span>{/each}
{/snippet}
{#snippet placeholder(omitted: TreeSelectLabeledValue[])}<span data-tree-label-omitted>{@render records(omitted)}</span>{/snippet}
{#snippet tag(info: TreeSelectTagInfo)}<span data-tree-label-custom>{@render info.label()}</span>{/snippet}
{#snippet introTitle(node: { value: string; title: string; })}<span in:recordIntro|global>{node.title}</span>{/snippet}
{#snippet introSummary(items: TreeSelectLabeledValue[])}{#each items as item}{@render content(item.label)}{/each}{/snippet}

<!-- До ThemeScopeStyle: Svelte dynamic element самостоятельно меняет intro state. -->
{#if probeIntro}<div data-tree-label-intro-probe>
  <TreeSelect aria-label="Intro probe" multiple treeData={[{ value: 'probe', title: 'Intro label' }]}
    defaultValue={['probe']} maxTagCount={0} treeTitleRender={introTitle} maxTagPlaceholder={introSummary} />
  <output data-tree-label-intro-count>{introCount}</output>
</div>{/if}
<ConfigProvider theme={{ token: { colorPrimary: '#1254a0', motion: false } }}>
  <form aria-label="Renderer form" onsubmit={event => event.preventDefault()}>
    <div data-tree-label-control style:width={interactive ? '960px' : '420px'}>
      {#if mounted}<TreeSelect aria-label="Renderer selection" name="renderer-value"
        treeData={data} fieldNames={sample.alias ? { value: field, label: labelField, children } : undefined}
        treeDataSimpleMode={sample.simple} treeNodeLabelProp={sample.labelProp}
        multiple={!sample.single} treeCheckable={sample.checkable} treeCheckStrictly={sample.strict}
        labelInValue={sample.labeled || sample.strict} showCheckedStrategy={sample.strategy}
        treeDefaultExpandAll open={opened} allowClear
        value={sample.controlled ? value : undefined}
        defaultValue={sample.controlled ? undefined : treeLabelValues(sample)}
        maxTagCount={sample.count ?? 0} maxTagTextLength={1} maxTagPlaceholder={placeholder}
        tagRender={sample.customTag ? tag : undefined} treeTitleRender={titleRenderer}
        bind:nativeElement={root} bind:inputElement={editor}
        onOpenChange={open => { events = [...events, { kind: 'open', open }]; opened = open; }}
        onChange={(next, labels, extra) => change(next, labels, extra.triggerValue)}
        onSelect={(value, node) => { events = [...events, { kind: 'select', value, node: record(node) }]; }}
        onDeselect={(value, node) => { events = [...events, { kind: 'deselect', value, node: record(node) }]; }}
        onClear={() => { events = [...events, { kind: 'clear' }]; }} />{/if}
    </div>
  </form>
</ConfigProvider>
<ConfigProvider theme={{ token: { colorPrimary: '#2ea050' } }}>
  <div data-tree-label-history>{#if showHistory}{#each history as batch}<div data-tree-label-batch>{@render records(batch)}</div>{/each}{/if}</div>
</ConfigProvider>
<output data-tree-label-events>{JSON.stringify(events)}</output>
<output data-tree-label-lifecycle>{JSON.stringify(lifecycle)}</output>
<output data-tree-label-refs>{String(Boolean(root))}:{String(Boolean(editor))}</output>
<button onclick={() => { data = treeLabelData(sample, true); }}>Update renderer data</button>
<button onclick={() => { data = treeLabelData(sample, false, true); }}>Remove renderer data</button>
<button onclick={() => { version = 'New'; }}>Update title renderer</button>
<button onclick={() => { enabled = false; }}>Remove title renderer</button>
<button onclick={() => { data = treeLabelData(sample, true); version = 'New'; }}>Update renderer and data</button>
<button onclick={() => { mounted = false; }}>Unmount renderer selection</button>
<button onclick={() => { showHistory = !showHistory; }}>Toggle returned labels</button>
<input aria-label="Outside renderer draft" />
