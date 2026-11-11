<script lang="ts" generics="OptionType extends CascaderOption = CascaderOption, Multiple extends boolean = false">
  import { tick, untrack } from 'svelte';
  import type { Snippet } from 'svelte';
  import type {
    CascaderContent,
    CascaderOption,
    CascaderOmittedTag,
    CascaderPath,
    CascaderProps,
    CascaderRawValue,
    CascaderSearchConfig,
    CascaderSemanticValue,
    CascaderValue
  } from './cascader.types';
  import {
    cascaderChecks,
    cascaderClearIcon,
    cascaderColumns,
    cascaderDisplay,
    cascaderFields,
    cascaderIndex,
    cascaderLeaf,
    cascaderPathKey,
    cascaderPathOptions,
    cascaderRawValues,
    cascaderStrategy,
    mergeCascaderSlots,
    navigateCascader,
    searchCascader,
    toggleCascader,
    type CascaderRow
  } from './cascader.engine';
  import { connectCascaderTags, connectCascaderWidth, measureCascaderInput } from './cascader.dom';
  import { useConfig } from './config-context';
  import ThemeScopeStyle from './ThemeScopeStyle.svelte';
  import { getSelectPrefixCss } from './select-prefix.engine';
  import { getCascaderPrefixCss } from './cascader-prefix.engine';
  import { useVariant } from './variant.svelte';
  import { useForm, useFormField } from './form-context';
  import { useFormItemStatusContext } from './form-item-status';
  import { useFormFeedback } from './form-feedback-context';
  import FormFeedbackIcon from './FormFeedbackIcon.svelte';
  import CascaderPopupContent from './CascaderPopupContent.svelte';
  import { useCompact } from './space-compact-context';
  import { compactClasses } from './space-compact.engine';
  import { getSelectTagText } from './select-tag-text.engine';
  import { connectPopup, getPopupActiveElement } from './popup.dom';
  import { createPopupContainer } from './popup-container.model.svelte.js';
  import { useComponentTheme } from './theme-component.svelte';
  import { connectComponentTheme } from './theme-component.dom';
  import CascaderColumns from './CascaderColumns.svelte';
  import RenderEmpty from './RenderEmpty.svelte';
  import Empty from './Empty.svelte';
  import Icon from './Icon.svelte';
  import NoCompactStyle from './NoCompactStyle.svelte';

  let {
    panel = false,
    prefixCls,
    semanticProps,
    options = [],
    value,
    defaultValue,
    multiple,
    onChange,
    fieldNames,
    changeOnSelect = false,
    showCheckedStrategy = 'SHOW_PARENT',
    expandTrigger = 'click',
    loadData,
    expandIcon,
    loadingIcon,
    optionRender,
    notFoundContent,
    disabled,
    direction,
    showSearch = false,
    displayRender,
    open,
    defaultOpen = false,
    onOpenChange,
    allowClear = true,
    onClear,
    placeholder,
    prefix,
    suffixIcon,
    removeIcon,
    loading = false,
    size,
    status,
    variant,
    classNames,
    styles,
    popupMatchSelectWidth = false,
    placement,
    popupRender,
    tagRender,
    maxTagCount,
    maxTagTextLength,
    maxTagPlaceholder,
    children,
    autoFocus = false,
    showAction = [],
    onInputKeyDown,
    tabIndex,
    id,
    class: className,
    rootClassName,
    style,
    nativeElement = $bindable(),
    inputElement = $bindable(),
    onkeydown,
    onkeyup,
    onfocus,
    onblur,
    onPopupScroll,
    getPopupContainer,
    onclick,
    onmousedown,
    onfocusin,
    onfocusout,
    ...attributes
  }: CascaderProps<OptionType, Multiple> & {
    panel?: boolean;
    semanticProps?: CascaderProps<OptionType, Multiple>;
  } = $props();
  const config = useConfig();
  let selectPrefix = $derived(config.getPrefixCls('select', prefixCls));
  let cascaderPrefix = $derived(config.getPrefixCls('cascader', prefixCls));
  let rootPrefix = $derived(config.getPrefixCls());
  let privateNamespace = $derived(rootPrefix.replaceAll('.', ''));
  let selectPrefixCss = $derived(!panel && getSelectPrefixCss(selectPrefix, rootPrefix));
  let cascaderPrefixCss = $derived(getCascaderPrefixCss(cascaderPrefix, selectPrefix, rootPrefix));
  const variantContext = useVariant('cascader', () => ({ variant }));
  const controlRef = {
    get nativeElement() {
      return nativeElement;
    },
    focus, blur
  };
  const field = useFormField(() => controlRef);
  const itemStatus = useFormItemStatusContext();
  const feedback = useFormFeedback();
  const form = useForm();
  const compact = useCompact();
  const selectTheme = useComponentTheme('Select');
  const cascaderTheme = useComponentTheme('Cascader');
  const componentStyle = $derived(
    [!panel && selectTheme.style, cascaderTheme.style].filter(Boolean).join(';') || undefined
  );
  const generated = $props.id();
  let fields = $derived(cascaderFields(fieldNames));
  let index = $derived(cascaderIndex(options, fields));
  let isMultiple = $derived(Boolean(multiple));
  let internalValue = $state.raw<CascaderPath[]>(untrack(() => cascaderRawValues(defaultValue)));
  let paths = $derived(value === undefined ? internalValue : cascaderRawValues(value));
  let checks = $derived(cascaderChecks(paths, isMultiple, options, fields, index));
  let displayPaths = $derived([
    ...checks.missing,
    ...cascaderStrategy(checks.checked, showCheckedStrategy, index).map(
      key => index.paths.get(key)!.path
    )
  ]);
  let display = $derived(cascaderDisplay(displayPaths, options, fields, isMultiple));
  let context = $derived(config.cascader);
  let blocked = $derived(
    disabled ?? (panel ? config.componentDisabled
      : field?.disabled ?? form?.disabled ?? config.componentDisabled)
  );
  let resolvedDirection = $derived(direction || config.direction);
  let rtl = $derived(resolvedDirection === 'rtl');
  let resolvedSize = $derived(size ?? compact?.size
    ?? config.componentSize);
  let resolvedStatus = $derived(status ?? ('status' in itemStatus ? itemStatus.status : field?.status));
  let resolvedVariant = $derived(variantContext.variant);
  let semantic = $derived({
    props: {
      ...semanticProps,
      multiple,
      disabled: blocked,
      size: resolvedSize,
      variant: resolvedVariant,
      status: resolvedStatus
    }
  });
  function resolveSlots(value: CascaderSemanticValue<string> | undefined) {
    return typeof value === 'function' ? value(semantic) : value;
  }
  let classes = $derived(mergeCascaderSlots([
    !panel ? resolveSlots(context?.classNames) : undefined, resolveSlots(classNames)
  ], ' '));
  let css = $derived(mergeCascaderSlots([
    !panel ? resolveSlots(context?.styles) : undefined,
    { root: !panel ? context?.style : undefined }, resolveSlots(styles)
  ], ';'));
  let searchConfig: CascaderSearchConfig<OptionType> = $derived(
    { ...(typeof showSearch === 'object' ? showSearch : {}) }
  );
  let canSearch = $derived(!panel && Boolean(showSearch));
  let internalSearch = $state('');
  let search = $derived(canSearch ? searchConfig.searchValue ?? internalSearch : '');
  let internalOpen = $state(untrack(() => defaultOpen));
  let rawOpen = $derived(open ?? internalOpen);
  let inputValue = $derived(canSearch
    && (!isMultiple || rawOpen || searchConfig.autoClearSearchValue === false) ? search : '');
  let rows = $derived(searchCascader(
    search, options, fields, searchConfig, changeOnSelect || isMultiple
  ));
  let emptyOptions = $derived(!(search ? rows : options).length);
  let suppressed = $derived(notFoundContent !== undefined && !notFoundContent && emptyOptions);
  let visible = $derived(panel || rawOpen && !blocked && !suppressed);
  let mounted = $state(untrack(() => defaultOpen || open === true));
  let shown = $state(false);
  let focused = $state(false);
  let active = $state.raw<CascaderRawValue[]>([]);
  let searchKey = $derived(typeof active[0] === 'string' ? active[0] : null);
  let loadingKeys = $state.raw<string[]>([]);
  let root = $state<HTMLDivElement>();
  let editor = $state<HTMLInputElement>();
  let anchor = $state<Element>();
  let popup = $state<HTMLDivElement>();
  let contentElement = $state<HTMLDivElement>();
  let responsiveCount = $state(Number.POSITIVE_INFINITY);
  let tagCount = $derived(maxTagCount === 'responsive' ? responsiveCount
    : typeof maxTagCount === 'number' ? Math.max(0, maxTagCount) : display.length);
  let omitted = $derived(display.slice(tagCount));
  let columns = $derived(search
    ? rows.length ? [rows] : [] : cascaderColumns(options, active, fields));
  let popupStyle = $derived([
    popupMatchSelectWidth === true ? 'width:var(--cascader-anchor-width)' : undefined,
    !columns.length || search && searchConfig.matchInputWidth !== false
      ? 'min-width:min(var(--cascader-anchor-width),calc(100vw - 16px))' : 'min-width:auto',
    css.popup.root,
    typeof popupMatchSelectWidth === 'number' ? `width:${popupMatchSelectWidth}px` : undefined
  ].filter(Boolean).join(';'));
  const portal = createPopupContainer(() => ({
    open: !panel && visible,
    reference: anchor,
    getPopupContainer: panel ? undefined : getPopupContainer || config.getPopupContainer,
    themeStyle: [componentStyle, popupStyle].filter(Boolean).join(';'),
    preserveVariables: ['--cascader-anchor-width']
  }));
  let controlId = $derived(id ?? (!panel ? field?.id : undefined) ?? `ant-cascader-${generated}`);
  let listId = $derived(`${controlId}-list`);
  let activeKey = $derived(search ? searchKey : active.length ? cascaderPathKey(active) : null);
  let activeId = $derived(activeKey !== null
    && columns.some(column => column.some(row => row.key === activeKey))
    ? `${listId}-${encodeURIComponent(activeKey)}` : undefined);
  let expand = $derived(expandIcon ?? context?.expandIcon);
  let loadingNode = $derived(loadingIcon ?? context?.loadingIcon);
  let clearIcon = $derived(cascaderClearIcon(allowClear, context?.clearIcon));
  let remove = $derived(removeIcon === undefined ? context?.removeIcon : removeIcon);
  let suffix = $derived(suffixIcon === undefined
    ? loading ? loadingNode
      : visible && canSearch ? searchConfig.searchIcon ?? context?.searchIcon : context?.suffixIcon
    : suffixIcon);
  let hasClear = $derived(Boolean(allowClear) && !blocked && Boolean(display.length || search));
  let rootAttributes = $derived(panel || children ? attributes : Object.fromEntries(
    Object.entries(attributes).filter(([key]) => !key.startsWith('aria-')
      && !['role', 'tabindex', 'autofocus', 'inputmode'].includes(key))
  ));
  let previous = untrack(() => ({ value, open, search: searchConfig.searchValue }));
  let previousVisible: boolean | undefined;
  let previousRawOpen: boolean | undefined;
  let previousFirst: CascaderPath | undefined;

  $effect(() => {
    nativeElement = root;
    return () => { nativeElement = undefined; };
  });
  $effect(() => {
    inputElement = editor;
    return () => { inputElement = undefined; };
  });
  $effect(() => {
    const element = root;
    if (!element) return;
    if (panel || !children) {
      anchor = element;
      return;
    }

    function update() {
      anchor = element!.firstElementChild ?? element;
    }
    update();
    const observer = new element.ownerDocument.defaultView!.MutationObserver(update);
    observer.observe(element, { childList: true });
    return () => observer.disconnect();
  });

  $effect(() => {
    const next = { value, open, search: searchConfig.searchValue };
    if (next.value !== previous.value) internalValue = cascaderRawValues(next.value);
    if (next.open !== previous.open) internalOpen = Boolean(next.open);
    if (next.search !== previous.search) internalSearch = next.search ?? '';
    previous = next;
  });
  $effect(() => {
    const next = visible;
    const first = paths.find(path => !checks.missing.includes(path));
    if (!isMultiple && (next !== previousVisible || first !== previousFirst))
      active = first ? [...first] : [];
    if (!panel && next) mounted = true;
    if (!panel && !rawOpen && rawOpen !== previousRawOpen && !isMultiple && search)
      untrack(() => changeSearch(''));
    previousVisible = next;
    previousRawOpen = rawOpen;
    previousFirst = first;
  });
  $effect(() => {
    if (!blocked || panel) return;
    internalOpen = false;
    focused = false;
  });
  $effect(() => {
    void index;
    const pending = loadingKeys.filter(key => {
      const option = index.paths.get(key)?.options.at(-1);
      return option && !option[fields.children] && !option.isLeaf;
    });
    if (pending.length !== loadingKeys.length) loadingKeys = pending;
  });
  $effect(() => {
    if (!editor || !isMultiple) return;
    void inputValue;
    void resolvedSize;
    void config.theme;
    const input = editor;
    const previous = input.style.getPropertyValue('--select-input-width');
    input.style.setProperty('--select-input-width', `${measureCascaderInput(input)}px`);
    return () => {
      if (previous) input.style.setProperty('--select-input-width', previous);
      else input.style.removeProperty('--select-input-width');
    };
  });
  $effect(() => {
    if (panel || !visible || !popup || !anchor) return;
    void popupStyle;
    const position = placement ?? (rtl ? 'bottomRight' : 'bottomLeft');
    const disconnectWidth = connectCascaderWidth(popup, anchor);
    const disconnectPopup = connectPopup(popup, anchor, {
      placement: position.startsWith('top') ? 'top' : 'bottom',
      gap: 4,
      align: position.endsWith('Right') ? 'right' : 'left',
      autoAdjustOverflow: true,
      maxWidth: '100vw',
      preserveFocus: !children,
      onPlacement: () => { },
      onVisibilityChange: next => { shown = next; },
      onDismiss: reason => {
        requestOpen(false);
        if (reason === 'escape') focus();
      }
    });
    return () => {
      disconnectWidth();
      disconnectPopup();
    };
  });
  $effect(() => {
    if (!contentElement || maxTagCount !== 'responsive' || !isMultiple || panel) return;
    void display;
    void tagRender;
    void maxTagPlaceholder;
    const host = contentElement;
    let disposed = false;
    let disconnect: (() => void) | undefined;
    void tick().then(() => {
      if (!disposed) disconnect = connectCascaderTags(host, count => { responsiveCount = count; });
    });
    return () => {
      disposed = true;
      disconnect?.();
    };
  });

  function requestOpen(next: boolean) {
    if (panel || next && blocked || next === visible && next === rawOpen) return;
    const changed = next !== visible;
    if (next) mounted = true;
    internalOpen = next;
    if (changed)
      onOpenChange?.(next);
  }
  function publish(next: CascaderPath[]) {
    internalValue = next;
    const selected = next.map(path => cascaderPathOptions(path, options, fields));
    const result = isMultiple ? next : next[0];
    onChange?.(
      result as CascaderValue<Multiple> | (Multiple extends true ? never : undefined),
      (isMultiple ? selected : selected[0]) as Multiple extends true
        ? (OptionType | undefined)[][] : (OptionType | undefined)[] | undefined
    );
  }
  function choose(path: CascaderPath) {
    if (blocked) return;
    if (!isMultiple || searchConfig.autoClearSearchValue !== false) internalSearch = '';
    publish(isMultiple ? toggleCascader(path, checks, showCheckedStrategy, index) : [path]);
  }
  function selectRow(row: CascaderRow<OptionType>, keyboard = false) {
    if (blocked || row.disabled || !(row.leaf || changeOnSelect || isMultiple)) return;
    choose(row.path);
    if (!isMultiple && (row.leaf || changeOnSelect && (expandTrigger === 'hover' || keyboard)))
      requestOpen(false);
  }
  function activate(row: CascaderRow<OptionType>, hover: boolean) {
    if (blocked || row.disabled) return;
    const path = hover && row.leaf ? row.path.slice(0, -1) : row.path;
    activatePath(path);
  }
  function activatePath(path: CascaderRawValue[]) {
    active = path;
    if (!loadData || search || !path.length) return;
    const selected = cascaderPathOptions(path, options, fields);
    const option = selected.at(-1);
    if (!option || cascaderLeaf(option, fields)) return;
    loadingKeys = [...loadingKeys, cascaderPathKey(path)];
    loadData(selected as OptionType[]);
  }
  function changeSearch(next: string, notify = true) {
    const changed = search !== next;
    internalSearch = next;
    if (notify && changed) searchConfig.onSearch?.(next);
  }
  function handleSearch(next: string) {
    if (blocked) return;
    changeSearch(next);
    if (next) requestOpen(true);
    void tick().then(() => {
      if (editor) editor.value = inputValue;
    });
  }
  function clear() {
    if (blocked) return;
    onClear?.();
    focus();
    publish([]);
    changeSearch('');
    if (!isMultiple) requestOpen(false);
  }
  function removeTag(path: CascaderPath) {
    choose(path);
  }
  function blurWithin(event: FocusEvent) {
    const element = root;
    if (!element) return;
    const target = event.relatedTarget;
    if (target instanceof Node && (element.contains(target) || popup?.contains(target))) return;
    queueMicrotask(() => {
      if (root !== element || !element.isConnected) return;
      const current = getPopupActiveElement(element);
      const popupTarget = popup && getPopupActiveElement(popup);
      if (current && element.contains(current)
        || popupTarget && popup?.contains(popupTarget)) return;
      focused = false;
      enterHeld = false;
      field?.onBlur();
      requestOpen(false);
      if (isMultiple) changeSearch('', false);
    });
  }
  let enterHeld = false;
  let clearLock: boolean | null = null;
  let clearLockUntil = 0;
  function handleKeyDown(event: KeyboardEvent) {
    if (blocked || event.isComposing || event.defaultPrevented) return;
    const key = event.key;
    const now = root?.ownerDocument.defaultView?.performance.now() ?? 0;
    const clearLocked = now < clearLockUntil ? clearLock : null;
    if (search || clearLocked === null) clearLock = Boolean(search);
    clearLockUntil = now + 250;
    if (key === 'Escape' && visible) {
      event.preventDefault();
      event.stopPropagation();
      requestOpen(false);
    } else if (key === 'Backspace' && !panel && isMultiple && !search && !clearLocked) {
      const last = display.findLast(item => !item.disabled);
      if (last) choose(last.path);
    }
    if (key === 'Enter' || key === ' ' && !canSearch) {
      event.preventDefault();
      if (!visible) requestOpen(true);
      else if ((key === 'Enter' || panel) && !enterHeld) {
        const row = search ? rows.find(row => row.key === searchKey)
          : columns.flat().find(row => row.key === cascaderPathKey(active));
        if (row) selectRow(row, true);
      }
      if (key === 'Enter') enterHeld = true;
    } else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Backspace'].includes(key)) {
      const editingSearch = Boolean(search) && (key === 'ArrowLeft' || key === 'ArrowRight');
      if (key !== 'Backspace' && !editingSearch) event.preventDefault();
      if (!visible && key !== 'Backspace' && !editingSearch) requestOpen(true);
      else if (visible) {
        const next = navigateCascader(columns, active, key, rtl, search ? searchKey : undefined);
        if (next.path) activatePath(next.path);
        if (next.searchKey !== undefined) activatePath([next.searchKey]);
        if (next.close) requestOpen(false);
      }
    }
    onkeydown?.(event);
  }
  function handleKeyUp(event: KeyboardEvent) {
    if (event.key === 'Enter') enterHeld = false;
    onkeyup?.(event);
  }
  function tagText(item: typeof display[number]) {
    return item.text === undefined ? undefined : getSelectTagText(item.text, maxTagTextLength);
  }
  export function focus(options?: FocusOptions) {
    const target = editor ?? root?.querySelector<HTMLElement>(
      'button,a[href],input,[tabindex="0"]'
    );
    target?.focus(options);
  }
  export function blur() {
    const target = root && getPopupActiveElement(root);
    if (target instanceof HTMLElement && root?.contains(target)) target.blur();
  }
