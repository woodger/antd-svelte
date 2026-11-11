<script lang="ts" generics="Value extends string | number = string, Mode extends 'multiple' | 'tags' | undefined = undefined">
  import { onMount, tick, untrack, type Snippet } from 'svelte';
  import { useConfig } from './config-context';
  import ThemeScopeStyle from './ThemeScopeStyle.svelte';
  import { getSelectPrefixCss } from './select-prefix.engine';
  import { useVariant } from './variant.svelte';
  import RenderEmpty from './RenderEmpty.svelte';
  import { useComponentTheme } from './theme-component.svelte';
  import { connectComponentTheme } from './theme-component.dom';
  import { connectPopup } from './popup.dom';
  import { createPopupContainer } from './popup-container.model.svelte.js';
  import { useCompact } from './space-compact-context';
  import { compactClasses } from './space-compact.engine';
  import { useFormField } from './form-context';
  import { useFormItemStatusContext } from './form-item-status';
  import { useFormFeedback } from './form-feedback-context';
  import FormFeedbackIcon from './FormFeedbackIcon.svelte';
  import {
    filterOptions,
    getEnabledIndex,
    getSelectLimitOptions,
    getSelectValues,
    isSelectCountReached,
    resolveSelectedOptions,
    sortSelectOptions
  } from './select.engine';
  import { ruRU, type SelectOption } from './types';
  import type {
    SelectProps,
    SelectFlattenOption,
    SelectSearchConfig,
    SelectTagPlaceholder,
    SelectTagInfo
  } from './select.types';
  import { getSelectTagOptions } from './select-tags.engine';
  import { getSelectTagText } from './select-tag-text.engine';
  import { getSelectTagOverflow } from './select-tag-overflow.engine';
  import { connectSelectTagOverflow, measureSelectInput } from './select-tag-overflow.dom';
  import { resolveSelectTokenOptions, splitSelectTokens } from './select-token.engine';
  import Icon from './Icon.svelte';

  type RawValue = Value | string;

  let {
    _autoWidth = false,
    prefixCls,
    options = [],
    optionRender,
    mode,
    open = $bindable<boolean | undefined>(),
    open: providedOpen,
    defaultOpen,
    tokenSeparators,
    maxCount,
    maxTagTextLength,
    maxTagCount,
    maxTagPlaceholder,
    tagRender,
    defaultValue,
    value = $bindable<SelectProps<Value, Mode>['value']>(),
    size,
    variant,
    showSearch,
    loading = false,
    notFoundContent,
    onPopupScroll,
    getPopupContainer,
    allowClear = false,
    status,
    disabled,
    id,
    name,
    placeholder,
    onValueChange,
    onOpenChange,
    onkeydown,
    onbeforeinput,
    onpaste,
    oncompositionstart,
    oncompositionend,
    onfocus,
    onblur,
    onclick,
    style,
    class: className = '',
    ...attributes
  }: SelectProps<Value, Mode> = $props();

  const config = useConfig();
  let prefix = $derived(config.getPrefixCls('select', prefixCls));
  let rootPrefix = $derived(config.getPrefixCls());
  let privateNamespace = $derived(rootPrefix.replaceAll('.', ''));
  let prefixCss = $derived(getSelectPrefixCss(prefix, rootPrefix));
  const variantContext = useVariant('select', () => ({ variant }));
  const componentTheme = useComponentTheme('Select');
  const compact = useCompact();
  const controlRef = {
    get nativeElement() {
      return container;
    },
    focus: () => control?.focus(),
    blur: () => control?.blur()
  };
  const field = useFormField(() => controlRef);
  const itemStatus = useFormItemStatusContext();
  const feedback = useFormFeedback();
  let appearance = $derived(variantContext.variant);
  const generatedId = $props.id();
  const initialDefault = untrack(
    () => Array.isArray(defaultValue) ? [...defaultValue] : defaultValue
  );
  let useDefault = $state(true);
  let internalOpen = $state(untrack(() => defaultOpen ?? false));
  let isOpen = $derived(providedOpen ?? internalOpen);
  let previousOwnerOpen = untrack(() => providedOpen);
  let hydrated = $state(false);
  let focused = $state(false);
  let internalSearch = $state('');
  let searchConfig = $derived<SelectSearchConfig<RawValue>>(
    { ...(typeof showSearch === 'object' ? showSearch : {}) } as SelectSearchConfig<RawValue>
  );
  let controlledSearch = $derived(searchConfig.searchValue);
  let search = $derived(controlledSearch ?? internalSearch);
  let searchCallback = $derived(searchConfig.onSearch);
  let filter = $derived(searchConfig.filterOption ?? true);
  let autoClearSearch = $derived(searchConfig.autoClearSearchValue ?? true);
  let cachedOptions = $state.raw<ReadonlyMap<RawValue, SelectOption<RawValue>>>(new Map());
  let activeValue = $state<RawValue>();
  let container: HTMLDivElement;
  let reference = $state<HTMLDivElement>();
  let control = $state<HTMLInputElement>();
  let list = $state<HTMLDivElement>();
  let contentElement = $state<HTMLDivElement>();
  let responsiveCount = $state(Number.POSITIVE_INFINITY);
  const tagElements = new Map<RawValue, HTMLElement>();
  let shown = $state(false);
  let typeahead = '';
  let lastTyped = 0;
  let composing = false;
  let pastedText: string | undefined;
  let controlId = $derived(id ?? field?.id ?? `ant-select-${generatedId}`);
  let selectedValue = $derived(value ?? (useDefault ? initialDefault : undefined));
  let tagMode = $derived(mode === 'tags');
  let multiple = $derived(mode === 'multiple' || tagMode);
  let canSearch = $derived(typeof showSearch === 'object' ? true : showSearch ?? multiple);
  // Readonly исключает input из нативной проверки; required multiple блокирует ввод через beforeinput.
  let isReadOnly = $derived(!canSearch && (!multiple || !attributes.required));
  let intrinsicWidth = $derived(_autoWidth && !multiple && isReadOnly);
  let selectedValues = $derived(multiple ? getSelectValues<RawValue>(selectedValue) : []);
  let selectedKeys = $derived(new Set(selectedValues));
  let countReached = $derived(multiple && isSelectCountReached(selectedValues.length, maxCount));
  let optionMap = $derived<Map<RawValue, SelectOption<RawValue>>>(
    new Map(options.map((option) => [option.value, option]))
  );
  let selectionOptions = $derived(
    resolveSelectedOptions(
      multiple
        ? selectedValues
        : typeof selectedValue === 'string' || typeof selectedValue === 'number'
          ? [selectedValue as RawValue]
          : [],
      optionMap,
      cachedOptions
    )
  );
  let selected = $derived(
    typeof selectedValue === 'string' || typeof selectedValue === 'number'
      ? selectionOptions.get(selectedValue as RawValue)
      : undefined
  );
  let tags = $derived(selectedValues.map(item => selectionOptions.get(item)!));
  let responsiveTags = $derived(multiple && maxTagCount === 'responsive');
  let tagOverflow = $derived(getSelectTagOverflow(tags,
    responsiveTags ? responsiveCount : typeof maxTagCount === 'number' ? maxTagCount : undefined));
  let renderedTags = $derived(responsiveTags ? tags : tagOverflow.visible);
  let visibleTagKeys = $derived(new Set(tagOverflow.visible.map(tag => tag.value)));
  let tagPlaceholder = $derived(maxTagPlaceholder as SelectTagPlaceholder<RawValue> | undefined);
  let renderTag = $derived(tagRender as Snippet<[SelectTagInfo<RawValue>]> | undefined);
  let tagPlaceholderTitle = $derived(tagPlaceholder == null
    ? `+ ${tagOverflow.omitted.length} ...`
    : typeof tagPlaceholder === 'string' || typeof tagPlaceholder === 'number'
      ? String(tagPlaceholder) : undefined);
  let filteredOptions = $derived(tagMode
    ? getSelectTagOptions(options, selectionOptions, search, filter, searchConfig.optionFilterProp)
    : filterOptions<RawValue>(options, search, filter, searchConfig.optionFilterProp));
  let orderedOptions = $derived(sortSelectOptions(filteredOptions, search, searchConfig.filterSort));
  let filtered = $derived(getSelectLimitOptions(
    orderedOptions, selectedKeys, multiple ? maxCount : undefined
  ));
  let renderOption = $derived(optionRender as Snippet<[
    SelectFlattenOption<RawValue>, { index: number }
  ]> | undefined);

  function getRenderOption(index: number): SelectFlattenOption<RawValue> {
    const data = orderedOptions[index];
    return {
      key: data.key ?? data.value,
      value: data.value,
      label: data.label,
      data: data as SelectFlattenOption<RawValue>['data'],
      groupOption: false
    };
  }
  $effect(() => {
    cachedOptions = selectionOptions;
  });
  $effect.pre(() => {
    const visible = new Set(tagOverflow.visible.map(tag => tag.value));
    const input = control;
    const active = input?.ownerDocument.activeElement;
    if (!input || !active || ![...tagElements].some(([value, node]) =>
      !visible.has(value) && node.contains(active))) return;

    // Скрытый native remove button передаёт фокус input, не отменяя новый выбор владельца.
    void tick().then(() => {
      if (!input.isConnected || active.isConnected && !active.closest('[inert]')) return;
      const doc = input.ownerDocument;
      if (!doc.activeElement || doc.activeElement === active || doc.activeElement === doc.body
        || doc.activeElement === doc.documentElement) input.focus();
    });
  });
  $effect(() => {
    if (!control || !responsiveTags) return;
    void search;
    const input = control;
    const previous = input.style.width;
    input.style.width = `${measureSelectInput(input)}px`;
    return () => { input.style.width = previous; };
  });
  $effect(() => {
    if (!contentElement || !responsiveTags) return;
    void tags;
    void maxTagTextLength;
    void tagPlaceholder;
    void renderTag;
    void search;
    const host = contentElement;
    let disposed = false;
    let disconnect: (() => void) | undefined;
    void tick().then(() => {
      if (!disposed) disconnect = connectSelectTagOverflow(host,
        count => { responsiveCount = count; });
    });
    return () => {
      disposed = true;
      disconnect?.();
    };
  });
  let activeIndex = $derived.by(() => {
    const index = filtered.findIndex(
      (option) => option.value === activeValue && !option.disabled
    );

    return index < 0 ? getEnabledIndex(filtered, -1, 'first') : index;
  });
  let resolvedDisabled = $derived(disabled ?? field?.disabled ?? config.componentDisabled);
  let resolvedStatus = $derived(status ?? ('status' in itemStatus ? itemStatus.status : field?.status));
  let resolvedSize = $derived(size ?? compact?.size ?? config.componentSize);
  let compactItemClasses = $derived(compactClasses(prefix, config.direction, compact));
  // Число 0 остаётся содержимым; null/empty string скрывают пустой список.
  let hiddenEmpty = $derived(filtered.length === 0
    && (notFoundContent === null || notFoundContent === false || notFoundContent === ''));
  let expanded = $derived(hydrated && isOpen && !resolvedDisabled && !hiddenEmpty);

  function initialActiveValue() {
    return !multiple && selected && !selected.disabled
      ? selected.value : filtered[getEnabledIndex(filtered, -1, 'first')]?.value;
  }

  onMount(() => {
    if (isOpen) activeValue = initialActiveValue();
    hydrated = true;
    if (providedOpen === undefined) open = internalOpen;
  });

  $effect.pre(() => {
    const next = providedOpen;
    if (!Object.is(next, previousOwnerOpen)) {
      previousOwnerOpen = next;
      if (next) activeValue = initialActiveValue();
      internalOpen = next ?? false;
      if (!next && !multiple) internalSearch = '';
    }
    if (resolvedDisabled) {
      internalOpen = false;
      focused = false;
    }
  });
  let popupContainerGetter = $derived(getPopupContainer || config.getPopupContainer);
  const portal = createPopupContainer(() => ({
    open: expanded,
    rendered: expanded,
    reference,
    getPopupContainer: popupContainerGetter,
    themeStyle: componentTheme.style
  }));

  $effect(() => {
    if (!expanded || !list || !reference || !popupContainerGetter) return;

    const popup = list;
    const anchor = reference;
    const disconnect = connectPopup(popup, anchor, {
      placement: 'bottom',
      gap: 4,
      align: config.direction === 'rtl' ? 'right' : 'left',
      autoAdjustOverflow: true,
      maxWidth: '100vw',
      applyPosition: position => {
        popup.style.width = `${anchor.getBoundingClientRect().width}px`;
        popup.style.left = `${position.left}px`;
        popup.style.top = `${position.top}px`;
      },
      onPlacement: () => {},
      onVisibilityChange: next => { shown = next; },
      onDismiss: () => setOpen(false)
    });

    return () => {
      disconnect();
      popup.removeAttribute('hidden');
      for (const property of ['width', 'left', 'top', 'max-width'])
        popup.style.removeProperty(property);
    };
  });

  $effect(() => {
    if (!control || !multiple) return;

    const input = control;
    input.setCustomValidity(
      attributes.required && !selectedValues.length
        ? config.locale.selectRequiredText ?? ruRU.selectRequiredText
        : ''
    );

    return () => input.setCustomValidity('');
  });

  $effect(() => {
    if (expanded && activeIndex >= 0) {
      list?.querySelector(`#${CSS.escape(`${controlId}-option-${activeIndex}`)}`)
        ?.scrollIntoView({ block: 'nearest' });
    }
  });

  function setOpen(next: boolean) {
    if (next && resolvedDisabled) {
      return;
    }

    const notify = expanded !== next;
    internalOpen = next;
    open = next;
    if (notify) onOpenChange?.(next);
    // Принятый bind/callback сохраняет active, выбранный текущим keyboard event.
    if (providedOpen === next) previousOwnerOpen = next;

    if (!next && !tagMode && (!multiple || autoClearSearch)) {
      internalSearch = '';
    }
  }

  function openList(direction: 'first' | 'last' = 'first') {
    if (!isOpen) {
      if (!tagMode && (!multiple || autoClearSearch)) internalSearch = '';
      activeValue = !multiple && selected && !selected.disabled
        ? selected.value
        : tagMode || searchConfig.filterSort || countReached
          ? filtered[getEnabledIndex(filtered, -1, direction)]?.value
          : options[getEnabledIndex(options, -1, direction)]?.value;
    }

    setOpen(true);
  }

  function changeMultiple(next: RawValue[]) {
    if (!multiple) return;

    useDefault = false;
    // TypeScript не сужает generic Mode при проверке его значения.
    value = [...next] as typeof value;
    (onValueChange as ((values: RawValue[]) => void) | undefined)?.(next);
  }

  function submitTag(text: string) {
    if (!tagMode || resolvedDisabled) return;
    const next = text.trim();
    if (!next) return;
    if (!countReached && !optionMap.get(next)?.disabled && !selectedKeys.has(next)) {
      cachedOptions = new Map(cachedOptions).set(next,
        optionMap.get(next) ?? { value: next, label: next });
      changeMultiple([...selectedValues, next]);
    }
    internalSearch = '';
  }

  function choose(option: SelectOption<RawValue> | undefined) {
    if (resolvedDisabled || option?.disabled
      || option && countReached && !selectedKeys.has(option.value)) {
      return;
    }

    if (option)
      cachedOptions = new Map(cachedOptions).set(option.value, option);

    if (multiple) {
      const next = new Set(selectedValues);
      const clearQuery = tagMode && !option && Boolean(search);
      const onClearSearch = clearQuery ? searchCallback : undefined;

      if (option) {
        if (next.has(option.value))
          next.delete(option.value);
        else next.add(option.value);
      } else {
        if (!next.size && !clearQuery) return;
        next.clear();
      }

      if (option || selectedValues.length) changeMultiple([...next]);
      if (!option || autoClearSearch) internalSearch = '';
      onClearSearch?.('');
      control?.focus();
      return;
    }

    useDefault = false;
    value = option?.value as typeof value;
    (onValueChange as ((value: RawValue | undefined) => void) | undefined)?.(option?.value);
    setOpen(false);
    control?.focus();
  }

  function remove(item: RawValue, focus = true) {
    if (resolvedDisabled || selectionOptions.get(item)?.disabled) return;

    const next = new Set(selectedValues);

    if (next.delete(item))
      changeMultiple([...next]);
    if (focus) control?.focus();
  }

  function handleCustomTagMouseDown(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    setOpen(!expanded);
  }

  function connectTagElement(node: HTMLElement, value: RawValue) {
    tagElements.set(value, node);
    return () => {
      if (tagElements.get(value) === node) tagElements.delete(value);
    };
  }

  function handleReset(event: Event) {
    const input = control;

    if (!multiple || !input || event.target !== input.form) return;

    queueMicrotask(() => {
      if (event.defaultPrevented || !input.isConnected || input !== control || !multiple) return;

      useDefault = false;
      value = getSelectValues(initialDefault) as typeof value;
      internalSearch = '';
      internalOpen = false;
      open = false;
      composing = false;
      pastedText = undefined;
    });
  }

  function handleKeydown(
    event: KeyboardEvent & { currentTarget: EventTarget & HTMLInputElement; }
  ) {
    onkeydown?.(event);

    if (event.defaultPrevented || resolvedDisabled || event.isComposing || composing) {
      return;
    }

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();

      if (!expanded) {
        openList(event.key === 'ArrowUp' ? 'last' : 'first');
      } else {
        activeValue = filtered[getEnabledIndex(
          filtered,
          activeIndex,
          event.key === 'ArrowUp' ? 'previous' : 'next'
        )]?.value;
      }
    } else if ((event.key === 'Home' || event.key === 'End') && expanded) {
      event.preventDefault();
      activeValue = filtered[getEnabledIndex(filtered, -1, event.key === 'Home'
        ? 'first'
        : 'last')]?.value;
    } else if (event.key === 'Enter' || (event.key === ' ' && !canSearch)) {
      event.preventDefault();

      if (!expanded) {
        openList();
        if (tagMode && event.key === 'Enter' && activeIndex >= 0) choose(filtered[activeIndex]);
      } else if (activeIndex >= 0) {
        choose(filtered[activeIndex]);
      }
    } else if (event.key === 'Escape' && expanded) {
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
    } else if (event.key === 'Tab') {
      setOpen(false);
    } else if (multiple
      && event.key === 'Backspace'
      && !search
      && !event.ctrlKey
      && !event.metaKey
      && !event.altKey) {
      event.preventDefault();

      const last = [...tags].reverse().find((tag) => !tag.disabled);

      if (last)
        remove(last.value);
    } else if (!multiple
      && allowClear
      && !canSearch
      && (event.key === 'Backspace'
        || event.key === 'Delete')) {
      event.preventDefault();
      choose(undefined);
    } else if (!canSearch
      && event.key.length === 1
      && !event.ctrlKey
      && !event.metaKey
      && !event.altKey) {
      typeahead = (event.timeStamp - lastTyped > 700 ? '' : typeahead) + event.key;
      lastTyped = event.timeStamp;
      const matches = filterOptions(options, typeahead);

      openList();
      activeValue = matches[getEnabledIndex(matches, -1, 'first')]?.value;
    }
  }

  function handleBeforeInput(
    event: InputEvent & { currentTarget: EventTarget & HTMLInputElement; }
  ) {
    onbeforeinput?.(event);

    if (multiple && !canSearch)
      event.preventDefault();
  }

  function restoreControlledSearch(input: HTMLInputElement) {
    if (controlledSearch === undefined) return;

    void tick().then(() => {
      if (input === control && input.isConnected && (multiple || expanded) && canSearch)
        input.value = search;
    });
  }

  function updateSearch(next: string, input: HTMLInputElement, compositionEnd = false) {
    if (countReached) {
      input.value = search;
      restoreControlledSearch(input);
      return;
    }

    if (multiple && tokenSeparators !== undefined && !composing) {
      const cap = maxCount !== undefined && !Number.isNaN(maxCount)
        ? maxCount - selectedValues.length : undefined;
      const words = splitSelectTokens(next, tokenSeparators, cap);
      if (words !== null) {
        const previousSearch = search;
        const onSearch = searchCallback;
        const additions = resolveSelectTokenOptions<RawValue>(
          options, words, tagMode, searchConfig.optionFilterProp
        );
        const nextValues = new Set(selectedValues);
        const nextOptions = new Map(cachedOptions);
        for (const option of additions) {
          nextValues.add(option.value);
          nextOptions.set(option.value, option);
        }
        cachedOptions = nextOptions;
        if (nextValues.size !== selectedValues.length) changeMultiple([...nextValues]);
        internalSearch = '';
        activeValue = undefined;
        setOpen(false);
        if (previousSearch !== '') onSearch?.('');
        input.value = controlledSearch ?? '';
        restoreControlledSearch(input);
        return;
      }
    }
    if (compositionEnd && next === search) return;

    internalSearch = next;
    searchCallback?.(next);
    const matches = searchConfig.filterSort ? filtered : tagMode
      ? getSelectTagOptions(options, selectionOptions, next, filter, searchConfig.optionFilterProp)
      : filterOptions<RawValue>(options, next, filter, searchConfig.optionFilterProp);
    restoreControlledSearch(input);
    activeValue = matches[getEnabledIndex(matches, -1, 'first')]?.value;
    setOpen(true);
  }

  function handleInput(event: Event & { currentTarget: EventTarget & HTMLInputElement; }) {
    const input = event.currentTarget;
    if (multiple && (!canSearch || resolvedDisabled)) {
      input.value = search;
      pastedText = undefined;
      return;
    }

    let next = input.value;
    if (pastedText && /[\r\n]/.test(pastedText)) {
      const normalized = pastedText.replace(/[\r\n]+$/, '')
        .replace(/\r\n/g, ' ').replace(/[\r\n]/g, ' ');
      next = next.replace(normalized, pastedText);
    }
    pastedText = undefined;
    updateSearch(next, input);
  }

  function handlePaste(event: ClipboardEvent & { currentTarget: EventTarget & HTMLInputElement; }) {
    onpaste?.call(event.currentTarget, event);
    const tokenWithEnter = typeof tokenSeparators === 'function'
      || tokenSeparators?.some(token => token === '\n' || token === '\r\n');
    pastedText = !event.defaultPrevented && multiple && tokenWithEnter
      ? event.clipboardData?.getData('text') : undefined;
  }

  function handleCompositionStart(
    event: CompositionEvent & { currentTarget: EventTarget & HTMLInputElement; }
  ) {
    oncompositionstart?.call(event.currentTarget, event);
    composing = true;
  }

  function handleCompositionEnd(
    event: CompositionEvent & { currentTarget: EventTarget & HTMLInputElement; }
  ) {
    composing = false;
    oncompositionend?.call(event.currentTarget, event);
    if (!event.defaultPrevented && multiple && tokenSeparators !== undefined
      && canSearch && !resolvedDisabled) {
      updateSearch(event.currentTarget.value, event.currentTarget, true);
    }
  }

  function handleClick(event: MouseEvent & { currentTarget: EventTarget & HTMLInputElement; }) {
    onclick?.(event);

    if (!event.defaultPrevented) {
      if (expanded && !canSearch) {
        setOpen(false);
      } else {
        openList();
      }
    }
  }

  function handleBlur(event: FocusEvent & { currentTarget: EventTarget & HTMLInputElement; }) {
    focused = false;
    composing = false;
    pastedText = undefined;
    const next = event.relatedTarget;

    if (!(next instanceof Node && list?.contains(next))) {
      if (tagMode) submitTag(search);
      else if (multiple) internalSearch = '';
      setOpen(false);
    }
    field?.onBlur();
    onblur?.(event);
  }

  function handleListFocusOut(event: FocusEvent) {
    const next = event.relatedTarget;

    if (next instanceof Node && (container.contains(next) || list?.contains(next))) return;

    focused = false;
    if (tagMode) submitTag(search);
    else if (multiple) internalSearch = '';
    setOpen(false);
  }

  function handleFocus(event: FocusEvent & { currentTarget: EventTarget & HTMLInputElement; }) {
    focused = true;
    // Прямой Svelte handler получает native input в this; обёртка сохраняет receiver.
    onfocus?.call(event.currentTarget, event);
  }

  function handlePointerDown(
    event: PointerEvent & { currentTarget: EventTarget & HTMLDivElement; }
  ) {
    const target = event.target;
    if (renderTag && target instanceof Element && target.closest('[data-select-custom-tag]')) return;

    if (multiple
      && target instanceof Element
      && !target.closest('button, input')
      && !resolvedDisabled) {
      event.preventDefault();
      control?.focus();
      openList();
    } else if (target === event.currentTarget && !resolvedDisabled) {
      event.preventDefault();
      control?.focus();
      control?.click();
    }
  }

  function handleOutside(event: PointerEvent) {
    if (popupContainerGetter) return;

    const target = event.composedPath()[0] ?? event.target;

    if (target instanceof Node && !container.contains(target)) {
      setOpen(false);
    }
  }
