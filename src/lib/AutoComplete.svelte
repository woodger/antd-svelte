<script lang="ts">
  import { onMount, tick, untrack } from 'svelte';
  import type {
    AutoCompleteProps,
    AutoCompleteInput,
    AutoCompleteOption
  } from './auto-complete.types';
  import {
    filterAutoCompleteOptions,
    flattenAutoCompleteOptions,
    autoCompleteNext,
    autoCompleteOption
  } from './auto-complete.engine';
  import { useConfig } from './config-context';
  import { useVariant } from './variant.svelte';
  import { useCompact } from './space-compact-context';
  import { compactClasses } from './space-compact.engine';
  import { useForm, useFormField } from './form-context';
  import { connectPopup } from './popup.dom';
  import { createPopupContainer } from './popup-container.model.svelte.js';
  import { useComponentTheme } from './theme-component.svelte';
  import { connectComponentTheme } from './theme-component.dom';
  import Icon from './Icon.svelte';

  let {
    options = [],
    value,
    defaultValue,
    open,
    defaultOpen = false,
    showSearch = true,
    filterOption,
    onSearch,
    onChange,
    onSelect,
    onOpenChange,
    onClear,
    onInputKeyDown,
    onFocus,
    onBlur,
    onPopupScroll,
    getPopupContainer,
    backfill = false,
    defaultActiveFirstOption = false,
    allowClear = false,
    notFoundContent,
    popupMatchSelectWidth = true,
    listHeight = 256,
    size,
    status,
    variant,
    bordered,
    children,
    class: className = '',
    rootClassName = '',
    popupClassName = '',
    style,
    id,
    name,
    disabled,
    readonly,
    nativeElement = $bindable(),
    inputElement = $bindable(),
    ...attributes
  }: AutoCompleteProps = $props();
  const config = useConfig();
  const variantContext = useVariant('select', () => ({ variant, bordered }));
  let appearance = $derived(variantContext.variant);
  const field = useFormField();
  const form = useForm();
  const compact = useCompact();
  const componentTheme = useComponentTheme('Select');
  const generated = $props.id();
  let innerValue = $state<string | undefined>(untrack(() => value ?? defaultValue));
  let innerOpen = $state(untrack(() => open ?? defaultOpen));
  let actualValue = $derived(value ?? innerValue);
  let text = $derived(actualValue ?? '');
  let blocked = $derived(
    disabled ?? field?.disabled ?? form?.disabled ?? config.componentDisabled
  );
  let resolvedSize = $derived(size ?? compact?.size ?? config.componentSize);
  let resolvedStatus = $derived(status ?? field?.status);
  let showClear = $derived(Boolean(allowClear && text && !blocked && !readonly));
  let controlId = $derived(id ?? field?.id ?? `ant-auto-complete-${generated}`);
  let searchConfig = $derived(
    { filterOption, onSearch, ...(typeof showSearch === 'object' ? showSearch : {}) }
  );
  let entries = $derived(
    flattenAutoCompleteOptions(
      filterAutoCompleteOptions(options, text, searchConfig.filterOption ?? false)
    )
  );
  let allEntries = $derived(flattenAutoCompleteOptions(options));
  let count = $derived(entries.length);
  let hydrated = $state(false);
  let visible = $derived(
    hydrated
    && !blocked
    && !readonly
    && (open
      ?? innerOpen)
    && Boolean(
      entries.length || notFoundContent
    )
  );
  let active = $state(-1);
  let preview = $state<string>();
  let focused = $state(false);
  let root = $state<HTMLDivElement>();
  let editor = $state<HTMLInputElement | HTMLTextAreaElement>();
  let popup = $state<HTMLDivElement>();
  let shown = $state(false);
  let mounted = $state(false);
  const portal = createPopupContainer(() => ({
    open: visible,
    reference: root,
    getPopupContainer: getPopupContainer || config.getPopupContainer,
    themeStyle: componentTheme.style
  }));
  let enterLock = false;
  let previous = untrack(() => ({ value, open }));
  onMount(() => {
    hydrated = true;
  });

  // Без bind: обновление spread props может сбросить локальное значение ref prop.
  $effect(() => {
    nativeElement = root;
    return () => { nativeElement = undefined; };
  });
  $effect(() => {
    inputElement = editor;
    return () => { inputElement = undefined; };
  });

  $effect(() => {
    const next = { value, open };
    if (next.value !== previous.value) {
      innerValue = next.value;
      preview = undefined;
    }
    if (next.open !== previous.open)
      innerOpen = Boolean(next.open);
    previous = next;
  });
  $effect(() => {
    const currentText = text;
    const length = count;
    const expanded = visible;
    untrack(() => {
      preview = undefined;
      active = defaultActiveFirstOption ? autoCompleteNext(entries, -1, 1) : -1;
      if (expanded && currentText) {
        const closest = entries.findIndex(
          entry => !entry.group
            && 'value' in entry.option
            && entry.option.value.startsWith(
              currentText
            )
        );
        if (closest >= 0)
          active = closest;
      }
      if (active >= length)
        active = -1;
      if (expanded)
        mounted = true;
    });
  });
  $effect(() => {
    if (!visible || !popup || !root) return;
    return connectPopup(popup, root, {
      placement: 'bottom',
      gap: 4,
      align: config.direction === 'rtl' ? 'right' : 'left',
      autoAdjustOverflow: true,
      maxWidth: '100vw',
      matchAnchorWidth: popupMatchSelectWidth !== false,
      onPlacement: () => { },
      onVisibilityChange: next => {
        shown = next;
      },
      onDismiss: () => requestOpen(false)
    });
  });
  $effect(() => {
    const index = active;
    if (visible && index >= 0)
      popup?.querySelector(`#${CSS.escape(`${controlId}-option-${index}`)}`)?.scrollIntoView(
        { block: 'nearest' }
      );
  });

  function register(element: HTMLInputElement | HTMLTextAreaElement) {
    editor = element;
    return {
      destroy() {
        if (editor === element)
          editor = undefined;
      }
    };
  }
  function requestOpen(next: boolean) {
    if (next && (blocked || readonly)) return;
    if (next !== visible)
      onOpenChange?.(next);
    innerOpen = next;
  }
  function change(next: string | undefined, before = actualValue) {
    innerValue = next;
    if (next !== before) {
      const option = allEntries.find(
        entry => !entry.group && 'value' in entry.option && entry.option.value === next
      )?.option;
      onChange?.(next, next === undefined ? undefined : option ? { ...option } : {});
    }
  }
  function handleInput(event: Event) {
    const control = event.currentTarget as HTMLInputElement | HTMLTextAreaElement;
    if (blocked || readonly) return;
    const next = control.value;
    preview = undefined;
    if (next !== text) {
      change(next);
      searchConfig.onSearch?.(next);
    }
    if (next)
      requestOpen(true);
    void tick().then(() => {
      if (control.isConnected && value !== undefined && control.value !== text)
        control.value = text;
    });
  }
  function choose(option: AutoCompleteOption) {
    if (blocked || readonly || option.disabled) return;
    change(option.value);
    onSelect?.(option.value, { ...option });
    preview = undefined;
    requestOpen(false);
    editor?.focus({ preventScroll: true });
  }
  function clear() {
    if (blocked || readonly) return;
    const before = actualValue;
    const beforeText = text;
    onClear?.();
    editor?.focus({ preventScroll: true });
    change(undefined, before);
    // Rc-select вызывает отдельный search-путь после очистки display values.
    if (beforeText) {
      change('', before);
      searchConfig.onSearch?.('');
    }
    preview = undefined;
  }
  function handleKeydown(event: KeyboardEvent) {
    onInputKeyDown?.(event);
    if (event.defaultPrevented || event.isComposing || blocked || readonly) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      if (!visible) {
        if (!(editor instanceof HTMLTextAreaElement))
          requestOpen(true);
        return;
      }
      event.preventDefault();
      active = autoCompleteNext(
        entries,
        active < 0 && event.key === 'ArrowUp' ? entries.length : active,
        event.key === 'ArrowDown' ? 1 : -1
      );
      if (backfill)
        preview = autoCompleteOption(entries, active)?.value;
    } else if ((event.key === 'Enter' || event.key === 'Tab') && visible && !enterLock) {
      const option = autoCompleteOption(entries, active);
      if (event.key === 'Enter')
        enterLock = true;
      if (option && !option.disabled) {
        event.preventDefault();
        choose(option);
      }
      else requestOpen(false);
    } else if (event.key === 'Escape' && visible) {
      event.preventDefault();
      event.stopPropagation();
      preview = undefined;
      requestOpen(false);
    } else if ((event.key === 'Enter' || event.key === ' ') && !visible)
      requestOpen(true);
  }
  function handleBlur(event: FocusEvent) {
    focused = false;
    enterLock = false;
    preview = undefined;
    requestOpen(false);
    field?.onBlur();
    onBlur?.(event);
  }
  function handleReset(event: Event) {
    if (event.target !== editor?.form) return;
    queueMicrotask(() => {
      if (!event.defaultPrevented && editor?.isConnected) {
        innerValue = defaultValue;
        preview = undefined;
        innerOpen = false;
        editor.value = text;
      }
    });
  }
  let input = $derived<AutoCompleteInput>({
    attributes: {
      id: controlId,
      value: visible && preview !== undefined ? preview : text,
      name: name ?? field?.name,
      placeholder: attributes.placeholder,
      disabled: blocked,
      readonly,
      required: attributes.required ?? field?.required,
      dir: attributes.dir ?? config.direction,
      autocomplete: attributes.autocomplete ?? 'off',
      role: 'combobox',
      'aria-label': attributes['aria-label'] ?? field?.label,
      'aria-expanded': visible,
      'aria-controls': `${controlId}-list`,
      'aria-activedescendant': visible && active >= 0 ? `${controlId}-option-${active}` : undefined,
      'aria-autocomplete': 'list',
      'aria-invalid': resolvedStatus === 'error' || attributes['aria-invalid'] || undefined,
      'aria-describedby': [attributes['aria-describedby'], field?.describedBy].filter(Boolean).join(
        ' '
      )
        || undefined,
      oninput: handleInput,
      onkeydown: handleKeydown,
      onkeyup: event => {
        if (event.key === 'Enter')
          enterLock = false;
      },
      onclick: () => requestOpen(true),
      onfocus: event => {
        focused = true;
        onFocus?.(event);
      },
      onblur: handleBlur
    },
    register
  });
  export function focus(options?: FocusOptions) {
    editor?.focus(options);
  }
  export function blur() {
    editor?.blur();
  }
