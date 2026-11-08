<script lang="ts">
  import { tick, untrack } from 'svelte';
  import type { Dayjs } from 'dayjs';
  import type { DatePickerProps, DatePickerMode } from './date-picker.types';
  import { dayjsGenerateConfig as adapter } from './date-picker-dayjs.engine';
  import {
    pickerFormats,
    formatPicker,
    parsePicker,
    pickerDateDisabled,
    pickerTimeDisabled,
    validPickerTime
  } from './date-picker.engine';
  import { datePickerEnUS } from './date-picker.locale';
  import { useConfig } from './config-context';
  import { useVariant } from './variant.svelte';
  import { useComponentTheme } from './theme-component.svelte';
  import { connectComponentTheme } from './theme-component.dom';
  import { useForm, useFormField } from './form-context';
  import { useCompact } from './space-compact-context';
  import { compactClasses } from './space-compact.engine';
  import { connectPopup, getPopupActiveElement } from './popup.dom';
  import { createPickerPopup, getPickerPopupPosition } from './picker-popup.model.svelte.js';
  import NoCompactStyle from './NoCompactStyle.svelte';
  import Button from './Button.svelte';
  import DatePickerCalendar from './DatePickerCalendar.svelte';
  import DatePickerTimePanel from './DatePickerTimePanel.svelte';
  import Icon from './Icon.svelte';
  import PickerCalendarIcon from './PickerCalendarIcon.svelte';
  import PickerClockIcon from './PickerClockIcon.svelte';
  import PickerTimePanel from './PickerTimePanel.svelte';
  import { createRangeInteraction } from './range-picker-interaction.engine';
  import {
    datePickerClock,
    timePickerClock,
    timePickerFormats,
    timePickerLang,
    timePickerSameValue,
    timePickerDateDisabled,
    timePickerValidTime
  } from './time-picker.engine';
  import { timePickerSemantic } from './time-picker-semantic.engine';
  import type { TimePickerProps, TimePickerPreset } from './time-picker.types';
  let {
    time,
    value,
    defaultValue,
    showTime = false,
    format,
    pickerValue,
    defaultPickerValue,
    open,
    defaultOpen = false,
    disabledDate,
    disabledTime,
    minDate,
    maxDate,
    needConfirm,
    allowClear = true,
    inputReadOnly,
    preserveInvalidOnBlur = false,
    showNow = true,
    size,
    status,
    variant,
    locale,
    onChange,
    onCalendarChange,
    onOk,
    onClear,
    onPickerValueChange,
    onOpenChange,
    onPanelChange,
    renderExtraFooter,
    placement,
    disabled,
    id,
    name,
    onkeydown,
    onblur,
    onfocus,
    class: className = '',
    rootClassName = '',
    classNames,
    getPopupContainer,
    style,
    nativeElement = $bindable(),
    ...attributes
  }: DatePickerProps & { time?: TimePickerProps; } = $props();
  const config = useConfig();
  const dateVariant = useVariant('datePicker', () => ({ variant }));
  const timeVariant = useVariant('timePicker', () => time ?? {});
  const componentTheme = useComponentTheme('DatePicker');
  const controlRef = {
    get nativeElement() {
      return nativeElement;
    },
    focus, blur
  };
  const field = useFormField(() => controlRef);
  const form = useForm();
  const compact = useCompact();
  const generatedId = $props.id();
  const initialValue = untrack(() => defaultValue ?? null);
  let internalValue = $state.raw<Dayjs | null>(initialValue);
  let mergedValue = $derived(value === undefined ? internalValue : value);
  let internalOpen = $state(untrack(() => defaultOpen));
  let blocked = $derived(
    disabled ?? field?.disabled ?? form?.disabled ?? config.componentDisabled
  );
  let visible = $derived((open ?? internalOpen) && !blocked);
  let actualLocale = $derived(
    { ...datePickerEnUS.lang, ...config.locale.datePicker?.lang, ...locale?.lang }
  );
  let formats = $derived(time ? timePickerFormats(time, actualLocale)
    : pickerFormats({ format, showTime }, actualLocale));
  let readOnly = $derived(
    time && typeof formats[0] === 'function'
      || (inputReadOnly ?? (attributes.readonly || formats.every(item => typeof item === 'function')))
  );
  let confirm = $derived(needConfirm ?? Boolean(showTime));
  let resolvedSize = $derived(size ?? compact?.size ?? config.componentSize);
  let resolvedStatus = $derived((time ? time.status : status) ?? field?.status);
  let now = $state.raw(untrack(() => adapter.getNow()));
  let draft = $state.raw<Dayjs | null>(untrack(() => value === undefined ? initialValue : value));
  let internalPanel = $state.raw(
    untrack(
      () => pickerValue ?? defaultPickerValue ?? (value === undefined ? initialValue : value)
        ?? (time ? now.startOf('day') : now)
    )
  );
  let panel = $derived(pickerValue ?? internalPanel);
  let mode = $state<DatePickerMode>('date');
  let text = $state(
    untrack(
      () => formatPicker(
        value === undefined ? initialValue : value,
        actualLocale.locale,
        formats
      )
    )
  );
  let dirty = $state(false);
  let invalidTimeInput = $state(false);
  let draftSource = $state<'input' | 'panel'>('input');
  let focused = $state(false);
  let input = $state<HTMLInputElement>();
  let rootElement = $state<HTMLDivElement>();
  let popup = $state<HTMLDivElement>();
  let shown = $state(false);
  let actualPlacement = $derived(
    placement ?? (config.direction === 'rtl' ? 'bottomRight' : 'bottomLeft')
  );
  let popupPlacement = $state<'top' | 'bottom'>('bottom');
  let invalid = $derived(
    time
      ? !!draft && !valid(draft) || invalidTimeInput
      : text !== '' && !valid(parsePicker(text, actualLocale.locale, formats)) && !readOnly
  );
  let clock = $derived(time ? timePickerClock(time, actualLocale)
    : datePickerClock({ format, showTime }, actualLocale));
  let timeFormat = $derived(
    clock.format ?? (typeof formats[0] === 'string' ? formats[0] : 'HH:mm:ss')
  );
  let restrictions = $derived({ minDate, maxDate, disabledDate });
  let hoverValue = $state.raw<Dayjs | null>(null);
  let timeLocale = $derived(time ? timePickerLang(time, actualLocale) : undefined);
  let previousValue = untrack(() => value);
  let previousMergedValue = untrack(() => mergedValue);
  let wasVisible = untrack(() => visible);
  let panelWasOpen = false;
  let actualVariant = $derived(time ? timeVariant.variant : dateVariant.variant);
  let semantic = $derived(time ? timePickerSemantic(time, config.timePicker, {
    variant: actualVariant,
    size: resolvedSize,
    disabled: blocked
  }) : undefined);
  let timeAllowClear = $derived(time?.allowClear ?? config.timePicker?.allowClear ?? true);
  let clearContent = $derived.by(() => {
    const local = typeof time?.allowClear === 'object'
      ? time.allowClear.clearIcon : undefined;
    const context = typeof config.timePicker?.allowClear === 'object'
      ? config.timePicker.allowClear.clearIcon : undefined;
    return local !== undefined ? local : context;
  });
  let suffixContent = $derived(time?.suffixIcon === undefined
    ? config.timePicker?.suffixIcon : time.suffixIcon);
  let placeholderText = $derived(time
    ? attributes.placeholder ?? locale?.timePickerLocale?.placeholder
      ?? config.locale.datePicker?.timePickerLocale?.placeholder
      ?? datePickerEnUS.timePickerLocale.placeholder
    : attributes.placeholder ?? actualLocale.placeholder);
  let displayText = $derived(time && hoverValue
    ? formatPicker(hoverValue, actualLocale.locale, formats) : text);
  let formattedTimeDraft = $derived(time
    ? formatPicker(draft, actualLocale.locale, formats) : undefined);
  let timeInputSize = $derived.by(() => {
    if (!time) return undefined;
    const first = formats[0];
    const length = typeof first === 'function' ? first(now).length : first.length;
    return Math.max(8, length) + 2;
  });
  const timeInteraction = createRangeInteraction<Dayjs[]>({
    fieldCount: () => 1,
    needConfirm: () => confirm,
    allowEmpty: () => [false],
    getCalendarValue: () => [draft ? [draft] : null],
    triggerCalendarChange: (_index, next) => {
      setDraft(next?.[0] ?? null, 'time');
      text = formatPicker(draft, actualLocale.locale, formats);
    },
    flushSubmit: (_index, all) => {
      if (all) {
        commit(draft);
        requestOpen(false);
      }
    },
    resetValue: resetTimeValue
  });

  const popupThemeStyle = $derived(
    [componentTheme.style, semantic?.styles.popup.root].filter(Boolean).join(';') || undefined
  );
  const container = createPickerPopup(() => ({
    open: visible,
    reference: rootElement,
    getPopupContainer: getPopupContainer || config.getPopupContainer,
    themeStyle: popupThemeStyle
  }));
  $effect(() => {
    nativeElement = rootElement;
    return () => { nativeElement = undefined; };
  });
  $effect(() => {
    if (time && value !== previousValue) internalValue = value ?? null;
    previousValue = value;
  });
  $effect(() => {
    if (time && mergedValue === previousMergedValue) return;
    text = formatPicker(mergedValue, actualLocale.locale, formats);
    draft = mergedValue;
    dirty = false;
    previousMergedValue = mergedValue;
  });
  $effect(() => {
    if (formattedTimeDraft !== undefined) {
      text = formattedTimeDraft;
      invalidTimeInput = false;
    }
  });
  $effect(() => {
    const next = visible;
    if (time && wasVisible && !next) {
      hoverValue = null;
      untrack(() => timeInteraction.trigger(0, 'popupClose'));
    }
    wasVisible = next;
  });
  $effect(() => {
    const opened = visible;
    if (time && opened) {
      const next = !panelWasOpen && defaultPickerValue ? defaultPickerValue
        : !defaultPickerValue ? draft : null;
      if (next) untrack(() => syncTimePickerValue(next, 'reset'));
    }
    panelWasOpen = opened;
  });
  $effect(() => {
    if (!visible || !popup || !rootElement) return;
    return connectPopup(popup, rootElement, {
      placement: actualPlacement.startsWith('top') ? 'top' : 'bottom',
      align: actualPlacement.endsWith('Right') ? 'right' : 'left',
      autoAdjustOverflow: true,
      maxWidth: '100vw',
      gap: 4,
      getPosition: (reference, bounds, viewport) => getPickerPopupPosition(
        reference,
        bounds,
        viewport,
        actualPlacement
      ),
      matchAnchorWidth: true,
      preserveFocus: true,
      onVisibilityChange: next => {
        shown = next;
      },
      onPlacement: next => {
        popupPlacement = next === 'top' ? 'top' : 'bottom';
      },
      onDismiss: reason => {
        if (time) {
          if (reason === 'escape') timeInteraction.trigger(0, 'esc');
          requestOpen(false);
        } else finish(false);
        if (reason === 'escape')
          input?.focus();
      }
    });
  });
  $effect(() => {
    if (blocked) {
      internalOpen = false;
      if (!time) resetText();
    }
  });
  function valid(next: Dayjs | null) {
    if (time) return Boolean(next?.isValid()
      && !timePickerDateDisabled(next, time)
      && !pickerTimeDisabled(next, { showTime: clock, disabledTime }));
    return Boolean(
      next?.isValid()
      && !pickerDateDisabled(next, { minDate, maxDate, disabledDate })
      && !pickerTimeDisabled(
        next,
        { showTime, disabledTime }
      )
    );
  }
  function requestOpen(next: boolean) {
    if (blocked || visible === next) return;
    if (next) {
      now = adapter.getNow();
      if (!time) draft = mergedValue;
      if (!time) internalPanel = defaultPickerValue ?? mergedValue ?? now;
      mode = 'date';
      if (time) timeInteraction.trigger(0, 'field-switch');
    }
    if (open === undefined)
      internalOpen = next;
    onOpenChange?.(next);
  }
  function resetText() {
    text = formatPicker(mergedValue, actualLocale.locale, formats);
    dirty = false;
    draft = mergedValue;
  }
  function setDraft(next: Dayjs | null, source: 'date' | 'time') {
    const changed = time ? !timePickerSameValue(next, draft)
      : next?.valueOf() !== draft?.valueOf();
    draft = next;
    if (changed)
      onCalendarChange?.(next, formatPicker(next, actualLocale.locale, formats), { source });
  }
  function commit(next: Dayjs | null) {
    if (!time && blocked || next && !valid(next)) return false;
    const changed = time ? !timePickerSameValue(next, mergedValue)
      : next?.valueOf() !== mergedValue?.valueOf();
    setDraft(next, 'date');
    if (time || value === undefined)
      internalValue = next;
    dirty = false;
    if (changed)
      onChange?.(next, formatPicker(next, actualLocale.locale, formats));
    if (!time) void tick().then(resetText);
    return true;
  }
  function finish(confirmed: boolean) {
    if (time) {
      if (confirmed) {
        if (!draft && clock.defaultOpenValue)
          timeInteraction.trigger(0, 'panel-intermediate', [clock.defaultOpenValue]);
        if (draft) onOk?.(draft);
        timeInteraction.trigger(0, 'confirm');
      } else requestOpen(false);
      return;
    }
    if (confirmed) {
      if (!valid(draft) || !commit(draft)) return;
      if (draft)
        onOk?.(draft);
    } else if (!confirm && dirty) {
      if (!text)
        commit(null);
      else {
        const parsed = draftSource === 'panel'
          ? draft
          : parsePicker(text, actualLocale.locale, formats);
        if (valid(parsed))
          commit(parsed);
      }
    }
    if (!preserveInvalidOnBlur || !invalid)
      resetText();
    requestOpen(false);
  }
  function navigate(next: Dayjs) {
    const target = minDate && next.endOf('month').isBefore(minDate)
      ? minDate
      : maxDate && next.startOf('month').isAfter(maxDate) ? maxDate : next;
    if (pickerValue === undefined)
      internalPanel = target;
    onPickerValueChange?.(target);
    onPanelChange?.(target, mode);
  }
  function changeMode(next: DatePickerMode) {
    mode = next;
    onPanelChange?.(panel, mode);
  }
  function selectDate(next: Dayjs) {
    if (mode !== 'date') {
      internalPanel = next;
      onPickerValueChange?.(next);
      changeMode(mode === 'decade' ? 'year' : mode === 'year' ? 'month' : 'date');
      return;
    }
    const base = draft ?? clock.defaultOpenValue ?? panel;
    const candidate = showTime
      ? validPickerTime(
        base.year(next.year()).month(next.month()).date(next.date()),
        clock,
        disabledTime
      )
      : next;
    if (pickerDateDisabled(candidate, restrictions)) return;
    draftSource = 'panel';
    setDraft(candidate, 'date');
    internalPanel = candidate;
    text = formatPicker(candidate, actualLocale.locale, formats);
    dirty = true;
    if (!confirm && !showTime && commit(candidate)) {
      requestOpen(false);
      input?.focus();
    }
  }
  function selectTime(value: Dayjs) {
    if (time) {
      dirty = true;
      draftSource = 'panel';
      timeInteraction.trigger(0, 'panel-intermediate', [value]);
      syncTimePickerValue(value, 'panel');
      return;
    }
    const next = validPickerTime(value, clock, disabledTime);
    draftSource = 'panel';
    setDraft(next, 'time');
    text = formatPicker(next, actualLocale.locale, formats);
    dirty = true;
  }
  async function keyboard(
    event: KeyboardEvent & { currentTarget: EventTarget & HTMLInputElement; }
  ) {
    onkeydown?.(event);
    if (event.defaultPrevented || event.isComposing || blocked) return;
    if (time) {
      if (event.key === 'Tab') {
        timeInteraction.trigger(0, 'keyboard-submit-weak');
      } else if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        timeInteraction.trigger(0, 'esc');
        requestOpen(false);
      } else if (event.key === 'Enter') {
        event.preventDefault();
        const closed = !visible;
        if (parsePicker(text, actualLocale.locale, formats))
          timeInteraction.trigger(0, 'keyboard-submit');
        if (closed) requestOpen(true);
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        requestOpen(true);
        await tick();
        (popup?.querySelector<HTMLButtonElement>(
          '.ant-picker-time-panel-cell-selected button:not(:disabled)'
        ) ?? popup?.querySelector<HTMLButtonElement>(
          'button[data-picker-time-control]:not(:disabled)'
        ))
          ?.focus();
      }
      return;
    }
    if (event.key === 'Escape' && visible) {
      event.preventDefault();
      event.stopPropagation();
      resetText();
      requestOpen(false);
    }
    else if (event.key === 'Enter') {
      event.preventDefault();
      if (!visible)
        requestOpen(true);
      else {
        const next = text
          ? readOnly || draftSource === 'panel'
            ? draft
            : parsePicker(text, actualLocale.locale, formats)
          : null;
        if (!text || valid(next)) {
          commit(next);
          requestOpen(false);
        }
      }
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!visible)
        requestOpen(true);
      await tick();
      (popup?.querySelector<HTMLButtonElement>(
        `[data-picker-date="${panel.format('YYYY-MM-DD')}"]:not(:disabled)`
      )
        ?? popup?.querySelector<
          HTMLButtonElement
        >(
          '[data-picker-date]:not(:disabled)'
        ))?.focus();
    }
  }
  function blurWithin(event?: FocusEvent) {
    if (event?.relatedTarget instanceof Node
      && (rootElement?.contains(event.relatedTarget)
        || popup?.contains(
          event.relatedTarget
        ))) return;
    queueMicrotask(() => {
      const active = popup ? getPopupActiveElement(popup) : input?.ownerDocument.activeElement;
      if (!input?.isConnected
        || active
        && (rootElement?.contains(active)
          || popup?.contains(
            active
          ))) return;
      focused = false;
      field?.onBlur();
      if (visible || dirty)
        finish(false);
      if (time && !preserveInvalidOnBlur) {
        text = formatPicker(draft, actualLocale.locale, formats);
        invalidTimeInput = false;
      }
    });
  }
  function resetTimeValue() {
    const changed = !timePickerSameValue(draft, mergedValue);
    setDraft(mergedValue, 'time');
    if (changed) text = formatPicker(draft, actualLocale.locale, formats);
    dirty = false;
  }
  function syncTimePickerValue(next: Dayjs, source: 'reset' | 'panel') {
    const previous = panel;
    if (pickerValue === undefined) internalPanel = next;
    if (previous.hour() !== next.hour() || previous.minute() !== next.minute()
      || previous.second() !== next.second())
      time?.onPickerValueChange?.(next, { source, mode: 'time' });
  }
  function handleTimeHover(next: Dayjs | null) {
    if (!time || time.previewValue === false) return;
    hoverValue = next;
    if (!next) text = formatPicker(draft, actualLocale.locale, formats);
  }
  function handleRootClick(event: MouseEvent & { currentTarget: EventTarget & HTMLDivElement; }) {
    if (!time || blocked) return;
    if (!rootElement?.contains(event.currentTarget.ownerDocument.activeElement)) input?.focus();
    requestOpen(true);
    (time.onclick ?? time.onClick)?.(event);
  }
  function selectPreset(preset: TimePickerPreset) {
    const next = typeof preset.value === 'function' ? preset.value() : preset.value;
    timeInteraction.reset();
    setDraft(next, 'time');
    if (commit(next)) requestOpen(false);
  }
  export function focus(options?: FocusOptions & { cursor?: 'start' | 'end' | 'all'; }) {
    input?.focus(options);
    if (options?.cursor) {
      const end = input?.value.length ?? 0;
      input?.setSelectionRange(
        options.cursor === 'end' ? end : 0,
        options.cursor === 'start' ? 0 : end
      );
    }
  }
  export function blur() {
    input?.blur();
  }
