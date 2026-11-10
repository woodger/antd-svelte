<script lang="ts" generics="ValueType extends TreeSelectValue = TreeSelectValue, Data extends object = TreeSelectNode">
  import { tick, untrack } from 'svelte';
  import type {
    TreeSelectProps,
    TreeSelectSearchConfig,
    TreeSelectValue,
    TreeSelectRawValue,
    TreeSelectLabeledValue,
    TreeSelectLabel,
    TreeSelectNode
  } from './tree-select.types';
  import type { TreeDataNode, TreeEventNode, TreeKey } from './tree.types';
  import {
    treeSelectIndex,
    treeSelectLabeled,
    treeSelectChecks,
    treeSelectStrategy,
    treeSelectLabels,
    filterTreeSelect,
    toggleTreeSelect
  } from './tree-select.engine';
  import { expandTreeParents, treeCheckDisabled } from './tree.engine';
  import { treeSelectChildren, treeSelectData, treeSelectNodeValue } from './tree-select-data.engine';
  import { useConfig } from './config-context';
  import ThemeScopeStyle from './ThemeScopeStyle.svelte';
  import { getSelectPrefixCss } from './select-prefix.engine';
  import { getTreeSelectPrefixCss } from './tree-select-prefix.engine';
  import { useVariant } from './variant.svelte';
  import RenderEmpty from './RenderEmpty.svelte';
  import { useForm, useFormField } from './form-context';
  import { useCompact } from './space-compact-context';
  import { compactClasses } from './space-compact.engine';
  import { connectPopup, getPopupActiveElement } from './popup.dom';
  import { createPopupContainer } from './popup-container.model.svelte.js';
  import { useComponentTheme } from './theme-component.svelte';
  import { connectComponentTheme } from './theme-component.dom';
  import Tree from './Tree.svelte';
  import TreeTitle from './TreeTitle.svelte';
  import Icon from './Icon.svelte';
  import NoCompactStyle from './NoCompactStyle.svelte';
  let {
    prefixCls,
    treeData = [],
    fieldNames,
    treeDataSimpleMode,
    value,
    defaultValue,
    multiple = false,
    treeCheckable = false,
    treeCheckStrictly = false,
    labelInValue = false,
    showCheckedStrategy,
    onChange,
    onSelect,
    onDeselect,
    showSearch,
    treeNodeLabelProp,
    open,
    defaultOpen = false,
    onOpenChange,
    allowClear = false,
    onClear,
    notFoundContent,
    loading = false,
    treeExpandedKeys,
    treeDefaultExpandedKeys = [],
    treeDefaultExpandAll = false,
    treeExpandAction = false,
    onTreeExpand,
    treeLoadedKeys,
    onTreeLoad,
    loadData,
    treeLine = false,
    treeIcon = false,
    switcherIcon,
    treeTitleRender,
    listHeight = 256,
    popupMatchSelectWidth = true,
    placement,
    onPopupScroll,
    getPopupContainer,
    classNames,
    rootClassName = '',
    size,
    status,
    variant,
    disabled,
    id,
    name,
    placeholder,
    class: className = '',
    style,
    nativeElement = $bindable(),
    inputElement = $bindable(),
    onkeydown,
    onfocus,
    onblur,
    ...attributes
  }: TreeSelectProps<
    ValueType, Data
  > = $props();
  const config = useConfig();
  let prefix = $derived(config.getPrefixCls('select', prefixCls));
  let treePrefix = $derived(config.getPrefixCls('tree-select', prefixCls));
  let rootPrefix = $derived(config.getPrefixCls());
  let privateNamespace = $derived(rootPrefix.replaceAll('.', ''));
  let selectPrefixCss = $derived(getSelectPrefixCss(prefix, rootPrefix));
  let treePrefixCss = $derived(getTreeSelectPrefixCss(treePrefix, rootPrefix));
  const variantContext = useVariant('treeSelect', () => ({ variant }));
  let appearance = $derived(variantContext.variant);
  const form = useForm();
  const controlRef = {
    get nativeElement() {
      return nativeElement;
    },
    focus, blur
  };
  const field = useFormField(() => controlRef);
  const compact = useCompact();
  const selectTheme = useComponentTheme('Select');
  const treeSelectTheme = useComponentTheme('TreeSelect');
  const componentStyle = $derived(
    [selectTheme.style, treeSelectTheme.style].filter(Boolean).join(';') || undefined
  );
  const generated = $props.id();
  let internalValue = $state.raw<TreeSelectValue>(untrack(() => defaultValue));
  let actualValue = $derived(value === undefined ? internalValue : value);
  let items = $derived(treeSelectLabeled(actualValue));
  let data = $derived(treeSelectData(treeData, treeDataSimpleMode));
  let index = $derived(treeSelectIndex(data, fieldNames));
  let checkable = $derived(treeCheckable || treeCheckStrictly);
  let isMultiple = $derived(checkable || multiple);
  let labeled = $derived(treeCheckStrictly || labelInValue);
  let conduction = $derived(treeCheckable && !treeCheckStrictly);
  let strategy = $derived(!treeCheckable ? 'SHOW_ALL' : showCheckedStrategy ?? 'SHOW_CHILD');
  let checks = $derived(treeSelectChecks(items, conduction, index));
  let display = $derived(
    treeSelectLabels(
      treeSelectStrategy(checks.checked, strategy, index).map(
        raw => ({
          value: raw,
          label: labelInValue ? items.find(item => item.value === raw)?.label : undefined
        })
      ),
      index,
      treeNodeLabelProp,
      items
    ).map(
      item => ({ ...item, label: item.label ?? item.value })
    )
  );
  let searchConfig = $derived<TreeSelectSearchConfig<Data>>(
    { ...(typeof showSearch === 'object' ? showSearch : {}) }
  );
  let internalSearch = $state('');
  let search = $derived(searchConfig.searchValue ?? internalSearch);
  let canSearch = $derived(typeof showSearch === 'object' ? true : showSearch ?? isMultiple);
  let autoClear = $derived(searchConfig.autoClearSearchValue ?? true);
  let filtered = $derived(filterTreeSelect(data, search, searchConfig, fieldNames));
  let filteredIndex = $derived(treeSelectIndex(filtered, fieldNames));
  let blocked = $derived(
    disabled ?? field?.disabled ?? form?.disabled ?? config.componentDisabled
  );
  let resolvedSize = $derived(size ?? compact?.size ?? config.componentSize);
  let resolvedStatus = $derived(status ?? field?.status);
  let controlId = $derived(id ?? field?.id ?? `ant-tree-select-${generated}`);
  let internalOpen = $state(untrack(() => defaultOpen));
  let visible = $derived((open ?? internalOpen) && !blocked);
  let inputValue = $derived(
    isMultiple || visible && canSearch ? search
      : treeTitleRender || Array.isArray(display[0]?.label) ? '' : text(display[0]?.label)
  );
  let mounted = $state(untrack(() => defaultOpen || open === true));
  let shown = $state(false);
  let focused = $state(false);
  let root = $state<HTMLDivElement>();
  let editor = $state<HTMLInputElement>();
  let popup = $state<HTMLDivElement>();
  const portal = createPopupContainer(() => ({
    open: visible,
    reference: root,
    getPopupContainer: getPopupContainer || config.getPopupContainer,
    themeStyle: componentStyle
  }));
  let treeElement = $state<HTMLDivElement>();
  let active = $state<TreeKey | null>(null);
  let activeDescendant = $state<string>();
  let expanded = $state.raw<TreeKey[]>(
    untrack(
      () => treeDefaultExpandAll
        ? index.ordered.filter(entry => entry.children.length).map(entry => entry.key)
        : expandTreeParents(treeDefaultExpandedKeys, index)
    )
  );
  let searchExpanded = $state.raw<TreeKey[]>([]);
  let loaded = $state.raw<TreeKey[]>([]);
  let panelExpanded = $derived(treeExpandedKeys ?? (search ? searchExpanded : expanded));
  let initialized = untrack(() => defaultOpen || open === true);
  function initializePanel() {
    if (!initialized) {
      expanded = treeDefaultExpandAll
        ? index.ordered.filter(entry => entry.children.length).map(entry => entry.key)
        : expandTreeParents(treeDefaultExpandedKeys, index);
      initialized = true;
    }
  }
  let previousOpen = false;
  let previousSearch = '';
  let previousProps = untrack(() => ({ value, open, search: searchConfig.searchValue }));
  // Внутренние DOM-ссылки сохраняются при обновлении spread props без bind:ref.
  $effect(() => {
    nativeElement = root;
    return () => { nativeElement = undefined; };
  });
  $effect(() => {
    inputElement = editor;
    return () => { inputElement = undefined; };
  });
  $effect(() => {
    const next = { value, open, search: searchConfig.searchValue };
    if (next.value !== previousProps.value)
      internalValue = next.value;
    if (next.open !== previousProps.open)
      internalOpen = Boolean(next.open);
    if (next.search !== previousProps.search)
      internalSearch = next.search ?? '';
    previousProps = next;
  });
  $effect(() => {
    if (blocked)
      internalOpen = false;
  });
  $effect(() => {
    const nextOpen = visible;
    const nextSearch = search;
    if (nextSearch !== previousSearch && nextSearch)
      searchExpanded = filteredIndex.ordered.filter(entry => entry.node.children !== undefined).map(
        entry => entry.key
      );
    if (nextOpen && (!previousOpen || nextSearch !== previousSearch)) {
      mounted = true;
      untrack(initializePanel);
      active = untrack(
        () => !isMultiple && checks.checked.length && !nextSearch
          ? checks.checked[0]
          : firstNode(filtered)
      );
    }
    previousOpen = nextOpen;
    previousSearch = nextSearch;
  });
  $effect(() => {
    void active;
    void visible;
    void filteredIndex;
    const root = treeElement;
    void tick().then(() => {
      activeDescendant = visible
        ? root?.querySelector('[role="tree"]')?.getAttribute('aria-activedescendant') ?? undefined
        : undefined;
    });
  });
  $effect(() => {
    if (!visible || !popup || !root) return;
    const position = placement ?? (config.direction === 'rtl' ? 'bottomRight' : 'bottomLeft');
    return connectPopup(popup, root, {
      placement: position.startsWith('top') ? 'top' : 'bottom',
      gap: 4,
      align: position.endsWith('Right') ? 'right' : 'left',
      autoAdjustOverflow: true,
      maxWidth: '100vw',
      matchAnchorWidth: popupMatchSelectWidth !== false,
      preserveFocus: true,
      onPlacement: () => { },
      onVisibilityChange: next => {
        shown = next;
      },
      onDismiss: reason => {
        requestOpen(false);
        if (reason === 'escape')
          editor?.focus();
      }
    });
  });
  $effect(() => {
    if (!editor) return;
    const input = editor;
    input.setCustomValidity(
      (attributes.required ?? field?.required) && !display.length
        ? config.locale.selectRequiredText ?? 'Please select a value.'
        : ''
    );
    return () => input.setCustomValidity('');
  });
  function firstNode(nodes: typeof treeData): TreeKey | null {
    for (const node of nodes) {
      if (Reflect.get(node, 'disabled') || Reflect.get(node, 'selectable') === false)
        continue;
      if (!search
        || String(Reflect.get(node, searchConfig.treeNodeFilterProp ?? 'value')).toLowerCase().includes(
          search.toLowerCase()
        )) return treeSelectNodeValue(node, index.fields);
      const child = firstNode(treeSelectChildren(node, index.fields));
      if (child !== null) return child;
    }
    return null;
  }
  function text(label: TreeSelectLabel | undefined): string {
    return Array.isArray(label) ? label.map(text).join('')
      : typeof label === 'function' || typeof label === 'boolean' || label == null ? '' : String(label);
  }
  function requestOpen(next: boolean) {
    if (next && blocked || next === visible) return;
    if (next) {
      initializePanel();
      mounted = true;
    }
    internalOpen = next;
    onOpenChange?.(next);
  }
  function searchInput(next: string) {
    const input = editor;
    internalSearch = next;
    searchConfig.onSearch?.(next);
    requestOpen(true);

    if (searchConfig.searchValue !== undefined && input) {
      void tick().then(() => {
        if (input === editor && input.isConnected)
          input.value = inputValue;
      });
    }
  }
  function publish(
    raw: TreeSelectRawValue[],
    triggerValue?: TreeSelectRawValue
  ) {
    const before = items;
    const nextItems = treeSelectLabels(
      raw.map(value => ({ value })),
      index,
      treeNodeLabelProp,
      before
    );
    internalValue = nextItems;
    if (autoClear)
      internalSearch = '';
    const values = conduction ? treeSelectStrategy(raw, strategy, index) : raw;
    const returnItems = treeSelectLabels(
      [
        ...values.map(value => ({ value })),
        ...treeCheckStrictly
          ? before.filter(item => item.halfChecked && !values.includes(item.value))
          : []
      ],
      index,
      treeNodeLabelProp,
      before
    );
    const returnValue = labeled ? returnItems : returnItems.map(item => item.value);
    onChange?.(
      (isMultiple ? returnValue : returnValue[0]) as ValueType,
      labeled ? null : returnItems.map(item => item.label!),
      { triggerValue }
    );
  }
  function choose(raw: TreeSelectRawValue, source: 'option' | 'selection' = 'option') {
    const node = index.values.get(raw);
    if (blocked
      || source === 'option'
      && (!node
        || Reflect.get(node, 'disabled')
        || checkable
        && treeCheckDisabled(
          index.entities.get(String(raw))!.node
        ))) return;
    const selected = !isMultiple || !checks.checked.includes(raw);
    const next = isMultiple
      ? toggleTreeSelect(raw, selected, items, checks, conduction, index)
      : [raw];
    publish(next, raw);
    if (selected)
      onSelect?.(raw, node
        ? { ...node }
        : undefined); else onDeselect?.(
          raw,
          node ? { ...node } : undefined
        );
    if (!isMultiple)
      requestOpen(false);
    editor?.focus();
  }
  function clear() {
    if (blocked) return;
    onClear?.();
    publish([]);
    editor?.focus();
  }
  function panelSelect(node: TreeEventNode) {
    choose(node.key as TreeSelectRawValue);
  }
  function expandPanel(keys: TreeKey[]) {
    expanded = keys;
    searchExpanded = keys;
    onTreeExpand?.(keys);
  }
  function loadPanel(node: TreeEventNode) {
    const { key, expanded, selected, checked, halfChecked, loaded, loading, pos, active,
      dragOver, dragOverGapTop, dragOverGapBottom } = node;
    return loadData?.(
      {
        ...index.values.get(key as TreeSelectRawValue),
        key, expanded, selected, checked, halfChecked, loaded, loading, pos, active,
        dragOver, dragOverGapTop, dragOverGapBottom
      } as TreeEventNode<Data>
    )
      ?? Promise.resolve();
  }
  function blurWithin(event: FocusEvent) {
    const element = root;
    if (!element) return;
    if (event.relatedTarget instanceof Node
      && (element.contains(event.relatedTarget)
        || popup?.contains(
          event.relatedTarget
        ))) return;
    queueMicrotask(() => {
      if (root !== element || !element.isConnected) return;
      const target = getPopupActiveElement(element);
      const popupTarget = popup && getPopupActiveElement(popup);
      if (target && element.contains(target)
        || popupTarget && popup?.contains(popupTarget)) return;
      focused = false;
      field?.onBlur();
      requestOpen(false);
      if (autoClear)
        internalSearch = '';
    });
  }
  async function keyboard(
    event: KeyboardEvent & { currentTarget: EventTarget & HTMLInputElement; }
  ) {
    onkeydown?.(event);
    if (event.defaultPrevented || event.isComposing || blocked) return;
    if (event.key === 'Escape') {
      if (visible) {
        event.preventDefault();
        event.stopPropagation();
        requestOpen(false);
      }
      return;
    }
    if (event.key === 'Tab') {
      requestOpen(false);
      return;
    }
    if (event.key === 'Backspace' && isMultiple && !search) {
      const last = [...display].reverse().find(item => !item.disabled);
      if (last) {
        event.preventDefault();
        choose(last.value, 'selection');
      }
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      if (!visible) {
        requestOpen(true);
        return;
      }
      const node = active !== null && index.values.get(active as TreeSelectRawValue);
      if (node && Reflect.get(node, 'selectable') !== false)
        choose(active as TreeSelectRawValue);
      return;
    }
    if (['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
      event.preventDefault();
      if (!visible) {
        requestOpen(true);
        return;
      }
      await tick();
      treeElement?.querySelector('[role="tree"]')?.dispatchEvent(
        new KeyboardEvent(
          'keydown',
          { key: event.key, bubbles: true, cancelable: true, composed: true }
        )
      );
    }
  }
  export function focus(options?: FocusOptions) {
    editor?.focus(options);
  }
  export function blur() {
    editor?.blur();
  }
</script>
<style>
  [data-ant-tree-choice-control] { display:flex;align-items:center;width:100%;position:relative; }
  [data-ant-tree-choice-content] { min-width:0;position:relative; }
  [data-ant-tree-choice-control]:focus-within { outline:2px solid var(--ant-color-primary);outline-offset:2px; }
  [data-ant-tree-choice-control][data-ant-tree-choice-source-theme] { align-items:flex-start; }
  [data-ant-tree-choice-control][data-ant-tree-choice-source-theme]:focus-within { outline:0;outline-offset:0; }
  [data-ant-tree-choice-control] [data-ant-tree-choice-input] { position:relative;inset:auto;width:100%;min-width:0;padding:0;border:0;outline:0;background:transparent;color:inherit;font:inherit;line-height:inherit;cursor:inherit; }
  [data-ant-tree-choice-input]::placeholder { color:var(--ant-color-text-placeholder); }
  [data-ant-tree-choice-multiple] { height:auto;min-height:var(--ant-native-tree-choice-height); }
  [data-ant-tree-choice-multiple] [data-ant-tree-choice-content] { gap:0; }
  [data-ant-tree-choice-multiple] [data-ant-tree-choice-input] { flex:1 1 60px;width:60px;min-width:40px;max-width:100%; }
  [data-ant-tree-choice-source-theme][data-ant-tree-choice-multiple] [data-ant-tree-choice-input] { line-height:calc(var(--ant-select-internal_fixed_item_margin) * 2 + var(--ant-native-tree-choice-multi-item-height)); }
  [data-ant-tree-choice-multiple] [data-ant-tree-choice-selection-item] { flex:none;box-sizing:border-box;max-width:100%;min-width:0; }
  [data-ant-tree-choice-source-theme][data-ant-tree-choice-multiple] [data-ant-tree-choice-selection-item] { max-width:calc(100% - var(--ant-select-internal_fixed_item_margin) * 2); }
  [data-ant-tree-choice-selection-item-remove],.clear { padding:0;border:0;background:transparent;cursor:pointer;flex:none; }
  .clear { margin-inline-end:4px;color:var(--ant-color-text-tertiary);display:flex; }
  .suffix { display:flex;flex:none;color:var(--ant-color-text-quaternary);pointer-events:none; }
  [data-ant-tree-choice-source-theme] .clear { display:inline-block;margin-inline-end:0;color:var(--ant-color-text-quaternary); }
  [data-ant-tree-choice-source-theme] .clear:hover { color:var(--ant-color-icon); }
  [data-ant-tree-choice-source-theme] .clear:focus-visible { opacity:1; }
  [data-ant-tree-choice-source-theme]:has(.clear):hover .suffix,[data-ant-tree-choice-source-theme]:has(.clear:focus-visible) .suffix { opacity:0; }
  .single-snippet { position:absolute;pointer-events:none;inset-inline-start:0; }
  .popup { position:fixed;margin:0;border:0;overflow:visible; }
  .popup-body { overflow:auto; }
  [data-ant-tree-choice-selection-item-disabled] { color:var(--ant-select-multiple-item-color-disabled); }
  [data-ant-tree-choice-source-theme] [data-ant-tree-choice-selection-item-disabled] { color:inherit; }
  [data-ant-tree-choice-selection-item-remove]:focus-visible,.clear:focus-visible { outline:2px solid var(--ant-color-primary); }
  @media (hover:none) {
    [data-ant-tree-choice-source-theme]:has(.clear) .suffix { opacity:0; }
  }
</style>
{#snippet labelNode(item:TreeSelectLabeledValue)}{#if treeTitleRender && index.values.has(item.value)}{@render treeTitleRender(index.values.get(item.value)!)}{:else}<TreeTitle value={item.label ?? item.value} node={index.values.get(item.value) ?? {}} />{/if}{/snippet}
{#snippet panelTitle(node:TreeDataNode)}
  {@const original = filteredIndex.values.get(node.key as TreeSelectRawValue)}
  {#if treeTitleRender && original}{@render treeTitleRender(original)}{/if}
{/snippet}
{#if selectPrefixCss}<ThemeScopeStyle css={selectPrefixCss} scope={`tree-select-control-prefix:${prefix}:${rootPrefix}`} />{/if}{#if treePrefixCss}<ThemeScopeStyle css={treePrefixCss} scope={`tree-select-prefix:${treePrefix}:${rootPrefix}`} />{/if}<div data-ant-tree-choice-control data-ant-select-prefix={prefix} data-ant-select-root-prefix={rootPrefix}
  data-ant-tree-select-prefix={treePrefix} data-ant-tree-select-root-prefix={rootPrefix}
  data-ant-tree-choice-source-theme={Boolean(selectTheme.className) || undefined}
  data-ant-tree-choice-multiple={isMultiple || undefined}
  style:--ant-native-tree-choice-height={`var(--${privateNamespace}-select-height)`}
  style:--ant-native-tree-choice-multi-item-height={`var(--${privateNamespace}-select-multi-item-height)`}
  bind:this={root} role="presentation" onpointerdown={event => {
    if (!blocked && event.target instanceof Element && !event.target.closest('button,input')) {
      event.preventDefault();
      editor?.focus();
      requestOpen(true);
    }
  }} dir={config.direction}
  style={[componentStyle, style].filter(Boolean).join(';') || undefined} class={[
      `${prefix} ant-select-css-var ant-tree-select-css-var ${prefix}-show-arrow`,
      selectTheme.className,
      selectTheme.className && `${prefix}-source-theme`,
      selectTheme.className && canSearch && `${prefix}-show-search`,
      selectTheme.className && allowClear && `${prefix}-allow-clear`,
      `${prefix}-${appearance}`,
      isMultiple ? `${prefix}-multiple` : `${prefix}-single`,
      visible && `${prefix}-open`,
      focused && `${prefix}-focused`,
      blocked && `${prefix}-disabled`,
      resolvedSize === 'small' && `${prefix}-sm`,
      resolvedSize === 'large' && `${prefix}-lg`,
      resolvedStatus && `${prefix}-status-${resolvedStatus}`,
      config.direction === 'rtl' && `${prefix}-rtl`,
      compactClasses(prefix, config.direction, compact),
      className,
      rootClassName
    ]}>
  <div data-ant-tree-choice-content class={`${prefix}-content`}>
    {#if isMultiple}{#each display as item(item.value)}<span data-ant-tree-choice-selection-item
      data-ant-tree-choice-selection-item-disabled={blocked || item.disabled || undefined} class={[
        `${prefix}-selection-item`,
        (blocked || item.disabled) && `${prefix}-selection-item-disabled`
      ]} title={text(item.label)}><span class={`${prefix}-selection-item-content`}>{@render labelNode(item)}</span>{#if !blocked&&!item.disabled}<button type="button" data-ant-tree-choice-selection-item-remove class={`${prefix}-selection-item-remove`} aria-label={`${config.locale.removeText ?? 'Remove'} ${text(item.label)}`} onpointerdown={event => event.preventDefault()} onclick={() => choose(item.value, 'selection')}><Icon name="close" /></button>{/if}</span>{/each}
    {:else if (!visible || !canSearch) && (treeTitleRender || typeof display[0]?.label==='function' || Array.isArray(display[0]?.label)) && display[0]}<span class="single-snippet">{@render labelNode(display[0])}</span>{/if}
    <input {...attributes} bind:this={editor} id={controlId} data-ant-tree-choice-input class={`${prefix}-input`} type="text" role="combobox" aria-haspopup="tree" aria-controls={`${controlId}-list`} aria-expanded={visible} aria-autocomplete={canSearch ? 'list' : 'none'} aria-activedescendant={visible ? activeDescendant : undefined} aria-invalid={field?.invalid || resolvedStatus === 'error'
        || attributes['aria-invalid']
        || undefined} aria-describedby={[attributes['aria-describedby'], field?.describedBy].filter(
            Boolean
          )
            .join(
              ' '
            )
            || undefined} aria-required={attributes.required ?? field?.required} aria-busy={loading || undefined} autocomplete="off" disabled={blocked} readonly={!canSearch} placeholder={display.length ? '' : placeholder} value={inputValue} oninput={event => searchInput(event.currentTarget.value)} onclick={() => requestOpen(true)} onkeydown={keyboard} onfocus={event => {
            focused = true;
            onfocus?.(event);
          }} onblur={event => {
          onblur?.(event);
          blurWithin(event);
        }} />
  </div>
  {#if allowClear&&!blocked&&(display.length||search)}<button type="button" class={['clear', selectTheme.className && `${prefix}-clear`]} aria-label={config.locale.clearText} onpointerdown={event => event.preventDefault()} onclick={clear}><Icon name="close-circle-filled" /></button>{/if}
  <span class={['suffix', selectTheme.className && `${prefix}-suffix`]} aria-hidden="true"><Icon name={loading ? 'loading' : 'down'} /></span>
  {#if name??field?.name}{#each display as item(item.value)}<input type="hidden" name={name ?? field?.name} value={String(item.value)} disabled={blocked} />{/each}{/if}
</div>
<NoCompactStyle>{#if mounted}
{@const initialPopupStyle = untrack(() => componentStyle)}
<div data-ant-select-prefix={prefix} data-ant-select-root-prefix={rootPrefix}
  data-ant-tree-select-prefix={treePrefix} data-ant-tree-select-root-prefix={rootPrefix}
  bind:this={popup} popover="manual" hidden={!visible || !shown} dir={config.direction} class={[
    `popup ${prefix}-dropdown ant-select-css-var ${treePrefix}-dropdown ant-tree-select-css-var`,
    selectTheme.className,
    selectTheme.className && 'ant-tree-select-source-popup',
    config.direction === 'rtl' && `${treePrefix}-dropdown-rtl`,
    classNames?.popup?.root
  ]} style={initialPopupStyle}
  {@attach node => connectComponentTheme(node, componentStyle)}
  {@attach portal}
  style:width={typeof popupMatchSelectWidth === 'number'
      ? `${popupMatchSelectWidth}px`
      : undefined} onfocusout={blurWithin}>
  <div class="popup-body" style:max-height={`${listHeight}px`} onscroll={onPopupScroll}>
    {#if filtered.length}<Tree prefixCls="ant-tree" motion={false} _themeStyle={componentStyle} _componentConfig={false} bind:nativeElement={treeElement} treeData={filteredIndex.data} id={`${controlId}-list`} class={treeSelectTheme.className && 'ant-tree-select-source-tree'} aria-label={attributes['aria-label'] ?? placeholder ?? config.locale.searchText} focusable={false} multiple={isMultiple} checkable={checkable} checkStrictly checkedKeys={{ checked: checks.checked, halfChecked: checks.halfChecked }} selectedKeys={checkable ? [] : checks.checked} expandedKeys={panelExpanded} expandAction={treeExpandAction} activeKey={active} onActiveChange={key => {
        active = key;
      }} onSelect={(_keys, info) => panelSelect(info.node)} onCheck={(_keys, info) => panelSelect(info.node)} onExpand={expandPanel} loadedKeys={treeLoadedKeys ?? loaded} onLoad={(keys) => {
          onTreeLoad?.(keys);
          if (treeLoadedKeys === undefined)
            loaded = keys;
        }} loadData={visible && !search && loadData ? loadPanel : undefined} showLine={treeLine} showIcon={treeIcon} {switcherIcon} titleRender={treeTitleRender ? panelTitle : undefined} filterTreeNode={node => Boolean(
          search
          && String(
            index.values.has(node.key as TreeSelectRawValue)
              ? Reflect.get(index.values.get(node.key as TreeSelectRawValue)!, searchConfig.treeNodeFilterProp ?? 'value')
              : undefined
          ).toLowerCase().includes(
            search.toLowerCase()
          )
        )} />
    {:else}<div id={`${controlId}-list`} role="listbox" class={`${prefix}-empty`}>
      {#snippet nativeEmpty()}{config.locale.emptyText}{/snippet}
      <RenderEmpty componentName="TreeSelect" local={notFoundContent} fallback={nativeEmpty} />
    </div>{/if}
  </div>
</div>{/if}</NoCompactStyle>