</script>

<style>
  .auto-complete { display: inline-flex; width: 100%; min-width: 0; }
  .auto-complete.ant-select-customize { height: auto; min-height: var(--ant-select-height); padding: 0; }
  .ant-select-content { flex: 1; min-width: 0; }
  .auto-complete .ant-select-input { position: relative; inset: auto; width: 100%; min-width: 0; padding: 0; border: 0; outline: 0; background: transparent; color: inherit; font: inherit; line-height: inherit; opacity: 1; }
  .ant-select-input::placeholder { color: var(--ant-color-text-placeholder); }
  .auto-complete:focus-within { outline: 2px solid var(--ant-color-primary); outline-offset: 2px; }
  .auto-complete.ant-select-source-theme:focus-within { outline: 0; outline-offset: 0; }
  .auto-complete.ant-select-source-theme.ant-select-customize { min-height: 0; }
  .clear { display: flex; flex: none; padding: 0; border: 0; background: none; color: var(--ant-color-text-tertiary); cursor: pointer; }
  .clear:focus-visible { outline: 2px solid var(--ant-color-primary); }
  .ant-select-source-theme .clear { display: inline-block; color: var(--ant-color-text-quaternary); }
  .ant-select-source-theme .clear:hover { color: var(--ant-color-icon); }
  .ant-select-source-theme .clear:focus-visible { opacity: 1; }
  .popup { position: fixed; margin: 0; border: 0; overflow-y: auto; }
  .ant-select-item { display: block; width: 100%; border: 0; background: transparent; color: inherit; font: inherit; text-align: start; }
  /* Options повторяют flex column rc-select, пустая выдача остаётся обычным блоком. */
  .popup.ant-select-source-popup:not([hidden]) { display: flex; flex-direction: column; }
  .ant-select-source-popup .ant-select-item { flex: none; font-size: var(--ant-select-option-font-size); line-height: var(--ant-select-option-line-height); font-weight: 400; color: var(--ant-color-text); }
  .ant-select-source-popup .ant-select-item-option { display: flex; }
  .ant-select-source-popup .ant-select-item-group { font-size: var(--ant-font-size-sm); color: var(--ant-color-text-description); }
  .ant-select-source-popup .ant-select-item-option-disabled { color: var(--ant-color-text-disabled); }