</script>

<style>
  .container { position: relative; min-width: 0; width: 100%; }
  [data-ant-select-control] { display: flex; align-items: center; width: 100%; }
  [data-ant-select-control]:focus-within { outline: 2px solid var(--ant-color-primary); outline-offset: 2px; }
  [data-ant-select-control][data-ant-select-source-theme] { align-items: flex-start; }
  [data-ant-select-control][data-ant-select-source-theme]:focus-within { outline: 0; outline-offset: 0; }
  [data-ant-select-control][data-ant-select-single] [data-ant-select-input], [data-ant-select-control][data-ant-select-multiple] [data-ant-select-input] {
    position: relative;
    inset: auto;
    width: 100%;
    min-width: 0;
    padding: 0;
    border: 0;
    outline: 0;
    background: transparent;
    color: inherit;
    font: inherit;
    line-height: inherit;
    cursor: inherit;
  }
  [data-ant-select-input]::placeholder { color: var(--ant-color-text-placeholder); }
  .intrinsic-width { width: auto; }
  .intrinsic-width [data-ant-select-content] { position: relative; }
  .intrinsic-width [data-ant-select-control][data-ant-select-single] [data-ant-select-input] { position: absolute; inset: 0; }
  .intrinsic-label { visibility: hidden; white-space: pre; }
  .suffix { display: flex; flex: none; color: var(--ant-color-text-quaternary); pointer-events: none; }
  .clear { display: flex; padding: 0; margin-inline-end: 4px; border: 0; background: none; color: var(--ant-color-text-tertiary); cursor: pointer; }
  .clear:focus-visible { outline: 2px solid var(--ant-color-primary); outline-offset: 2px; }
  .popup[data-ant-select-dropdown] { top: calc(100% + 4px); inset-inline: 0; max-height: 256px; overflow-y: auto; }
  /* Исходный virtual-list размещает options в flex column без сжатия строк. */
  .popup[data-ant-select-source-popup] { display: flex; flex-direction: column; }
  .popup[data-ant-select-dropdown][popover] { position: fixed; inset: auto; margin: 0; }
  .popup[data-ant-select-dropdown][hidden] { display: none; }
  [data-ant-select-source-popup] > [data-ant-select-item] { flex: none; }
  [data-ant-select-source-theme] .clear { display: inline-block; margin-inline-end: 0; color: var(--ant-color-text-quaternary); }
  [data-ant-select-source-theme] .clear:hover { color: var(--ant-color-icon); }
  [data-ant-select-source-theme] .clear:focus-visible { opacity: 1; }
  [data-ant-select-source-theme]:has(.clear):hover .suffix, [data-ant-select-source-theme]:has(.clear:focus-visible) .suffix { opacity: 0; }
  [data-ant-select-item] { width: 100%; border: 0; background: none; font-family: inherit; text-align: start; }
  [data-ant-select-control][data-ant-select-multiple] { height: auto; min-height: var(--ant-native-select-height); }
  [data-ant-select-control][data-ant-select-multiple] [data-ant-select-content] { gap: 0; }
  [data-ant-select-control][data-ant-select-multiple] [data-ant-select-input] { flex: 1 1 60px; width: 60px; min-width: 40px; max-width: 100%; }
  [data-ant-select-control][data-ant-select-responsive-tags] [data-ant-select-input] { flex: none; width: 4px; min-width: 4px; }
  .measure-tag { position: absolute; inset-block-start: 0; inset-inline-start: 0; visibility: hidden; pointer-events: none; }
  .custom-tag { display: inline-flex; flex: none; min-width: 0; max-width: 100%; }
  [data-ant-select-control][data-ant-select-source-theme][data-ant-select-multiple] [data-ant-select-input] { line-height: calc(var(--ant-select-internal_fixed_item_margin) * 2 + var(--ant-native-select-multi-item-height)); }
  [data-ant-select-control][data-ant-select-multiple] [data-ant-select-selection-item] { flex: none; box-sizing: border-box; max-width: calc(100% - var(--ant-select-internal_fixed_item_margin) * 2); min-width: 0; }
  [data-ant-select-selection-item-remove] { flex: none; padding: 0; border: 0; background: transparent; }
  [data-ant-select-selection-item-remove]:focus-visible { outline: 2px solid var(--ant-color-primary); outline-offset: 1px; }
  [data-ant-select-selection-item-disabled] { color: var(--ant-select-multiple-item-color-disabled); }
  [data-ant-select-source-theme] [data-ant-select-selection-item-disabled] { color: inherit; }
  .container[data-ant-select-compact-item] > [data-ant-select-control] { border-radius: inherit; }
  @media (hover: none) {
    [data-ant-select-source-theme]:has(.clear) .suffix { opacity: 0; }
  }