</script>

<style>
  [data-ant-path-choice-control] { display:inline-flex;align-items:center;position:relative;max-width:100%; }
  [data-ant-path-choice-control]:focus-within { outline:2px solid var(--ant-color-primary);outline-offset:2px; }
  [data-ant-path-choice-control][data-ant-path-choice-source-theme] { align-items:flex-start;max-width:none; }
  [data-ant-path-choice-control][data-ant-path-choice-source-theme]:focus-within { outline:0;outline-offset:0; }
  [data-ant-path-choice-content] { min-width:0;position:relative; }
  [data-ant-path-choice-single] [data-ant-path-choice-content] { overflow:hidden;white-space:nowrap;min-height:1lh; }
  [data-ant-path-choice-single] { min-height:var(--ant-native-path-choice-height); }
  [data-ant-path-choice-single] .selected-label { overflow:hidden;text-overflow:ellipsis; }
  [data-ant-path-choice-single] [data-ant-path-choice-input] { position:absolute;inset:0;width:100%;height:100%; }
  [data-ant-path-choice-control] [data-ant-path-choice-input] { min-width:0;padding:0;border:0;outline:0;background:transparent;color:var(--ant-native-path-choice-color);font:inherit;line-height:inherit;cursor:inherit; }
  [data-ant-path-choice-control][data-ant-path-choice-single][data-ant-path-choice-open] [data-ant-path-choice-content-has-search-value] > .overflow-item { opacity:1; }
  [data-ant-path-choice-input]::placeholder { color:var(--ant-color-text-placeholder); }
  [data-ant-path-choice-multiple] { height:auto;min-height:var(--ant-native-path-choice-height); }
  [data-ant-path-choice-multiple] [data-ant-path-choice-content] { gap:0; }
  /* Native width с px перекрывает unitless формулу Select и при поздней вставке prefix CSS. */
  [data-ant-path-choice-control][data-ant-path-choice-multiple] [data-ant-path-choice-input] { position:relative;inset:auto;flex:0 1 auto;width:var(--select-input-width,4px);min-width:4px;max-width:100%;height:auto; }
  [data-ant-path-choice-source-theme][data-ant-path-choice-multiple] [data-ant-path-choice-input] { line-height:calc(var(--ant-select-internal_fixed_item_margin) * 2 + var(--ant-native-path-choice-multi-item-height)); }
  [data-ant-path-choice-selection-item] { flex:none;box-sizing:border-box;max-width:100%;min-width:0; }
  [data-ant-path-choice-source-theme] [data-ant-path-choice-selection-item] { flex:1;max-width:none; }
  /* Обёртки сохраняют DOM при смене темы; source overflow измеряет каждый tag отдельно. */
  .overflow-item { display:contents; }
  [data-ant-path-choice-source-theme][data-ant-path-choice-multiple] .overflow-item { display:block; }
  [data-ant-path-choice-selection-item-remove],.clear { padding:0;border:0;background:transparent;cursor:pointer;flex:none; }
  .clear { margin-inline-end:4px;color:var(--ant-color-text-tertiary);display:flex; }
  .suffix { display:flex;flex:none;color:var(--ant-color-text-quaternary);pointer-events:none; }
  [data-ant-path-choice-source-theme] .clear { margin-inline-end:0;display:inline-block;color:var(--ant-color-text-quaternary); }
  [data-ant-path-choice-source-theme] .clear:hover { color:var(--ant-color-icon); }
  [data-ant-path-choice-source-theme]:has(.clear):hover .suffix,[data-ant-path-choice-source-theme]:has(.clear:focus-visible) .suffix { opacity:0; }
  .prefix { display:flex;flex:none;margin-inline-end:var(--ant-padding-xs); }
  [data-ant-path-choice-selection-item-disabled] { color:var(--ant-select-multiple-item-color-disabled); }
  [data-ant-path-choice-source-theme] [data-ant-path-choice-selection-item-disabled] { color:inherit; }
  [data-ant-path-choice-selection-item-remove]:focus-visible,.clear:focus-visible { outline:2px solid var(--ant-color-primary); }
  .clear:focus-visible { opacity:1; }
  .measure-tag { position:absolute;inset-block-start:0;inset-inline-start:0;visibility:hidden;pointer-events:none; }
  .placeholder { position:absolute;inset-inline-start:0;pointer-events:none;color:var(--ant-color-text-placeholder); }
  .popup { position:fixed;margin:0;border:0;overflow:auto; }
  [data-ant-path-choice-panel] { color:var(--ant-color-text);background:var(--ant-color-bg-container); }
  [data-ant-path-choice-panel][data-ant-path-choice-source-theme] { color:inherit;background:transparent; }
  /* Upstream оставляет line box вокруг expand/loading icon, включая его высоту. */
  [data-ant-path-choice-source-theme] :global([data-ant-cascader-expand-icon]),[data-ant-path-choice-source-theme] :global([data-ant-cascader-loading-icon]) { display:block; }
  .custom-trigger { width:auto; }
  @media (hover:none) {
    [data-ant-path-choice-source-theme]:has(.clear) .suffix { opacity:0; }
  }