</style>

<svelte:document onreset={handleReset} />
<div bind:this={root} dir={config.direction}
  style={[componentTheme.style, style].filter(Boolean).join(';') || undefined}
  class={[
      'auto-complete ant-select ant-select-css-var ant-select-single ant-select-auto-complete ant-select-show-search',
      componentTheme.className,
      componentTheme.className && 'ant-select-source-theme',
      componentTheme.className && showClear && 'ant-select-allow-clear',
      componentTheme.className && config.direction === 'rtl' && 'ant-select-rtl',
      `ant-select-${appearance}`,
      resolvedSize === 'large' && 'ant-select-lg',
      resolvedSize === 'small' && 'ant-select-sm',
      focused && 'ant-select-focused',
      visible && 'ant-select-open',
      blocked && 'ant-select-disabled',
      resolvedStatus && `ant-select-status-${resolvedStatus}`,
      children && 'ant-select-customize',
      compactClasses('ant-select', config.direction, compact),
      className,
      rootClassName
    ]}>
  <div class="ant-select-content">
    {#if children}{@render children(input)}{:else}<input {...attributes} {...input.attributes} use:register class="ant-select-input" type="text" />{/if}
  </div>
  {#if showClear}<button type="button" class={['clear', componentTheme.className && 'ant-select-clear']} aria-label={config.locale.clearText} onpointerdown={event => event.preventDefault()} onclick={clear}>
    {#if typeof allowClear === 'object' && allowClear.clearIcon}{@render allowClear.clearIcon()}{:else}<Icon name="close" />{/if}
  </button>{/if}
  {#if mounted}
    <div bind:this={popup} popover="manual" hidden={!visible || !shown} id={`${controlId}-list`} role="listbox"
      class={['popup ant-select-dropdown ant-select-css-var', componentTheme.className,
          componentTheme.className && entries.length > 0 && 'ant-select-source-popup',
          componentTheme.className && config.direction === 'rtl' && 'ant-select-dropdown-rtl',
          popupClassName]} dir={config.direction}
      {@attach node => connectComponentTheme(node, componentTheme.style)}
      {@attach portal}
      style:max-height={`${listHeight}px`}
      style:width={typeof popupMatchSelectWidth === 'number' ? `${popupMatchSelectWidth}px` : undefined}
      onscroll={onPopupScroll}
      aria-label={attributes['aria-label']
          ?? attributes.placeholder
          ?? config.locale.searchText}>
      {#each entries as entry, index (entry.key)}
        {#if entry.group}<div class="ant-select-item ant-select-item-group">{#if typeof entry.option.label === 'function'}{@render entry.option.label()}{:else}{entry.option.label ?? ''}{/if}</div>
        {:else if 'value' in entry.option}
          <button type="button" role="option" tabindex="-1" id={`${controlId}-option-${index}`} disabled={entry.option.disabled}
            aria-selected={entry.option.value.toLowerCase() === text.toLowerCase()} aria-disabled={entry.option.disabled || undefined}
            class={[
                'ant-select-item ant-select-item-option',
                componentTheme.className && entry.grouped && 'ant-select-item-option-grouped',
                index === active && 'ant-select-item-option-active',
                entry.option.disabled && 'ant-select-item-option-disabled',
                entry.option.class
              ]}
            style={entry.option.style} title={entry.option.title
                ?? (typeof entry.option.label === 'string'
                  ? entry.option.label
                  : entry.option.value)}
            onpointermove={() => {
                if ('value' in entry.option && !entry.option.disabled) {
                  active = index;
                }
              }}
            onclick={() => {
                const option = autoCompleteOption(entries, index);
                if (option)
                  choose(option);
              }}>
            <span class={componentTheme.className ? 'ant-select-item-option-content' : undefined}>
              {#if typeof entry.option.label === 'function'}{@render entry.option.label()}{:else}{entry.option.label ?? entry.option.value}{/if}
            </span>
          </button>
        {/if}
      {:else}<div class="ant-select-item-empty">{#if typeof notFoundContent === 'function'}{@render notFoundContent()}{:else}{notFoundContent ?? ''}{/if}</div>{/each}
    </div>
  {/if}
</div>