</style>

<svelte:document onpointerdown={handleOutside} onreset={handleReset} />

{#if prefixCss}<ThemeScopeStyle css={prefixCss} scope={`select-prefix:${prefix}:${rootPrefix}`} />{/if}<div data-ant-select-prefix={prefix} data-ant-select-root-prefix={rootPrefix}
  data-ant-select-compact-item={Boolean(compact) || undefined} class={[
    'container ant-select-css-var',
    intrinsicWidth && 'intrinsic-width',
    componentTheme.className,
    compactItemClasses,
    compact && resolvedSize === 'large' && `${prefix}-lg`,
    compact && resolvedSize === 'small' && `${prefix}-sm`,
    compact && expanded && `${prefix}-focused`,
    compact && resolvedDisabled && `${prefix}-disabled`,
    className
  ]} bind:this={container} style={[componentTheme.style, style].filter(Boolean).join(';') || undefined}>
  <div
    bind:this={reference}
    data-ant-select-control data-ant-select-prefix={prefix} data-ant-select-root-prefix={rootPrefix}
    data-ant-select-source-theme={Boolean(componentTheme.className) || undefined}
    data-ant-select-single={!multiple || undefined} data-ant-select-multiple={multiple || undefined}
    data-ant-select-responsive-tags={responsiveTags || undefined}
    style:--ant-native-select-height={`var(--${privateNamespace}-select-height)`}
    style:--ant-native-select-multi-item-height={`var(--${privateNamespace}-select-multi-item-height)`}
    role="presentation"
    onpointerdown={handlePointerDown}
    class={[
        `${prefix} ant-select-css-var`,
        `${prefix}-${appearance}`,
        `${prefix}-show-arrow`,
        feedback.hasFeedback && `${prefix}-has-feedback`,
        feedback.isFormItemInput && `${prefix}-in-form-item`,
        componentTheme.className && `${prefix}-source-theme`,
        componentTheme.className && canSearch && `${prefix}-show-search`,
        componentTheme.className && allowClear && `${prefix}-allow-clear`,
        componentTheme.className && config.direction === 'rtl' && `${prefix}-rtl`,
        loading && `${prefix}-loading`,
        multiple ? `${prefix}-multiple` : `${prefix}-single`,
        responsiveTags && `${prefix}-responsive-tags`,
        expanded && `${prefix}-open`,
        (expanded || componentTheme.className && focused) && `${prefix}-focused`,
        resolvedDisabled && `${prefix}-disabled`,
        resolvedSize === 'large' && `${prefix}-lg`,
        resolvedSize === 'small' && `${prefix}-sm`,
        resolvedStatus && `${prefix}-status-${resolvedStatus}`
      ]}
    style={componentTheme.style}
  >
    <div data-ant-select-content class={`${prefix}-content`} bind:this={contentElement}>
      {#if intrinsicWidth}<span class="intrinsic-label" aria-hidden="true">{selected?.label ?? placeholder ?? ''}</span>{/if}
      {#if multiple}
        {#each renderedTags as tag, index (tag.value)}
          {@const hidden = responsiveTags && !visibleTagKeys.has(tag.value)}
          {#snippet tagLabel()}{getSelectTagText(tag.label, maxTagTextLength)}{/snippet}
          <span data-ant-select-selection-item={!renderTag || undefined}
            data-ant-select-selection-item-disabled={!renderTag && (resolvedDisabled || tag.disabled) || undefined}
            class={[
              renderTag ? 'custom-tag' : `${prefix}-selection-item`,
              hidden && 'measure-tag',
              !renderTag && (resolvedDisabled || tag.disabled) && `${prefix}-selection-item-disabled`
            ]} title={renderTag ? undefined : tag.label} data-select-tag={responsiveTags || undefined}
            data-select-custom-tag={renderTag ? '' : undefined}
            role="presentation" onmousedown={renderTag ? handleCustomTagMouseDown : undefined}
            aria-hidden={hidden || undefined} inert={hidden}
            {@attach node => connectTagElement(node, tag.value)}>
            {#if renderTag}
              {@render renderTag({
                label: tagLabel, value: tag.value, index, disabled: tag.disabled,
                closable: !resolvedDisabled && !tag.disabled, isMaxTag: false,
                onClose: event => {
                  event?.stopPropagation();
                  remove(tag.value, false);
                }
              })}
            {:else}
              <span class={`${prefix}-selection-item-content`}>{@render tagLabel()}</span>
              {#if !resolvedDisabled && !tag.disabled}<button type="button" data-ant-select-selection-item-remove class={`${prefix}-selection-item-remove`} aria-label={`${config.locale.removeText
                ?? ruRU.removeText} ${tag.label}`} onpointerdown={(event) => event.preventDefault()} onclick={() => remove(tag.value)}><Icon name="close" /></button>{/if}
            {/if}
          </span>
        {/each}
        {#if tagOverflow.omitted.length || responsiveTags && tags.length}
          {#snippet restLabel()}
            {#if typeof tagPlaceholder === 'function'}{@render tagPlaceholder(tagOverflow.omitted)}
            {:else if tagPlaceholder == null}+ {tagOverflow.omitted.length} ...
            {:else if typeof tagPlaceholder !== 'boolean'}{tagPlaceholder}{/if}
          {/snippet}
          <span data-ant-select-selection-item={!renderTag || undefined}
            class={[`${prefix}-selection-overflow-item-rest`,
              renderTag ? 'custom-tag' : `${prefix}-selection-item`,
              !tagOverflow.omitted.length && 'measure-tag']}
            title={renderTag ? undefined : tagPlaceholderTitle}
            data-select-rest={responsiveTags || undefined}
            data-select-custom-tag={renderTag ? '' : undefined}
            role="presentation" onmousedown={renderTag ? handleCustomTagMouseDown : undefined}
            aria-hidden={!tagOverflow.omitted.length || undefined} inert={!tagOverflow.omitted.length}>
            {#if renderTag}{@render renderTag({
              label: restLabel, isMaxTag: true, disabled: false, closable: false
            })}{:else}<span class={`${prefix}-selection-item-content`}>{@render restLabel()}</span>{/if}
          </span>
        {/if}
      {/if}
      <input
        {...attributes}
        bind:this={control}
        id={controlId}
        data-ant-select-input class={`${prefix}-input`}
        type="text"
        role="combobox"
        aria-expanded={expanded}
        aria-busy={loading || undefined}
        aria-controls={`${controlId}-list`}
        aria-activedescendant={expanded && activeIndex >= 0
            ? `${controlId}-option-${activeIndex}`
            : undefined}
        aria-autocomplete={canSearch ? 'list' : 'none'}
        aria-invalid={field?.invalid || resolvedStatus === 'error'
            || attributes['aria-invalid']
            || undefined}
        aria-required={attributes.required || field?.required || undefined}
        aria-describedby={[attributes['aria-describedby'], field?.describedBy].filter(
            Boolean
          ).join(
            ' '
          )
            || undefined}
        autocomplete="off"
        readonly={isReadOnly}
        inputmode={attributes.inputmode
            ?? (multiple && !canSearch
              ? 'none'
              : undefined)}
        required={multiple ? false : attributes.required}
        disabled={resolvedDisabled}
        value={multiple
            ? search
            : expanded && canSearch ? search : selected?.label ?? ''}
        placeholder={multiple
            ? selectedValues.length ? undefined : placeholder
            : expanded && canSearch ? selected?.label ?? placeholder : placeholder}
        onkeydown={handleKeydown}
        onbeforeinput={handleBeforeInput}
        oninput={handleInput}
        onpaste={handlePaste}
        oncompositionstart={handleCompositionStart}
        oncompositionend={handleCompositionEnd}
        onclick={handleClick}
        onblur={handleBlur}
        onfocus={handleFocus}
      />
    </div>
    {#if allowClear && (multiple ? selectedValues.length || tagMode && search : selected) && !resolvedDisabled}
      <button type="button" class={['clear', componentTheme.className && `${prefix}-clear`]} aria-label={config.locale.clearText} onpointerdown={(event) => event.preventDefault()} onclick={() => choose(undefined)}><Icon name="close" /></button>
    {/if}
    <span class={['suffix', componentTheme.className && `${prefix}-suffix`]}><Icon name={loading ? 'loading' : 'down'} />{#if feedback.hasFeedback && feedback.icon}<FormFeedbackIcon descriptor={feedback.icon} />{/if}</span>
  </div>
  {#if name ?? field?.name}
    {#if multiple}
      {#each selectedValues as item (item)}<input type="hidden" name={name ?? field?.name} value={item} disabled={resolvedDisabled} form={attributes.form} />{/each}
    {:else}
      <input type="hidden" name={name ?? field?.name} value={typeof selectedValue === 'string'
          || typeof selectedValue === 'number'
          ? selectedValue
          : ''} disabled={resolvedDisabled} form={attributes.form} />
    {/if}
  {/if}
  {#if expanded}
    <div
      bind:this={list}
      data-ant-select-dropdown data-ant-select-prefix={prefix} data-ant-select-root-prefix={rootPrefix}
      data-ant-select-source-popup={Boolean(componentTheme.className) && filtered.length > 0 || undefined}
      popover={popupContainerGetter ? 'manual' : undefined}
      hidden={Boolean(popupContainerGetter) && !shown}
      dir={config.direction}
      class={[`popup ${prefix}-dropdown`, componentTheme.className && 'ant-select-css-var',
        componentTheme.className && filtered.length > 0 && `${prefix}-source-popup`,
        componentTheme.className && config.direction === 'rtl' && `${prefix}-dropdown-rtl`,
        componentTheme.className]}
      {@attach node => connectComponentTheme(node, componentTheme.style)}
      {@attach portal}
      id={`${controlId}-list`}
      role="listbox"
      aria-busy={loading || undefined}
      onscroll={onPopupScroll}
      onfocusout={handleListFocusOut}
      aria-multiselectable={multiple || undefined}
      aria-label={attributes['aria-label']
          ?? placeholder
          ?? config.locale.searchText}
    >
      {#each filtered as option, index (option.value)}
        <button
          type="button"
          data-ant-select-item
          role="option"
          tabindex="-1"
          id={`${controlId}-option-${index}`}
          aria-selected={multiple
              ? selectedKeys.has(option.value)
              : option.value === selectedValue}
          aria-disabled={option.disabled || undefined}
          disabled={option.disabled}
          class={[
              `${prefix}-item ${prefix}-item-option`,
              (multiple
                ? selectedKeys.has(option.value)
                : option.value === selectedValue)
              && `${prefix}-item-option-selected`,
              index === activeIndex && `${prefix}-item-option-active`,
              option.disabled && `${prefix}-item-option-disabled`
            ]}
          onpointerdown={(event) => event.preventDefault()}
          onpointermove={() => {
              if (!option.disabled)
                activeValue = option.value;
            }}
          onclick={() => choose(option)}
        >
          <span class={`${prefix}-item-option-content`}>{#if renderOption}{@render renderOption(getRenderOption(index), { index })}{:else}{option.label}{/if}</span>
          {#if multiple ? selectedKeys.has(option.value) : option.value === selectedValue}<span class={`${prefix}-item-option-state`}><Icon name="check" /></span>{/if}
        </button>
      {:else}
        <div class={`${prefix}-item-empty`}>{#snippet nativeEmpty()}{loading
              ? (config.locale.spin ?? ruRU.spin!).loadingText
              : config.locale.emptyText}{/snippet}<RenderEmpty componentName="Select"
              local={notFoundContent} fallback={nativeEmpty} /></div>
      {/each}
    </div>
  {/if}
</div>