</style>

{#snippet content(value: CascaderContent | undefined)}
  {#if typeof value === 'function'}{@render value()}
  {:else if typeof value !== 'boolean'}{value ?? ''}{/if}
{/snippet}
{#snippet displayLabel(item: typeof display[number], truncate = false)}
  {#if displayRender}{@render displayRender(item.labels, item.options)}
  {:else if item.text !== undefined}{truncate ? tagText(item) : item.text}
  {:else}{#each item.shown as label, index}{#if index > 0}{' / '}{/if}{@render content(label)}{/each}{/if}
{/snippet}
{#snippet empty()}
  {#snippet nativeEmpty()}<Empty image="simple" />{/snippet}
  <RenderEmpty componentName="Cascader" local={notFoundContent} fallback={nativeEmpty} />
{/snippet}
{#snippet menus()}
  <CascaderColumns prefixCls={cascaderPrefix} {columns} {active} {search} searchRender={searchConfig.render}
    {fields} checked={checks.checked} half={checks.half} loading={loadingKeys}
    multiple={isMultiple} disabled={blocked} hover={expandTrigger === 'hover'} {rtl}
    expandIcon={expand} loadingIcon={loadingNode} {optionRender} id={listId}
    label={attributes['aria-label'] ?? (typeof placeholder === 'string' ? placeholder
      : config.locale.searchText)}
    classes={classes.popup} styles={css.popup}
    {panel} {empty}
    onActivate={activate} onSelect={selectRow}
    onClose={changeOnSelect ? () => requestOpen(false) : undefined}
    onKeyDown={handleKeyDown} onKeyUp={handleKeyUp} onScroll={onPopupScroll} />
{/snippet}

{#if selectPrefixCss}<ThemeScopeStyle css={selectPrefixCss} scope={`cascader-control-prefix:${selectPrefix}:${rootPrefix}`} />{/if}{#if cascaderPrefixCss}<ThemeScopeStyle css={cascaderPrefixCss} scope={`cascader-prefix:${cascaderPrefix}:${selectPrefix}:${rootPrefix}`} />{/if}{#if panel}
  <div data-ant-cascader-prefix={cascaderPrefix} data-ant-cascader-select-prefix={selectPrefix} data-ant-cascader-root-prefix={rootPrefix} data-ant-path-choice-panel
    data-ant-path-choice-source-theme={Boolean(cascaderTheme.className) || undefined} {...attributes} bind:this={root} id={controlId} dir={resolvedDirection}
    class={[`${cascaderPrefix}-panel ant-cascader-css-var`, !options.length && `${cascaderPrefix}-panel-empty`,
      cascaderTheme.className, cascaderTheme.className && `${cascaderPrefix}-source-theme`,
      className, rootClassName]}
    style={[componentStyle, style].filter(Boolean).join(';') || undefined}>
    {@render menus()}
  </div>
{:else}
  <div data-ant-cascader-prefix={cascaderPrefix} data-ant-cascader-select-prefix={selectPrefix} data-ant-cascader-root-prefix={rootPrefix} data-ant-select-prefix={selectPrefix} data-ant-select-root-prefix={rootPrefix} data-ant-path-choice-control
    data-ant-path-choice-source-theme={Boolean(cascaderTheme.className) || undefined}
    data-ant-path-choice-single={!children && !isMultiple || undefined}
    data-ant-path-choice-multiple={!children && isMultiple || undefined}
    data-ant-path-choice-open={!children && visible || undefined}
    style:--ant-native-path-choice-height={`var(--${privateNamespace}-select-height)`}
    style:--ant-native-path-choice-color={`var(--${privateNamespace}-select-color)`}
    style:--ant-native-path-choice-multi-item-height={`var(--${privateNamespace}-select-multi-item-height)`}
    {...rootAttributes} bind:this={root} role="presentation" dir={resolvedDirection}
    class={[
      `${cascaderPrefix} ant-cascader-css-var`,
      cascaderTheme.className,
      cascaderTheme.className && `${cascaderPrefix}-source-theme`,
      !children && `${selectPrefix} ant-select-css-var`,
      !children && (suffix !== null && suffix !== false || feedback.hasFeedback) && `${selectPrefix}-show-arrow`,
      !children && feedback.hasFeedback && `${selectPrefix}-has-feedback`,
      !children && feedback.isFormItemInput && `${selectPrefix}-in-form-item`,
      !children && canSearch && `${selectPrefix}-show-search`,
      !children && hasClear && `${selectPrefix}-allow-clear`,
      !children && loading && `${selectPrefix}-loading`,
      children && 'custom-trigger',
      !children && `${selectPrefix}-${resolvedVariant}`,
      !children && (isMultiple ? `${selectPrefix}-multiple` : `${selectPrefix}-single`),
      !children && visible && `${selectPrefix}-open`,
      !children && focused && `${selectPrefix}-focused`,
      !children && blocked && `${selectPrefix}-disabled`,
      !children && resolvedSize === 'small' && `${selectPrefix}-sm`,
      !children && resolvedSize === 'large' && `${selectPrefix}-lg`,
      !children && resolvedStatus && `${selectPrefix}-status-${resolvedStatus}`,
      rtl && `${selectPrefix}-rtl`,
      compactClasses(selectPrefix, resolvedDirection, compact),
      context?.class, className, rootClassName, classes.root
    ]} style={[componentStyle, css.root, style].filter(Boolean).join(';')}
    onmousedown={event => {
      onmousedown?.(event);
      if (event.defaultPrevented || blocked || children) return;
      if (event.target instanceof Element && !event.target.closest('button,input')) {
        event.preventDefault();
        focus();
      }
    }} onclick={event => {
      onclick?.(event);
      if (event.defaultPrevented || blocked || children) return;
      if (event.target instanceof Element && !event.target.closest('button')) {
        const keepOpen = visible && (!isMultiple && canSearch
          || isMultiple && event.target === editor);
        if (!keepOpen) requestOpen(!visible);
      }
    }} onfocusin={event => {
      onfocusin?.(event);
      if (!blocked) focused = true;
    }} onfocusout={event => {
      onfocusout?.(event);
      blurWithin(event);
    }}>
    {#if children}
      {@render children({
        open: visible, disabled: blocked, onClick: () => requestOpen(!visible),
        onKeyDown: handleKeyDown, onKeyUp: handleKeyUp,
        'aria-expanded': visible, 'aria-controls': listId
      })}
    {:else}
      {#if prefix != null}<span class={[`prefix ${selectPrefix}-prefix`, classes.prefix]}
        style={css.prefix}>{@render content(prefix)}</span>{/if}
      <div bind:this={contentElement} data-ant-path-choice-content
        data-ant-path-choice-content-has-search-value={Boolean(search) || undefined} class={[
        `${selectPrefix}-content`, display.length && `${selectPrefix}-content-has-value`,
        search && `${selectPrefix}-content-has-search-value`, classes.content
      ]} style={css.content}>
        {#if isMultiple}
          {#each display as item, index (item.key)}
            {@const hidden = index >= tagCount}
            {#snippet label()}{@render displayLabel(item, true)}{/snippet}
            <div class={['overflow-item', cascaderTheme.className && `${selectPrefix}-content-item`]}>
              <span data-cascader-tag data-ant-path-choice-selection-item={!tagRender || undefined}
                data-ant-path-choice-selection-item-disabled={blocked || item.disabled || undefined}
                class={[
                'tag', !tagRender && `${selectPrefix}-selection-item`, hidden && 'measure-tag',
                (blocked || item.disabled) && `${selectPrefix}-selection-item-disabled`, classes.item
              ]} style={css.item} title={item.text} aria-hidden={hidden || undefined} inert={hidden}
                role="presentation" onmousedown={event => {
                  if (!tagRender || blocked) return;
                  event.preventDefault();
                  event.stopPropagation();
                  requestOpen(!visible);
                }} onclick={event => { if (tagRender) event.stopPropagation(); }}>
                {#if tagRender}
                  {@render tagRender({
                    label, value: item.key, disabled: item.disabled, closable: !blocked && !item.disabled,
                    index, isMaxTag: false, onClose: event => {
                      event?.stopPropagation();
                      if (!blocked && !item.disabled) removeTag(item.path);
                    }
                  })}
                {:else}
                  <span class={[`${selectPrefix}-selection-item-content`, classes.itemContent]}
                    style={css.itemContent}>{@render label()}</span>
                  {#if !blocked && !item.disabled}
                    <button type="button" data-ant-path-choice-selection-item-remove
                      class={[`${selectPrefix}-selection-item-remove`, classes.itemRemove]}
                      style={css.itemRemove} tabindex="-1"
                      aria-label={`${config.locale.removeText ?? 'Remove'} ${item.text ?? item.key}`}
                      onmousedown={event => event.preventDefault()}
                      onclick={event => { event.stopPropagation(); removeTag(item.path); }}>
                      {#if remove === undefined}<Icon name="close" />
                      {:else}{@render content(remove)}{/if}
                    </button>
                  {/if}
                {/if}
              </span>
            </div>
          {/each}
          {#if display.length && (omitted.length || maxTagCount === 'responsive')}
            <div class={['overflow-item', cascaderTheme.className && `${selectPrefix}-content-item`]}>
              <span data-cascader-rest data-ant-path-choice-selection-item={!tagRender || undefined}
                class={[
                `${selectPrefix}-selection-overflow-item-rest`,
                !tagRender && `${selectPrefix}-selection-item`,
                !omitted.length && 'measure-tag', classes.item
              ]} style={css.item} aria-hidden={!omitted.length || undefined} inert={!omitted.length}
                role="presentation" onmousedown={event => {
                  if (!tagRender || blocked) return;
                  event.preventDefault();
                  event.stopPropagation();
                  requestOpen(!visible);
                }} onclick={event => { if (tagRender) event.stopPropagation(); }}>
                {#snippet restLabel()}
                  {#if typeof maxTagPlaceholder === 'function'}
                    {@render (maxTagPlaceholder as Snippet<[CascaderOmittedTag<OptionType>[]]>)(
                      omitted.map(item => ({
                        label: item.text ?? item.shown[0], labels: item.labels, options: item.options,
                        value: item.key, disabled: item.disabled
                      }))
                    )}
                  {:else if maxTagPlaceholder !== undefined}{@render content(maxTagPlaceholder)}
                  {:else}+ {omitted.length} ...{/if}
                {/snippet}
                {#if tagRender}
                  {@render tagRender({ label: restLabel, disabled: false, closable: false, isMaxTag: true })}
                {:else}
                  <span class={[`${selectPrefix}-selection-item-content`, classes.itemContent]}
                    style={css.itemContent}>{@render restLabel()}</span>
                {/if}
              </span>
            </div>
          {/if}
        {:else if display[0] && !search}
          <span class={['selected-label', classes.item]} style={css.item} title={display[0].text}>
            {@render displayLabel(display[0])}
          </span>
        {/if}
        {#if !display.length && !search}
          <span class={[`placeholder ${selectPrefix}-placeholder`, classes.placeholder]}
            style={css.placeholder}>{@render content(placeholder)}</span>
        {/if}
        <div class={['overflow-item', cascaderTheme.className && isMultiple
          && `${selectPrefix}-content-item ${selectPrefix}-content-item-suffix`]}>
          <input bind:this={editor} id={controlId} type="text" role={attributes.role ?? 'combobox'}
            data-ant-path-choice-input class={[`${selectPrefix}-input`, classes.input]} style={css.input}
            aria-haspopup="menu" aria-controls={visible ? listId : undefined}
            aria-expanded={visible} aria-activedescendant={visible ? activeId : undefined}
            aria-autocomplete={canSearch ? 'list' : 'none'}
            aria-label={attributes['aria-label']} aria-labelledby={attributes['aria-labelledby']}
            aria-describedby={[attributes['aria-describedby'], field?.describedBy].filter(Boolean).join(' ') || undefined}
            aria-required={attributes['aria-required'] ?? field?.required}
            aria-invalid={field?.invalid || resolvedStatus === 'error' || attributes['aria-invalid'] || undefined}
            aria-busy={loading || undefined} autocomplete="off" disabled={blocked} readonly={!canSearch}
            {...{ autofocus: autoFocus || attributes.autofocus }}
            tabindex={tabIndex ?? attributes.tabindex} inputmode={attributes.inputmode} value={inputValue}
            oninput={event => handleSearch(event.currentTarget.value)}
            oncompositionend={event => handleSearch(event.currentTarget.value)}
            onkeydown={event => { onInputKeyDown?.(event); handleKeyDown(event); }} onkeyup={handleKeyUp}
            onfocus={event => {
              if (blocked) return;
              if (showAction.includes('focus')) requestOpen(true);
              onfocus?.(event);
            }}
            onblur={event => {
              enterHeld = false;
              if (isMultiple) changeSearch('', false);
              if (!blocked) onblur?.(event);
            }} />
        </div>
      </div>
      {#if hasClear}<button type="button" class={`clear ${selectPrefix}-clear`}
        aria-label={config.locale.clearText} onmousedown={event => event.preventDefault()}
        onclick={event => { event.stopPropagation(); clear(); }}>
        {#if clearIcon === undefined}<Icon name="close-circle-filled" />
        {:else}{@render content(clearIcon)}{/if}
      </button>{/if}
      {#if suffix !== null && suffix !== false || feedback.hasFeedback}
        <span class={[`suffix ${selectPrefix}-suffix`, classes.suffix]} style={css.suffix} aria-hidden="true">
          {#if suffix !== undefined}{@render content(suffix)}{:else}<Icon name={loading ? 'loading' : visible && canSearch ? 'search' : 'down'} />{/if}{#if feedback.hasFeedback && feedback.icon}<FormFeedbackIcon descriptor={feedback.icon} />{/if}
        </span>
      {/if}
    {/if}
  </div>
  <NoCompactStyle>
    {#if mounted}
      <!-- SSR получает переменные сразу; attachment обновляет их, сохраняя left/top контроллера. -->
      <div data-ant-cascader-prefix={cascaderPrefix} data-ant-cascader-select-prefix={selectPrefix} data-ant-cascader-root-prefix={rootPrefix} data-ant-select-prefix={selectPrefix} data-ant-select-root-prefix={rootPrefix}
        data-ant-path-choice-source-theme={Boolean(cascaderTheme.className) || undefined}
        bind:this={popup} popover="manual" hidden={!visible || !shown}
        class={[
          `popup ${selectPrefix}-dropdown ant-select-css-var ${cascaderPrefix}-dropdown ant-cascader-css-var`,
          cascaderTheme.className,
          cascaderTheme.className && `${cascaderPrefix}-source-theme`,
          rtl && `${cascaderPrefix}-dropdown-rtl`,
          rootClassName, classes.popup.root
        ]} dir={resolvedDirection}
        style={[untrack(() => componentStyle), popupStyle].filter(Boolean).join(';')}
        {@attach node => connectComponentTheme(node,
          [componentStyle, popupStyle].filter(Boolean).join(';'))}
        {@attach portal}
        onfocusout={blurWithin}>
        {#if popupRender}<CascaderPopupContent {popupRender} menu={menus} />
        {:else}{@render menus()}{/if}
      </div>
    {/if}
  </NoCompactStyle>
{/if}
