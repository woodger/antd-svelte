<script lang="ts" generics="Value extends string | number = string, Mode extends 'multiple' | 'tags' | undefined = undefined">
  import { tick, untrack } from 'svelte';
  import { useConfig } from './config-context';
  import { useVariant } from './variant.svelte';
  import RenderEmpty from './RenderEmpty.svelte';
  import { useComponentTheme } from './theme-component.svelte';
  import { connectComponentTheme } from './theme-component.dom';
  import { connectPopup } from './popup.dom';
  import { createPopupContainer } from './popup-container.model.svelte.js';
  import { useCompact } from './space-compact-context';
  import { compactClasses } from './space-compact.engine';
  import { useFormField } from './form-context';
  import {
    filterOptions,
    getEnabledIndex,
    getSelectValues,
    resolveSelectedOptions
  } from './select.engine';
  import { ruRU, type SelectOption } from './types';
  import type { SelectProps, SelectSearchConfig } from './select.types';
  import { getSelectTagOptions } from './select-tags.engine';
  import { resolveSelectTokenOptions, splitSelectTokens } from './select-token.engine';
  import Icon from './Icon.svelte';

  type RawValue = Value | string;

  let {
    _autoWidth = false,
    options,
    mode,
    tokenSeparators,
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
  let appearance = $derived(variantContext.variant);
  const generatedId = $props.id();
  const initialDefault = untrack(
    () => Array.isArray(defaultValue) ? [...defaultValue] : defaultValue
  );
  let useDefault = $state(true);
  let isOpen = $state(false);
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
  let filtered = $derived(tagMode
    ? getSelectTagOptions(options, selectionOptions, search, filter, searchConfig.optionFilterProp)
    : filterOptions<RawValue>(options, search, filter, searchConfig.optionFilterProp));
  $effect(() => {
    cachedOptions = selectionOptions;
  });
  let activeIndex = $derived.by(() => {
    const index = filtered.findIndex(
      (option) => option.value === activeValue && !option.disabled
    );

    return index < 0 ? getEnabledIndex(filtered, -1, 'first') : index;
  });
  let resolvedDisabled = $derived(disabled ?? field?.disabled ?? config.componentDisabled);
  let resolvedStatus = $derived(status ?? field?.status);
  let resolvedSize = $derived(size ?? compact?.size ?? config.componentSize);
  let compactItemClasses = $derived(compactClasses('ant-select', config.direction, compact));
  let expanded = $derived(isOpen && !resolvedDisabled);
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

    if (isOpen !== next) {
      isOpen = next;
      onOpenChange?.(next);
    }

    if (!next && !tagMode && (!multiple || autoClearSearch)) {
      internalSearch = '';
    }
  }

  function openList(direction: 'first' | 'last' = 'first') {
    if (!isOpen) {
      if (!tagMode && (!multiple || autoClearSearch)) internalSearch = '';
      activeValue = !multiple && selected && !selected.disabled
        ? selected.value
        : tagMode ? filtered[getEnabledIndex(filtered, -1, direction)]?.value
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
    if (!optionMap.get(next)?.disabled && !selectedKeys.has(next)) {
      cachedOptions = new Map(cachedOptions).set(next,
        optionMap.get(next) ?? { value: next, label: next });
      changeMultiple([...selectedValues, next]);
    }
    internalSearch = '';
  }

  function choose(option: SelectOption<RawValue> | undefined) {
    if (resolvedDisabled || option?.disabled) {
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

  function remove(item: RawValue) {
    if (resolvedDisabled || selectionOptions.get(item)?.disabled) return;

    const next = new Set(selectedValues);

    if (next.delete(item))
      changeMultiple([...next]);
    control?.focus();
  }

  function handleReset(event: Event) {
    const input = control;

    if (!multiple || !input || event.target !== input.form) return;

    queueMicrotask(() => {
      if (event.defaultPrevented || !input.isConnected || input !== control || !multiple) return;

      useDefault = false;
      value = getSelectValues(initialDefault) as typeof value;
      internalSearch = '';
      isOpen = false;
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
    if (multiple && tokenSeparators !== undefined && !composing) {
      const words = splitSelectTokens(next, tokenSeparators);
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
    const matches = tagMode
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
  .ant-select { display: flex; align-items: center; width: 100%; }
  .ant-select:focus-within { outline: 2px solid var(--ant-color-primary); outline-offset: 2px; }
  .ant-select.ant-select-source-theme { align-items: flex-start; }
  .ant-select.ant-select-source-theme:focus-within { outline: 0; outline-offset: 0; }
  .ant-select.ant-select-single .ant-select-input, .ant-select.ant-select-multiple .ant-select-input {
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
  .ant-select-input::placeholder { color: var(--ant-color-text-placeholder); }
  .intrinsic-width { width: auto; }
  .intrinsic-width .ant-select-content { position: relative; }
  .intrinsic-width .ant-select.ant-select-single .ant-select-input { position: absolute; inset: 0; }
  .intrinsic-label { visibility: hidden; white-space: pre; }
  .suffix { display: flex; flex: none; color: var(--ant-color-text-quaternary); pointer-events: none; }
  .clear { display: flex; padding: 0; margin-inline-end: 4px; border: 0; background: none; color: var(--ant-color-text-tertiary); cursor: pointer; }
  .clear:focus-visible { outline: 2px solid var(--ant-color-primary); outline-offset: 2px; }
  .popup.ant-select-dropdown { top: calc(100% + 4px); inset-inline: 0; max-height: 256px; overflow-y: auto; }
  /* Исходный virtual-list размещает options в flex column без сжатия строк. */
  .popup.ant-select-source-popup { display: flex; flex-direction: column; }
  .popup.ant-select-dropdown[popover] { position: fixed; inset: auto; margin: 0; }
  .popup.ant-select-dropdown[hidden] { display: none; }
  .ant-select-source-popup > .ant-select-item { flex: none; }
  .ant-select-source-theme .clear { display: inline-block; margin-inline-end: 0; color: var(--ant-color-text-quaternary); }
  .ant-select-source-theme .clear:hover { color: var(--ant-color-icon); }
  .ant-select-source-theme .clear:focus-visible { opacity: 1; }
  .ant-select-source-theme:has(.clear):hover .suffix, .ant-select-source-theme:has(.clear:focus-visible) .suffix { opacity: 0; }
  .ant-select-item { width: 100%; border: 0; background: none; font-family: inherit; text-align: start; }
  .ant-select.ant-select-multiple { height: auto; min-height: var(--ant-select-height); }
  .ant-select.ant-select-multiple .ant-select-content { gap: 0; }
  .ant-select.ant-select-multiple .ant-select-input { flex: 1 1 60px; width: 60px; min-width: 40px; max-width: 100%; }
  .ant-select.ant-select-source-theme.ant-select-multiple .ant-select-input { line-height: calc(var(--ant-select-internal_fixed_item_margin) * 2 + var(--ant-select-multi-item-height)); }
  .ant-select.ant-select-multiple .ant-select-selection-item { flex: none; box-sizing: border-box; max-width: calc(100% - var(--ant-select-internal_fixed_item_margin) * 2); min-width: 0; }
  .ant-select-selection-item-remove { flex: none; padding: 0; border: 0; background: transparent; }
  .ant-select-selection-item-remove:focus-visible { outline: 2px solid var(--ant-color-primary); outline-offset: 1px; }
  .ant-select-selection-item-disabled { color: var(--ant-select-multiple-item-color-disabled); }
  .ant-select-source-theme .ant-select-selection-item-disabled { color: inherit; }
  .container.ant-select-compact-item > .ant-select { border-radius: inherit; }
  @media (hover: none) {
    .ant-select-source-theme:has(.clear) .suffix { opacity: 0; }
  }
</style>

<svelte:document onpointerdown={handleOutside} onreset={handleReset} />

<div class={[
    'container ant-select-css-var',
    intrinsicWidth && 'intrinsic-width',
    componentTheme.className,
    compactItemClasses,
    compact && resolvedSize === 'large' && 'ant-select-lg',
    compact && resolvedSize === 'small' && 'ant-select-sm',
    compact && expanded && 'ant-select-focused',
    compact && resolvedDisabled && 'ant-select-disabled',
    className
  ]} bind:this={container} style={[componentTheme.style, style].filter(Boolean).join(';') || undefined}>
  <div
    bind:this={reference}
    role="presentation"
    onpointerdown={handlePointerDown}
    class={[
        'ant-select ant-select-css-var',
        `ant-select-${appearance}`,
        'ant-select-show-arrow',
        componentTheme.className && 'ant-select-source-theme',
        componentTheme.className && canSearch && 'ant-select-show-search',
        componentTheme.className && allowClear && 'ant-select-allow-clear',
        componentTheme.className && config.direction === 'rtl' && 'ant-select-rtl',
        loading && 'ant-select-loading',
        multiple ? 'ant-select-multiple' : 'ant-select-single',
        expanded && 'ant-select-open',
        (expanded || componentTheme.className && focused) && 'ant-select-focused',
        resolvedDisabled && 'ant-select-disabled',
        resolvedSize === 'large' && 'ant-select-lg',
        resolvedSize === 'small' && 'ant-select-sm',
        resolvedStatus && `ant-select-status-${resolvedStatus}`
      ]}
    style={componentTheme.style}
  >
    <div class="ant-select-content">
      {#if intrinsicWidth}<span class="intrinsic-label" aria-hidden="true">{selected?.label ?? placeholder ?? ''}</span>{/if}
      {#if multiple}
        {#each tags as tag (tag.value)}
          <span class={[
              'ant-select-selection-item',
              (resolvedDisabled || tag.disabled) && 'ant-select-selection-item-disabled'
            ]} title={tag.label}>
            <span class="ant-select-selection-item-content">{tag.label}</span>
            {#if !resolvedDisabled && !tag.disabled}<button type="button" class="ant-select-selection-item-remove" aria-label={`${config.locale.removeText
                ?? ruRU.removeText} ${tag.label}`} onpointerdown={(event) => event.preventDefault()} onclick={() => remove(tag.value)}><Icon name="close" /></button>{/if}
          </span>
        {/each}
      {/if}
      <input
        {...attributes}
        bind:this={control}
        id={controlId}
        class="ant-select-input"
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
      <button type="button" class={['clear', componentTheme.className && 'ant-select-clear']} aria-label={config.locale.clearText} onpointerdown={(event) => event.preventDefault()} onclick={() => choose(undefined)}><Icon name="close" /></button>
    {/if}
    <span class={['suffix', componentTheme.className && 'ant-select-suffix']}><Icon name={loading ? 'loading' : 'down'} /></span>
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
      popover={popupContainerGetter ? 'manual' : undefined}
      hidden={Boolean(popupContainerGetter) && !shown}
      dir={config.direction}
      class={['popup ant-select-dropdown', componentTheme.className && 'ant-select-css-var',
        componentTheme.className && filtered.length > 0 && 'ant-select-source-popup',
        componentTheme.className && config.direction === 'rtl' && 'ant-select-dropdown-rtl',
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
          role="option"
          tabindex="-1"
          id={`${controlId}-option-${index}`}
          aria-selected={multiple
              ? selectedKeys.has(option.value)
              : option.value === selectedValue}
          aria-disabled={option.disabled || undefined}
          disabled={option.disabled}
          class={[
              'ant-select-item ant-select-item-option',
              (multiple
                ? selectedKeys.has(option.value)
                : option.value === selectedValue)
              && 'ant-select-item-option-selected',
              index === activeIndex && 'ant-select-item-option-active',
              option.disabled && 'ant-select-item-option-disabled'
            ]}
          onpointerdown={(event) => event.preventDefault()}
          onpointermove={() => {
              if (!option.disabled)
                activeValue = option.value;
            }}
          onclick={() => choose(option)}
        >
          <span class="ant-select-item-option-content">{option.label}</span>
          {#if multiple ? selectedKeys.has(option.value) : option.value === selectedValue}<span class="ant-select-item-option-state"><Icon name="check" /></span>{/if}
        </button>
      {:else}
        <div class="ant-select-item-empty">{#snippet nativeEmpty()}{loading
              ? (config.locale.spin ?? ruRU.spin!).loadingText
              : config.locale.emptyText}{/snippet}<RenderEmpty componentName="Select"
              local={notFoundContent} fallback={nativeEmpty} /></div>
      {/each}
    </div>
  {/if}
</div>
