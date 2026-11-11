<script lang="ts">
  import { untrack, type Snippet } from 'svelte';
  import { ConfigProvider, Form, FormItem, Input, SpaceCompact, TreeSelect, createForm,
    type TreeEventNode, type TreeSelectConfig, type TreeSelectProps, type TreeSelectStyles,
    type TreeSelectSwitcherIcon, type TreeSelectTagInfo, type TreeSelectValue } from 'antd-svelte';
  import { treeSelectSemanticData, treeSelectSemanticFields, treeSelectSemanticInfo, treeSelectSemanticLayers,
    type SemanticRecord, type SemanticStyles, type SemanticTreeNode, type Switcher, type TreeSelectSemanticSample }
    from './tree-select-semantic-cases';

  let { sample }: { sample: TreeSelectSemanticSample; } = $props();
  const form = createForm<{ node?: TreeSelectValue; }>({ initialValues: {} });
  let data = $state.raw(untrack(() => treeSelectSemanticData(sample.lazy)));
  let events = $state.raw<unknown[][]>([]);
  let updated = $state(false);
  let finish: (() => void) | undefined;
  let layers = $derived(treeSelectSemanticLayers(sample));
  let prefix = $derived(sample.rtl ? 'scope-choice' : undefined);
  let provider = $derived<TreeSelectConfig | undefined>(sample.provider === 'plain'
    ? { class: 'semantic-plain-provider', style: '--semantic-plain-provider:ignored', variant: 'filled' }
    : sample.provider ? { variant: 'filled', ...appearance(sample.provider, layers.provider, 'provider'),
      switcherIcon: providerSwitcher } : undefined);
  let inner = $derived<TreeSelectConfig | undefined>(sample.nested === 'replace'
    ? { variant: 'borderless', ...appearance('object', layers.inner, 'inner'), switcherIcon: switcher('array', 'Inner') }
    : sample.nested === 'reset' ? {} : undefined);
  let options = $derived<TreeSelectProps<TreeSelectValue, SemanticTreeNode>>({
    prefixCls: prefix,
    class: 'semantic-direct',
    rootClassName: 'semantic-root-class',
    style: 'width:320px;--semantic-inline:root;--semantic-priority:inline',
    ...appearance(sample.local, updated ? layers.updated : layers.local, updated ? 'updated' : 'local'),
    treeData: data,
    fieldNames: treeSelectSemanticFields,
    treeDefaultExpandedKeys: ['p'],
    defaultValue: sample.value,
    defaultOpen: sample.initialOpen,
    disabled: sample.disabled,
    size: sample.explicitSize,
    multiple: sample.multiple,
    allowClear: true,
    maxTagCount: sample.tags ? 2 : undefined,
    tagRender: sample.tags === 'custom' ? tag : undefined,
    placeholder: sample.placeholder === 'rich' ? richPlaceholder
      : sample.placeholder === 'text' ? 'Choose node' : undefined,
    prefix: sample.affixes ? 'Before' : undefined,
    suffixIcon: sample.affixes ? 'After' : undefined,
    popupMatchSelectWidth: sample.popupWidth === 'number' ? 228 : undefined,
    popupRender: sample.customPopup ? popup : undefined,
    switcherIcon: switcher(sample.switcher, 'Local'),
    treeLine: typeof sample.lines === 'object' ? { showLeafIcon: switcher(sample.lines.leaf, 'Leaf') } : sample.lines,
    loadData: sample.lazy ? node => {
      record('load', node.key);
      return new Promise<void>(resolve => {
        finish = () => {
          finish = undefined;
          data = data.map(item => item.code === 'lazy'
            ? { ...item, nodes: [{ code: 'loaded', label: 'Loaded' }] } : item);
          resolve();
        };
      });
    } : undefined,
    onTreeExpand: keys => record('expand', keys),
    onTreeLoad: keys => record('loaded', keys),
    showSearch: { treeNodeFilterProp: 'label', onSearch: value => record('search', value) },
    onOpenChange: open => record('open', open),
    onChange: value => record('change', value ?? null),
    getPopupContainer: trigger => trigger.closest('[data-tree-select-semantic]')!
      .querySelector<HTMLElement>('[data-semantic-target]')!
  });

  function css(value: Record<string, string | number>) {
    return Object.entries(value).map(([key, value]) => {
      const name = key.replace(/[A-Z]/g, character => `-${character.toLowerCase()}`);
      return `${name}:${value}${typeof value === 'number' && key !== 'zIndex' ? 'px' : ''}`;
    }).join(';');
  }
  function styleSlots({ popup, ...control }: SemanticStyles): TreeSelectStyles {
    const render = (values: SemanticStyles['popup'] | typeof control) => Object.fromEntries(
      Object.entries(values ?? {}).map(([name, value]) => [name, css(value)]));
    return { ...render(control), popup: render(popup) };
  }
  function appearance(kind: SemanticRecord | undefined, parts: typeof layers.local, owner: string) {
    type Info = { props: Parameters<typeof treeSelectSemanticInfo>[0]; };
    if (!kind || kind === 'plain') return {};
    const styles = styleSlots(parts.styles);
    return kind === 'callback' ? {
      classNames: ({ props }: Info) => ({ ...parts.classes,
        root: `${parts.classes.root} semantic-${owner}-variant-${props.variant}` }),
      styles: ({ props }: Info) => ({ ...styles,
        root: `${styles.root};--semantic-info-${owner}:${treeSelectSemanticInfo(props, data)}` })
    } : { classNames: parts.classes, styles };
  }
  function switcher(value: Switcher | true | undefined, owner: string): TreeSelectSwitcherIcon {
    if (value === 'render') return owner === 'Local' ? localSwitcher : leafSwitcher;
    if (value === 'array') return [`${owner} `, iconPart, 0];
    return value;
  }
  function record(kind: string, value: unknown) { events = [...events, [kind, value]]; }
