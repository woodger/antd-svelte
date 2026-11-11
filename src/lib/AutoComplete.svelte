<script lang="ts">
  import { onMount, tick, untrack } from 'svelte';
  import type {
    AutoCompleteProps,
    AutoCompleteSearchConfig,
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
  import ThemeScopeStyle from './ThemeScopeStyle.svelte';
  import { getSelectPrefixCss } from './select-prefix.engine';
  import { useVariant } from './variant.svelte';
  import { useCompact } from './space-compact-context';
  import { compactClasses } from './space-compact.engine';
  import { useForm, useFormField } from './form-context';
  import { useFormItemStatusContext } from './form-item-status';
  import { useFormFeedback } from './form-feedback-context';
  import FormFeedbackIcon from './FormFeedbackIcon.svelte';
  import { connectPopup } from './popup.dom';
  import { createPopupContainer } from './popup-container.model.svelte.js';
  import { useComponentTheme } from './theme-component.svelte';
  import { connectComponentTheme } from './theme-component.dom';
  import Icon from './Icon.svelte';

  let {
    prefixCls,
    options = [],
    value,
    defaultValue,
    open,
    defaultOpen = false,
    showSearch = true,
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
    children,
    class: className = '',
    rootClassName = '',
    classNames,
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
  let prefix = $derived(config.getPrefixCls('select', prefixCls));
  let rootPrefix = $derived(config.getPrefixCls());
  let privateNamespace = $derived(rootPrefix.replaceAll('.', ''));
  let prefixCss = $derived(getSelectPrefixCss(prefix, rootPrefix));
  const variantContext = useVariant('select', () => ({ variant }));
  let appearance = $derived(variantContext.variant);
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
  let resolvedStatus = $derived(status ?? ('status' in itemStatus ? itemStatus.status : field?.status));
  let showClear = $derived(Boolean(allowClear && text && !blocked && !readonly));
  let controlId = $derived(id ?? field?.id ?? `ant-auto-complete-${generated}`);
  let searchConfig = $derived<AutoCompleteSearchConfig>(
    { ...(typeof showSearch === 'object' ? showSearch : {}) }
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
  let pendingClearClose: MessageChannel | undefined;
  let previous = untrack(() => ({ value, open }));
  onMount(() => {
    hydrated = true;
    return cancelClearClose;
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
    if (next.open !== previous.open) {
      cancelClearClose();
      innerOpen = Boolean(next.open);
    }
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
    cancelClearClose();
    if (next && (blocked || readonly)) return;
    if (next !== visible)
      onOpenChange?.(next);
    innerOpen = next;
  }
  function clearPointerDown(event: PointerEvent) {
    event.preventDefault();
    if (!visible) return;
    cancelClearClose();
    // rc-select closes after the pointer click's clear/change/search callbacks.
    const channel = new MessageChannel();
    pendingClearClose = channel;
    channel.port1.onmessage = () => {
      if (pendingClearClose === channel) requestOpen(false);
    };
    channel.port2.postMessage(null);
  }
  function cancelClearClose() {
    pendingClearClose?.port1.close();
    pendingClearClose?.port2.close();
    pendingClearClose = undefined;
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
      'aria-invalid': field?.invalid || resolvedStatus === 'error' || attributes['aria-invalid'] || undefined,
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
  .auto-complete[data-ant-auto-complete-customize] { height: auto; min-height: var(--ant-native-select-height); padding: 0; }
  [data-ant-auto-complete-content] { flex: 1; min-width: 0; }
  .auto-complete [data-ant-auto-complete-input] { position: relative; inset: auto; width: 100%; min-width: 0; padding: 0; border: 0; outline: 0; background: transparent; color: inherit; font: inherit; line-height: inherit; opacity: 1; }
  [data-ant-auto-complete-input]::placeholder { color: var(--ant-color-text-placeholder); }
  .auto-complete:focus-within { outline: 2px solid var(--ant-color-primary); outline-offset: 2px; }
  .auto-complete[data-ant-auto-complete-source-theme]:focus-within { outline: 0; outline-offset: 0; }
  .auto-complete[data-ant-auto-complete-source-theme][data-ant-auto-complete-customize] { min-height: 0; }
  .clear { display: flex; flex: none; padding: 0; border: 0; background: none; color: var(--ant-color-text-tertiary); cursor: pointer; }
  .clear:focus-visible { outline: 2px solid var(--ant-color-primary); }
  .feedback-suffix { display: flex; flex: none; pointer-events: none; }
  /* The retained native popup is a child; Source's portal does not affect :last-child. */
  .auto-complete[data-ant-select-prefix]:not(:has(> .clear)) > .feedback-suffix { opacity: 1; }
  [data-ant-auto-complete-source-theme] .clear { display: inline-block; color: var(--ant-color-text-quaternary); }
  [data-ant-auto-complete-source-theme] .clear:hover { color: var(--ant-color-icon); }
  [data-ant-auto-complete-source-theme] .clear:focus-visible { opacity: 1; }
  .popup { position: fixed; margin: 0; border: 0; overflow-y: auto; }
  [data-ant-auto-complete-item] { display: block; width: 100%; border: 0; background: transparent; color: inherit; font: inherit; text-align: start; }
  /* Options повторяют flex column rc-select, пустая выдача остаётся обычным блоком. */
  .popup[data-ant-auto-complete-source-popup]:not([hidden]) { display: flex; flex-direction: column; }
  [data-ant-auto-complete-source-popup] [data-ant-auto-complete-item] { flex: none; font-size: var(--ant-select-option-font-size); line-height: var(--ant-select-option-line-height); font-weight: 400; color: var(--ant-color-text); }
  [data-ant-auto-complete-source-popup] [data-ant-auto-complete-item-option] { display: flex; }
  [data-ant-auto-complete-source-popup] [data-ant-auto-complete-item-group] { font-size: var(--ant-font-size-sm); color: var(--ant-color-text-description); }
  [data-ant-auto-complete-source-popup] [data-ant-auto-complete-item-option-disabled] { color: var(--ant-color-text-disabled); }
</style>

<svelte:document onreset={handleReset} />
{#if prefixCss}<ThemeScopeStyle css={prefixCss} scope={`auto-complete-prefix:${prefix}:${rootPrefix}`} />{/if}<div data-ant-select-prefix={prefix} data-ant-select-root-prefix={rootPrefix}
  data-ant-auto-complete-source-theme={Boolean(componentTheme.className) || undefined}
  data-ant-auto-complete-customize={Boolean(children) || undefined}
  style:--ant-native-select-height={`var(--${privateNamespace}-select-height)`}
  bind:this={root} dir={config.direction}
  style={[componentTheme.style, style].filter(Boolean).join(';') || undefined}
  class={[
      `auto-complete ${prefix} ant-select-css-var ${prefix}-single ${prefix}-auto-complete ${prefix}-show-search`,
      componentTheme.className,
      componentTheme.className && `${prefix}-source-theme`,
      componentTheme.className && showClear && `${prefix}-allow-clear`,
      componentTheme.className && config.direction === 'rtl' && `${prefix}-rtl`,
      `${prefix}-${appearance}`,
      resolvedSize === 'large' && `${prefix}-lg`,
      resolvedSize === 'small' && `${prefix}-sm`,
      focused && `${prefix}-focused`,
      visible && `${prefix}-open`,
      blocked && `${prefix}-disabled`,
      resolvedStatus && `${prefix}-status-${resolvedStatus}`,
      feedback.hasFeedback && `${prefix}-has-feedback ${prefix}-show-arrow`,
      feedback.isFormItemInput && `${prefix}-in-form-item`,
      children && `${prefix}-customize`,
      compactClasses(prefix, config.direction, compact),
      className,
      rootClassName
    ]}>
  <div data-ant-auto-complete-content class={`${prefix}-content`}>
    {#if children}{@render children(input)}{:else}<input {...attributes} {...input.attributes} use:register data-ant-auto-complete-input class={`${prefix}-input`} type="text" />{/if}
  </div>
  {#if feedback.hasFeedback}<div class={[`${prefix}-suffix`, 'feedback-suffix']}>{#if feedback.icon}<FormFeedbackIcon descriptor={feedback.icon} />{/if}</div>{/if}
  {#if showClear}<button type="button" class={['clear', componentTheme.className && `${prefix}-clear`]} aria-label={config.locale.clearText} onpointerdown={clearPointerDown} onclick={clear}>
    {#if typeof allowClear === 'object' && allowClear.clearIcon}{@render allowClear.clearIcon()}{:else}<Icon name="close" />{/if}
  </button>{/if}
  {#if mounted}
    <div data-ant-select-prefix={prefix} data-ant-select-root-prefix={rootPrefix}
      data-ant-auto-complete-source-popup={Boolean(componentTheme.className) && entries.length > 0 || undefined}
      bind:this={popup} popover="manual" hidden={!visible || !shown} id={`${controlId}-list`} role="listbox"
      class={[`popup ${prefix}-dropdown ant-select-css-var`, componentTheme.className,
          componentTheme.className && entries.length > 0 && `${prefix}-source-popup`,
          componentTheme.className && config.direction === 'rtl' && `${prefix}-dropdown-rtl`,
          classNames?.popup?.root]} dir={config.direction}
      {@attach node => connectComponentTheme(node, componentTheme.style)}
      {@attach portal}
      style:max-height={`${listHeight}px`}
      style:width={typeof popupMatchSelectWidth === 'number' ? `${popupMatchSelectWidth}px` : undefined}
      onscroll={onPopupScroll}
      aria-label={attributes['aria-label']
          ?? attributes.placeholder
          ?? config.locale.searchText}>
      {#each entries as entry, index (entry.key)}
        {#if entry.group}<div data-ant-auto-complete-item data-ant-auto-complete-item-group class={`${prefix}-item ${prefix}-item-group`}>{#if typeof entry.option.label === 'function'}{@render entry.option.label()}{:else}{entry.option.label ?? ''}{/if}</div>
        {:else if 'value' in entry.option}
          <button data-ant-auto-complete-item data-ant-auto-complete-item-option
            data-ant-auto-complete-item-option-disabled={entry.option.disabled || undefined}
            type="button" role="option" tabindex="-1" id={`${controlId}-option-${index}`} disabled={entry.option.disabled}
            aria-selected={entry.option.value.toLowerCase() === text.toLowerCase()} aria-disabled={entry.option.disabled || undefined}
            class={[
                `${prefix}-item ${prefix}-item-option`,
                componentTheme.className && entry.grouped && `${prefix}-item-option-grouped`,
                index === active && `${prefix}-item-option-active`,
                entry.option.disabled && `${prefix}-item-option-disabled`,
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
            <span class={componentTheme.className ? `${prefix}-item-option-content` : undefined}>
              {#if typeof entry.option.label === 'function'}{@render entry.option.label()}{:else}{entry.option.label ?? entry.option.value}{/if}
            </span>
          </button>
        {/if}
      {:else}<div class={`${prefix}-item-empty`}>{#if typeof notFoundContent === 'function'}{@render notFoundContent()}{:else}{notFoundContent ?? ''}{/if}</div>{/each}
    </div>
  {/if}
</div>