</script>
<style>
  .ant-picker-dropdown { position:fixed;margin:0;padding:0;border:0;background:transparent;overflow:visible; }
  .ant-picker-clear { padding:0;border:0;background:transparent;cursor:pointer; }
  .ant-picker-clear:focus-visible { opacity:1;outline:2px solid var(--ant-color-primary); }
  .ant-picker-now-btn, .ant-picker-today-btn { padding:0;border:0;background:transparent;color:var(--ant-color-link);font:inherit;cursor:pointer; }
  .ant-picker-now-btn:disabled, .ant-picker-today-btn:disabled { color:var(--ant-color-text-disabled);cursor:not-allowed; }
  .ant-picker-presets button { width:100%;padding:0;border:0;background:transparent;color:inherit;font:inherit;text-align:inherit;cursor:pointer; }
</style>
{#snippet timePanelLayout()}
  <div class="ant-picker-panel-layout">
    {#if time?.presets?.length}
      <div class="ant-picker-presets"><ul>
        {#each time.presets as preset, index (index)}
          <li>
            <button
              type="button"
              onmouseenter={() => handleTimeHover(typeof preset.value === 'function'
                ? preset.value() : preset.value)}
              onmouseleave={() => handleTimeHover(null)}
              onclick={() => selectPreset(preset)}
            >{#if typeof preset.label === 'function'}{@render preset.label()}
            {:else}{preset.label}{/if}</button>
          </li>
        {/each}
      </ul></div>
    {/if}
    <div>
      <div
        class={['ant-picker-panel', config.direction === 'rtl' && 'ant-picker-panel-rtl']}
        tabindex="-1"
      >
        {#if timeLocale}<PickerTimePanel
          value={draft || clock.defaultOpenValue || null}
          pickerValue={panel}
          config={clock}
          locale={timeLocale}
          {now}
          {disabledTime}
          onSelect={selectTime}
          onHover={handleTimeHover}
          onConfirm={confirm ? () => timeInteraction.trigger(0, 'confirm') : undefined}
          cellRender={time?.cellRender}
          class={semantic?.classes.popup.content}
          style={semantic?.styles.popup.content}
          itemClass={semantic?.classes.popup.item}
          itemStyle={semantic?.styles.popup.item}
        />{/if}
      </div>
      {#if confirm || showNow || renderExtraFooter}
        <div
          class={['ant-picker-footer', semantic?.classes.popup.footer]}
          style={semantic?.styles.popup.footer}
        >
          {#if renderExtraFooter}
            <div class="ant-picker-footer-extra">{@render renderExtraFooter()}</div>
          {/if}
          {#if confirm || showNow}<ul class="ant-picker-ranges">
            {#if showNow}<li class="ant-picker-now"><button
              type="button"
              class="ant-picker-now-btn"
              disabled={time && timePickerDateDisabled(now, time)}
              onclick={() => {
                if (!time) return;
                const next = timePickerValidTime(adapter.getNow(), time);
                timeInteraction.reset();
                setDraft(next, 'time');
                if (commit(next)) requestOpen(false);
              }}
            >{actualLocale.now}</button></li>{/if}
            {#if confirm}<li class="ant-picker-ok"><Button
              type="primary"
              size="small"
              disabled={!valid(draft || clock.defaultOpenValue || null)}
              onclick={() => finish(true)}
              children={actualLocale.ok}
            /></li>{/if}
          </ul>{/if}
        </div>
      {/if}
    </div>
  </div>
{/snippet}

{#snippet clearButton()}
  {#if (time ? timeAllowClear : allowClear)
      && (time ? hoverValue || draft : mergedValue) && !blocked}
    <button
      type="button"
      class="ant-picker-clear"
      aria-label={actualLocale.clear}
      onpointerdown={event => event.preventDefault()}
      onclick={event => {
        if (time) {
          event.stopPropagation();
          timeInteraction.reset();
        }
        commit(null);
        if (!time) onClear?.();
        requestOpen(false);
        input?.focus();
        if (time) onClear?.();
      }}
    >{#if time && typeof clearContent === 'function'}{@render clearContent()}
    {:else if time && (clearContent === null
        || typeof clearContent === 'boolean' || clearContent === '')}<span class="ant-picker-clear-btn"></span>
    {:else if time && clearContent !== undefined}{clearContent}
    {:else}<Icon name="close-circle-filled" />{/if}</button>
  {/if}
{/snippet}

<div bind:this={rootElement} role={time ? 'presentation' : 'group'} style={
    componentTheme.style || time
      ? [componentTheme.style, time && semantic?.styles.root, style].filter(Boolean).join(';')
      : style}
  dir={config.direction} onfocusout={blurWithin} onclick={time ? handleRootClick : undefined}
  class={[
      'ant-picker ant-picker-css-var',
      componentTheme.className,
      `ant-picker-${actualVariant}`,
      blocked && 'ant-picker-disabled',
      visible && 'ant-picker-open',
      focused && 'ant-picker-focused',
      resolvedSize === 'large' && 'ant-picker-large',
      resolvedSize === 'small' && 'ant-picker-small',
      resolvedStatus && `ant-picker-status-${resolvedStatus}`,
      config.direction === 'rtl' && 'ant-picker-rtl',
      compactClasses('ant-picker', config.direction, compact),
      time && config.timePicker?.class,
      semantic?.classes.root,
      className,
      rootClassName
    ]}>
  {#if time && time.prefix !== undefined && time.prefix !== null
      && typeof time.prefix !== 'boolean' && time.prefix !== ''}
    <div
      class={['ant-picker-prefix', semantic?.classes.prefix]}
      style={semantic?.styles.prefix}
    >{#if typeof time.prefix === 'function'}{@render time.prefix()}{:else}{time.prefix}{/if}</div>
  {/if}
  <div class={['ant-picker-input', time && hoverValue && 'ant-picker-input-placeholder']}>
    <input
      {...attributes}
      bind:this={input}
      id={id ?? field?.id}
      name={name ?? field?.name}
      placeholder={placeholderText}
      type="text"
      role="combobox"
      aria-haspopup="dialog"
      aria-expanded={visible}
      aria-controls={`ant-picker-${generatedId}`}
      aria-invalid={invalid
        || field?.invalid
        || resolvedStatus === 'error'
        || attributes['aria-invalid']
        || undefined} aria-describedby={[attributes['aria-describedby'], field?.describedBy].filter(
            Boolean
          )
            .join(
              ' '
            )
            || undefined}
      class={semantic?.classes.input}
      style={semantic?.styles.input}
      size={timeInputSize}
      disabled={blocked}
      readonly={readOnly}
      required={attributes.required ?? field?.required}
      autocomplete="off"
      value={displayText}
      oninput={event => {
          if (!time) requestOpen(true);
          text = event.currentTarget.value;
          dirty = true;
          draftSource = 'input';
          const parsed = parsePicker(text, actualLocale.locale, formats);
          if (time) {
            invalidTimeInput = text !== '' && !parsed?.isValid();
            timeInteraction.trigger(0, 'input', parsed?.isValid() ? [parsed] : undefined);
          } else if (valid(parsed)) {
            setDraft(parsed, 'date');
            internalPanel = parsed!;
          }
        }}
      onclick={() => { if (!time) requestOpen(true); }} onkeydown={keyboard} onfocus={event => {
          focused = true;
          if (time) timeInteraction.trigger(0, 'field-switch');
          onfocus?.(event);
        }} onblur={event => {
            onblur?.(event);
            blurWithin(event);
          }} />
    {#if !time || suffixContent !== false && suffixContent !== null && suffixContent !== ''}
      <span
        class={['ant-picker-suffix', semantic?.classes.suffix]}
        style={semantic?.styles.suffix}
        aria-hidden="true"
      >
        {#if !time}<PickerCalendarIcon />
        {:else if typeof suffixContent === 'function'}{@render suffixContent()}
        {:else if suffixContent === undefined || suffixContent === true}<PickerClockIcon />
        {:else}{suffixContent}{/if}
      </span>
    {/if}
    {#if time}{@render clearButton()}{/if}
  </div>
  {#if !time}{@render clearButton()}{/if}
</div>
<NoCompactStyle>
  {#key container.target}
  {#if visible}
    {@const initialPopupStyle = untrack(() => popupThemeStyle)}
    <div bind:this={popup} id={`ant-picker-${generatedId}`} popover="manual" role="dialog" aria-label={attributes['aria-label'] ?? (time ? placeholderText || actualLocale.timeSelect : actualLocale.placeholder)} hidden={!shown} onfocusout={blurWithin} class={[
        'ant-picker-dropdown ant-picker-css-var',
        componentTheme.className,
        config.direction === 'rtl' && 'ant-picker-dropdown-rtl',
        `ant-picker-dropdown-placement-${popupPlacement === 'top' ? 'top' : 'bottom'}${actualPlacement.endsWith('Right') ? 'Right' : 'Left'}`,
        time ? semantic?.classes.popup.root : classNames?.popup?.root,
        time && rootClassName
      ]} style={initialPopupStyle}
      {@attach node => connectComponentTheme(node, popupThemeStyle)} {@attach container.portal}>
      {#if time}
        <div
          class={['ant-picker-panel-container', semantic?.classes.popup.container]}
          style={semantic?.styles.popup.container}
        >
          {#if time.panelRender}{@render time.panelRender(timePanelLayout)}
          {:else}{@render timePanelLayout()}{/if}
        </div>
      {:else}
      <div class="ant-picker-panel-container"><div class="ant-picker-panel-layout"><div><div class="ant-picker-panel" tabindex="-1">
        <div class={showTime && mode === 'date'
            ? 'ant-picker-datetime-panel'
            : undefined}>
          <DatePickerCalendar {panel} selected={draft} direction={config.direction} {mode} locale={actualLocale} {restrictions} {now} onSelect={selectDate} onNavigate={navigate} onModeChange={changeMode} />
          {#if showTime && mode === 'date'}<DatePickerTimePanel value={draft ?? clock.defaultOpenValue ?? panel} selectedValue={draft} config={clock} format={timeFormat} locale={actualLocale.locale} {disabledTime} onSelect={selectTime} />{/if}
        </div>
        {#if renderExtraFooter}<div class="ant-picker-footer-extra">{@render renderExtraFooter()}</div>{/if}
        {#if mode === 'date' && (confirm || showNow)}<div class="ant-picker-footer">
          {#if confirm || showTime}<ul class="ant-picker-ranges">
            {#if showNow}<li class="ant-picker-now"><button type="button" class="ant-picker-now-btn" disabled={pickerDateDisabled(now, restrictions)} onclick={() => {
                const next = validPickerTime(adapter.getNow(), clock, disabledTime);
                if (commit(next)) {
                  requestOpen(false);
                  input?.focus();
                }
              }}>{actualLocale.now}</button></li>{/if}
            {#if confirm}<li class="ant-picker-ok"><Button type="primary" size="small"
              disabled={!valid(draft)} onclick={() => {
                finish(true);
                input?.focus();
              }} children={actualLocale.ok} /></li>{/if}
          </ul>{:else if showNow}<button type="button" class="ant-picker-today-btn" disabled={pickerDateDisabled(now, restrictions)} onclick={() => {
              const next = validPickerTime(adapter.getNow());
              if (commit(next))
                requestOpen(false);
            }}>{actualLocale.today}</button>{/if}
        </div>{/if}
      </div></div></div></div>
      {/if}
    </div>
  {/if}
  {/key}
</NoCompactStyle>