</script>

{#snippet iconPart()}<em>icon</em>{/snippet}
{#snippet richPlaceholder()}Choose <em>node</em>0{/snippet}
{#snippet tag(info: TreeSelectTagInfo)}<em data-semantic-tag>{@render info.label()}</em>{/snippet}
{#snippet popup(menu: Snippet)}<section><Input aria-label="Semantic draft" data-semantic-draft="" defaultValue="Initial draft" />{@render menu()}</section>{/snippet}
{#snippet renderedSwitcher(node: TreeEventNode, owner: string)}
  <strong data-semantic-switcher={[owner, node.key, node.expanded, node.isLeaf, Reflect.get(node, 'code')].join('|')}>{owner}</strong>
{/snippet}
{#snippet providerSwitcher(node: TreeEventNode)}{@render renderedSwitcher(node, 'Provider')}{/snippet}
{#snippet localSwitcher(node: TreeEventNode)}{@render renderedSwitcher(node, 'Local')}{/snippet}
{#snippet leafSwitcher(node: TreeEventNode)}{@render renderedSwitcher(node, 'Leaf')}{/snippet}
{#snippet control()}<TreeSelect {...options} aria-label="Semantic selection" />{/snippet}
{#snippet field()}
  {#if sample.form}
    <Form {form} size="small" variant="underlined">
      <FormItem name="node" validateStatus="warning">
        <SpaceCompact size="large">{@render control()}</SpaceCompact>
      </FormItem>
    </Form>
  {:else}{@render control()}{/if}
{/snippet}

<ConfigProvider prefixCls={sample.rtl ? 'scope' : undefined} direction={sample.rtl ? 'rtl' : 'ltr'}
  theme={{ token: { motion: false } }} componentDisabled={sample.form || undefined} treeSelect={provider}
  tree={{ classNames: { root: 'semantic-tree-config', item: 'semantic-tree-item-config' } }}
  select={{ variant: 'borderless' }}>
  <div data-tree-select-semantic data-semantic-prefix={prefix ?? 'ant-select'} data-semantic-width={sample.popupWidth}
    style="margin:64px">
    {#if sample.nested}<ConfigProvider treeSelect={inner}>{@render field()}</ConfigProvider>
    {:else}{@render field()}{/if}
    <div data-semantic-target></div>
    <button type="button" onclick={() => { updated = true; }}>Update semantic styles</button>
    <button type="button" onclick={() => finish?.()}>Finish semantic load</button>
    <button type="button" style="position:absolute;top:20px;right:20px">Outside semantic selection</button>
    <output data-semantic-events>{JSON.stringify(events)}</output>
  </div>
</ConfigProvider>
