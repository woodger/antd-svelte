<script lang="ts">
  import { onMount, tick, untrack } from 'svelte';
  import type { Dayjs } from 'dayjs';
  import type { RangePickerProps, RangePickerValue } from './range-picker.types';
  import type { DatePickerMode, DatePickerTimeConfig } from './date-picker.types';
  import {
    createRangeInteraction,
    type RangeInteractionSource
  } from './range-picker-interaction.engine';
  import {
    rangePair,
    rangeFlags,
    sameRange,
    rangeFrom,
    orderedRange,
    validRange
  } from './range-picker.engine';
  import {
    pickerFormats,
    formatPicker,
    parsePicker,
    pickerDateDisabled,
    pickerTimeDisabled,
    validPickerTime
  } from './date-picker.engine';
  import { dayjsGenerateConfig as adapter } from './date-picker-dayjs.engine';
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
  import PickerRangeSeparator from './PickerRangeSeparator.svelte';
  import PickerClockIcon from './PickerClockIcon.svelte';
  import PickerTimePanel from './PickerTimePanel.svelte';
  import {
    datePickerClock, timePickerFormats, timePickerLang, timePickerSameValue
  } from './time-picker.engine';
  import {
    sameTimeRange,
    samePickerTime,
    timeRangeClock,
    timeRangeInvalid,
    validTimeRange
  } from './time-range-picker.engine';
  import { timePickerDateDisabled } from './time-picker.engine';
  import { timeRangeSemantic } from './time-range-picker-semantic.engine';
  import type { TimeRangePickerProps } from './time-range-picker.types';
  import { connectTimeRangePopup } from './time-range-picker-popup.dom';
  let {
    time,
    value,
    defaultValue,
    disabled,
    allowEmpty = false,
    order = true,
    id,
    name,
    placeholder,
    showTime = false,
    format,
    disabledDate,
    disabledTime,
    minDate,
    maxDate,
    defaultPickerValue,
    pickerValue,
    open,
    defaultOpen = false,
    needConfirm,
    showNow,
    allowClear = true,
    inputReadOnly,
    preserveInvalidOnBlur = false,
    onChange,
    onCalendarChange,
    onOk,
    onClear,
    onPickerValueChange,
    onOpenChange,
    onPanelChange,
    onfocus,
    onblur,
    onkeydown,
    renderExtraFooter,
    separator,
    presets,
    previewValue = 'hover',
    placement,
    size,
    status,
    variant,
    locale,
    class: className = '',
    rootClassName = '',
    classNames,
    getPopupContainer,
    style,
    nativeElement = $bindable(),
    startInput = $bindable(),
    endInput = $bindable(),
    ...attributes
  }: RangePickerProps & { time?: TimeRangePickerProps; } = $props();
  const config = useConfig();
  const variantContext = useVariant('rangePicker', () => ({
    variant
  }));
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
  const initial = untrack(() => rangePair(defaultValue));
  let internalValue = $state.raw<RangePickerValue>(initial);
  let committed = $derived(value === undefined ? internalValue : rangePair(value));
  let blocked = $derived(
    rangeFlags(disabled ?? field?.disabled ?? form?.disabled ?? config.componentDisabled)
  );
  let empty = $derived(rangeFlags(allowEmpty));
  let confirm = $derived(needConfirm ?? Boolean(showTime));
  let internalOpen = $state(untrack(() => defaultOpen));
  let visible = $derived((open ?? internalOpen) && !blocked.every(Boolean));
  let lang = $derived(
    { ...datePickerEnUS.lang, ...config.locale.datePicker?.lang, ...locale?.lang }
  );
  let formatConfig = $derived(
    {
      format,
      showTime: typeof showTime === 'object'
        ? { ...showTime, defaultOpenValue: undefined }
        : showTime
    }
  );
  let formats = $derived(time ? timePickerFormats(time, lang) : pickerFormats(formatConfig, lang));
  let readOnly = $derived(
    time && typeof formats[0] === 'function'
      || (inputReadOnly ?? (attributes.readonly
        || formats.every(item => typeof item === 'function')))
  );
  let calendar = $state.raw<RangePickerValue>(
    untrack(() => value === undefined ? [...initial] : rangePair(value))
  );
  let submit = $state.raw<RangePickerValue>(untrack(() => [...calendar]));
  let texts = $state<[string, string]>(untrack(() => dateTexts(calendar)));
  let rawInvalid = $state<[boolean, boolean]>([false, false]);
  let revision = $state(0);
  const interaction = createRangeInteraction<Dayjs>({
    fieldCount: () => blocked.filter(item => !item).length,
    needConfirm: () => confirm,
    allowEmpty: () => empty,
    getCalendarValue: () => calendar,
    triggerCalendarChange: (index, next) => {
      const copy: RangePickerValue = [...calendar];
      copy[index] = next;
      changeCalendar(copy);
    },
    flushSubmit: (index, all) => {
      const copy: RangePickerValue = [...submit];
      copy[index] = calendar[index];
      submit = copy;
      if (all) {
        commit(copy);
        requestOpen(false);
      }
    },
    resetValue: index => {
      if (index === undefined) {
        changeCalendar(committed);
        submit = [...committed];
      } else {
        const copy: RangePickerValue = [...calendar];
        copy[index] = committed[index];
        changeCalendar(copy);
        const next: RangePickerValue = [...submit];
        next[index] = committed[index];
        submit = next;
      }
    }
  });
  let active = $derived.by(() => {
    void revision;
    return interaction.activeIndex;
  });
  let clock = $derived.by((): DatePickerTimeConfig => {
    if (time) return timeRangeClock(time, lang, active);
    const raw = typeof showTime === 'object' ? showTime : {};
    return datePickerClock({
      format,
      showTime: { ...raw, defaultOpenValue: raw.defaultOpenValue?.[active] }
    }, lang);
  });
  let timeFormat = $derived(
    clock.format ?? (typeof formats[0] === 'string' ? formats[0] : 'HH:mm:ss')
  );
  let focused = $state(false);
  let shown = $state(false);
  let rootElement = $state<HTMLDivElement>();
  let startElement = $state<HTMLInputElement>();
  let endElement = $state<HTMLInputElement>();
  let popup = $state<HTMLDivElement>();
  let timeWrapper = $state<HTMLDivElement>();
  let timeContainer = $state<HTMLDivElement>();
  let timePosition = $state({ arrow: 0, offset: 0 });
  let now = $state.raw(untrack(() => adapter.getNow()));
  let panels = $state.raw<[Dayjs, Dayjs]>(untrack(() => {
    const base = initialPanel(0);
    return [base, initialPanel(1)];
  }));
  let view = $derived(panelValues()[active]);
  let mode = $state<DatePickerMode>('date');
  let showCurrent = $derived((showNow ?? false) && mode === 'date');
  let hover = $state.raw<Dayjs | null>(null);
  let presetHover = $state.raw<RangePickerValue | null>(null);
  let displayRange = $derived.by((): RangePickerValue => {
    const pair: RangePickerValue = presetHover && previewValue ? [...presetHover] : [...calendar];
    if (hover && previewValue)
      pair[active] = hover;
    return pair[0] && pair[1] && pair[0].isAfter(pair[1]) ? [pair[1], pair[0]] : pair;
  });
  let displayedTexts = $derived.by(() => {
    const pair = presetHover && previewValue ? dateTexts(presetHover) : [...texts];
    if (hover && previewValue)
      pair[active] = formatPicker(hover, lang.locale, formats);
    return pair;
  });
  let bar = $state({ left: 0, width: 0 });
  let actualPlacement = $derived(
    placement ?? (config.direction === 'rtl' ? 'bottomRight' : 'bottomLeft')
  );
  let verticalPlacement = $state<'top' | 'bottom'>('bottom');
  let resolvedSize = $derived(size ?? compact?.size ?? config.componentSize);
  let resolvedStatus = $derived((time ? time.status : status) ?? field?.status);
  let resolvedVariant = $derived(variantContext.variant);
  let resolvedSeparator = $derived(separator ?? config.rangePicker?.separator);
  let semantic = $derived(time ? timeRangeSemantic(time, config.timePicker, config.rangePicker, {
    size: resolvedSize,
    disabled: disabled ?? field?.disabled ?? form?.disabled ?? config.componentDisabled
  }) : undefined);
  let timeLocale = $derived(time ? timePickerLang(time, lang) : undefined);
  let timePlaceholder = $derived.by(() => {
    if (!time) return undefined;
    if (time.placeholder !== undefined) return Array.isArray(time.placeholder)
      ? time.placeholder : [time.placeholder, time.placeholder];
    return locale?.timePickerLocale?.rangePlaceholder
      ?? config.locale.datePicker?.timePickerLocale?.rangePlaceholder
      ?? datePickerEnUS.timePickerLocale.rangePlaceholder;
  });
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
  let timeInputSize = $derived.by(() => {
    if (!time) return undefined;
    const first = formats[0];
    return Math.max(8, typeof first === 'function' ? first(now).length : first.length) + 2;
  });
  let previousVisible = untrack(() => visible);
  let previousCommitted = untrack(() => committed);
  let previousValue = untrack(() => value);
  let timeStartText = $derived(time ? formatPicker(calendar[0], lang.locale, formats) : undefined);
  let timeEndText = $derived(time ? formatPicker(calendar[1], lang.locale, formats) : undefined);
  let timePanelWasOpen = false;
  let previousTimeActive = -1;
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
    startInput = startElement;
    return () => { startInput = undefined; };
  });
  $effect(() => {
    endInput = endElement;
    return () => { endInput = undefined; };
  });
  $effect(() => {
    if (time && value !== previousValue) internalValue = rangePair(value);
    previousValue = value;
  });
  $effect(() => {
    if (time && committed === previousCommitted) return;
    calendar = [...committed];
    submit = [...committed];
    texts = dateTexts(committed);
    previousCommitted = committed;
  });
  $effect(() => {
    if (timeStartText !== undefined) {
      const text = timeStartText;
      untrack(() => { texts = [text, texts[1]]; });
    }
  });
  $effect(() => {
    if (timeEndText !== undefined) {
      const text = timeEndText;
      untrack(() => { texts = [texts[0], text]; });
    }
  });
  $effect(() => {
    const next = visible;
    if (previousVisible && !next) {
      untrack(() => send(interaction.currentIndex ?? active, 'popupClose'));
      if (!time && !preserveInvalidOnBlur)
        texts = dateTexts(calendar);
    }
    previousVisible = next;
  });
  $effect(() => {
    if (!time) return;
    const opened = visible;
    const index = active;
    void calendar[index];
    if (opened) untrack(() => syncTimePanel(index,
      !timePanelWasOpen || previousTimeActive !== index));
    timePanelWasOpen = opened;
    previousTimeActive = index;
  });
  $effect(() => {
    void revision;
    const index = interaction.currentIndex;
    const view = rootElement?.ownerDocument.defaultView;
    if (!time || index === null || !interaction.forceFocus || !view) return;

    // React useFocusLock выполняет сильный переход после native focus внешнего клика.
    const frame = view.requestAnimationFrame(() => {
      if (interaction.currentIndex !== index || !interaction.forceFocus) return;
      requestOpen(true);
      inputs()[index]?.focus();
    });
    return () => view.cancelAnimationFrame(frame);
  });
  $effect(() => {
    if (blocked.every(Boolean)) {
      internalOpen = false;
      if (time) return;
      interaction.reset();
      revision = untrack(() => revision + 1);
      calendar = [...committed];
      texts = dateTexts(committed);
    }
  });
  $effect(() => {
    if (visible && blocked[active])
      untrack(() => send(blocked.findIndex(item => !item), 'field-switch'));
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
      onPlacement: next => {
        verticalPlacement = next === 'top' ? 'top' : 'bottom';
      },
      onVisibilityChange: next => {
        shown = next;
      },
      onDismiss: reason => {
        if (reason === 'escape') {
          send(active, 'esc');
          inputs()[active]?.focus();
        }
        requestOpen(false);
      }
    });
  });
  $effect(() => {
    if (!time || !visible || !rootElement || !timeWrapper || !timeContainer) return;
    return connectTimeRangePopup(rootElement, timeWrapper, timeContainer,
      () => inputs()[active], () => config.direction === 'rtl', (arrow, offset) => {
        timePosition = { arrow, offset };
      });
  });
  $effect(() => {
    const root = rootElement;
    const input = inputs()[active];
    if (!root || !input) return;
    function measure() {
      const rect = input!.getBoundingClientRect();
      const parent = root!.getBoundingClientRect();
      bar = { left: rect.left - parent.left, width: rect.width };
    }
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    observer.observe(input);
    measure();
    return () => observer.disconnect();
  });
  function inputs() {
    return [startElement, endElement];
  }
  function dateTexts(pair: RangePickerValue): [string, string] {
    return [
      formatPicker(pair[0], lang.locale, formats),
      formatPicker(pair[1], lang.locale, formats)
    ];
  }
  function initialPanel(index: number): Dayjs {
    const defaults = Array.isArray(defaultPickerValue)
      ? defaultPickerValue
      : [defaultPickerValue, defaultPickerValue];
    return defaults[index]
      ?? (value === undefined
        ? initial
        : value)?.[index]
      ?? (!time ? (value === undefined
        ? initial
        : value)?.[index ^ 1] : undefined)
      ?? (time ? adapter.getNow().startOf('day') : adapter.getNow());
  }
  function panelValues(): [Dayjs, Dayjs] {
    return pickerValue
      ? Array.isArray(pickerValue) ? pickerValue : [pickerValue, pickerValue]
      : panels;
  }
  function from() {
    return rangeFrom(calendar, interaction.triggeredFields, active);
  }
  function timeRestriction(date: Dayjs) {
    if (time) return time.disabledTime?.(date, active === 1 ? 'end' : 'start', {
      from: from()
    }) ?? {};
    return disabledTime?.(date, active === 1 ? 'end' : 'start', { from: from() }) ?? {};
  }
  function invalid(date: Dayjs, index: number, reference?: Dayjs, type: DatePickerMode = 'date') {
    if (time) return timeRangeInvalid(date, time, clock, index,
      reference === undefined ? undefined : { from: reference });
    const other = calendar[index ^ 1];
    const same = other
      && (type === 'decade'
        ? Math.floor(other.year() / 10) === Math.floor(date.year() / 10)
        : other.isSame(date, type === 'date' ? 'day' : type));
    if (blocked[index ^ 1]
      && other
      && !same
      && (index === 1
        ? other.isAfter(date)
        : date.isAfter(other))) return true;
    if (pickerDateDisabled(
      date,
      {
        minDate,
        maxDate,
        disabledDate: next => Boolean(disabledDate?.(next, { type, from: reference }))
      },
      type
    )) return true;
    const config = typeof showTime === 'object'
      ? { ...showTime, defaultOpenValue: undefined }
      : showTime;
    return pickerTimeDisabled(
      date,
      {
        showTime: config,
        disabledTime: next => disabledTime?.(
          next,
          index === 1 ? 'end' : 'start',
          { from: reference }
        )
          ?? {}
      }
    );
  }
  function panelDisabled(date: Dayjs, info: { type: DatePickerMode; }) {
    const other = calendar[active ^ 1];
    const same = other
      && (info.type === 'decade'
        ? Math.floor(other.year() / 10) === Math.floor(date.year() / 10)
        : other.isSame(date, info.type === 'date' ? 'day' : info.type));
    return Boolean(
      blocked[active ^ 1]
      && other
      && !same
      && (active === 1
        ? other.isAfter(date)
        : date.isAfter(other))
      || disabledDate?.(
        date,
        { ...info, from: from() }
      )
    );
  }
  function changeCalendar(next: RangePickerValue) {
    const sameDate = time ? timePickerSameValue : (a: Dayjs | null, b: Dayjs | null) =>
      a?.valueOf() === b?.valueOf();
    const changed = time ? !sameTimeRange(calendar, next) : !sameRange(calendar, next);
    const part = sameDate(calendar[0], next[0]) ? 'end' : 'start';
    if (changed) {
      const nextTexts: [string, string] = [...texts];
      for (const index of [0, 1])
        if (!sameDate(calendar[index], next[index]))
          nextTexts[index] = formatPicker(next[index], lang.locale, formats);
      calendar = [...next];
      texts = nextTexts;
    }
    if (changed)
      onCalendarChange?.([...next], dateTexts(next), { range: part });
  }
  function commit(next: RangePickerValue | null) {
    const pair: RangePickerValue = next === null
      ? [blocked[0] ? submit[0] : null, blocked[1] ? submit[1] : null]
      : orderedRange(next, order, blocked);
    changeCalendar(pair);
    const passed = next === null || (time
      ? validTimeRange(pair, empty, order, blocked,
        (date, index, info) => timeRangeInvalid(date, time, clock, index, info))
      : validRange(pair, empty, order, blocked, invalid));
    if (passed) {
      const changed = time ? !sameTimeRange(pair, committed) : !sameRange(pair, committed);
      if (time || value === undefined)
        internalValue = [...pair];
      if (changed)
        onChange?.(
          next === null && pair.every(item => !item) ? null : [...pair],
          pair.every(item => !item) ? null : dateTexts(pair)
        );
    }
    return passed;
  }
  function requestOpen(next: boolean) {
    if (next && blocked.every(Boolean) || next === visible) return;
    if (next) {
      now = adapter.getNow();
      if (!time) syncPanel(active, 'reset', false);
    }
    else {
      hover = null;
      presetHover = null;
    }
    if (open === undefined)
      internalOpen = next;
    onOpenChange?.(next);
  }
  function syncPanel(index: number, source: 'reset' | 'panel', preserve: boolean, target?: Dayjs) {
    if (time) {
      if (target) setTimePanel(index, target, source);
      return;
    }
    const defaults = Array.isArray(defaultPickerValue)
      ? defaultPickerValue
      : [defaultPickerValue, defaultPickerValue];
    let next = target
      ?? defaults[index]
      ?? (preserve
        ? panelValues()[index ^ 1]
        : calendar[index] ?? calendar[index ^ 1] ?? now);
    if (!showTime
      && index === 1
      && !preserve
      && calendar[0]
      && calendar[1]
      && !calendar[1].isSame(
        calendar[0],
        'month'
      )
      && !calendar[1].isSame(
        calendar[0].add(1, 'month'),
        'month'
      ))
      next = calendar[1].add(-1, 'month');
    if (minDate && next.isBefore(minDate))
      next = minDate;
    if (maxDate && (showTime ? next : next.add(1, 'month')).isAfter(maxDate))
      next = showTime ? maxDate : maxDate.add(-1, 'month');
    const pair: [Dayjs, Dayjs] = [...panelValues()];
    pair[index] = next;
    if (!pickerValue)
      panels = pair;
    onPickerValueChange?.(pair, {
      range: index === 1
        ? 'end'
        : 'start',
      source,
      mode: [mode, mode]
    });
  }
  function send(index: number, source: RangeInteractionSource, next?: Dayjs | null) {
    const previous = interaction.activeIndex;
    interaction.trigger(index, source, next);
    revision++;
    if (interaction.activeIndex !== previous) {
      hover = null;
      mode = 'date';
      syncPanel(interaction.activeIndex, 'reset', true);
    }
    const target = interaction.currentIndex;
    if (!time && target !== null && interaction.forceFocus) {
      requestOpen(true);
      void tick().then(() => {
        if (interaction.currentIndex === target && visible && inputs()[target]?.isConnected)
          inputs()[target]?.focus();
      });
    }
  }
  function focusField(index: number) {
    focused = true;
    send(index, 'field-switch');
    if (!time) requestOpen(true);
    const accepted = interaction.currentIndex;
    if (accepted !== null && accepted !== index)
      void tick().then(() => {
        if (visible && inputs()[index]?.ownerDocument.activeElement === inputs()[index])
          inputs()[accepted]?.focus();
      });
  }
  function blurInput(
    index: number,
    event: FocusEvent & { currentTarget: EventTarget & HTMLInputElement; }
  ) {
    if (!preserveInvalidOnBlur && (time ? rawInvalid[index] : inputInvalid(index))) {
      const copy: [string, string] = [...texts];
      copy[index] = formatPicker(calendar[index], lang.locale, formats);
      texts = copy;
      if (time) {
        const errors: [boolean, boolean] = [...rawInvalid];
        errors[index] = false;
        rawInvalid = errors;
      }
    }
    if (time) (time.onblur ?? time.onBlur)?.(event, { range: index === 1 ? 'end' : 'start' });
    else onblur?.(event);
    blurWithin(event);
  }
  function blurWithin(event: FocusEvent) {
    if (event.relatedTarget instanceof Node
      && (rootElement?.contains(event.relatedTarget)
        || popup?.contains(
          event.relatedTarget
        ))) return;
    queueMicrotask(() => {
      const current = popup ? getPopupActiveElement(popup)
        : startElement?.ownerDocument.activeElement;
      if (!startElement?.isConnected
        || current
        && (rootElement?.contains(current)
          || popup?.contains(
            current
          ))) return;
      focused = false;
      field?.onBlur();
      requestOpen(false);
    });
  }
  function selectDate(date: Dayjs) {
    if (mode !== 'date') {
      syncPanel(active, 'panel', false, date);
      mode = mode === 'decade' ? 'year' : mode === 'year' ? 'month' : 'date';
      onPanelChange?.([...calendar], [mode, mode]);
      return;
    }
    const base = calendar[active] ?? clock.defaultOpenValue ?? view;
    const next = showTime
      ? validPickerTime(
        base.year(date.year()).month(date.month()).date(date.date()),
        clock,
        timeRestriction
      )
      : date;
    send(active, showTime ? 'panel-intermediate' : 'panel-final', next);
  }
  function selectTime(date: Dayjs) {
    send(active, 'panel-intermediate', time ? date : validPickerTime(date, clock, timeRestriction));
    if (time) setTimePanel(active, date, 'panel');
  }
  function inputChange(index: number, text: string) {
    focusField(index);
    if (time && text && text !== formatPicker(calendar[index], lang.locale, formats))
      requestOpen(true);
    const copy: [string, string] = [...texts];
    copy[index] = text;
    texts = copy;
    const next = text ? parsePicker(text, lang.locale, formats) : null;
    if (time) {
      const errors: [boolean, boolean] = [...rawInvalid];
      errors[index] = !!text && !next;
      rawInvalid = errors;
      send(index, 'input', next ?? undefined);
      return;
    }
    if (!text || next && !invalid(next, index, from())) {
      send(index, 'input', next);
      if (next)
        syncPanel(index, 'reset', false, next);
    }
    else send(index, 'input');
  }
  function inputInvalid(index: number) {
    if (time) return rawInvalid[index] || !!calendar[index]
      && timeRangeInvalid(calendar[index]!, time, clock, index);
    return !readOnly
      && Boolean(
        texts[index]
        && (!parsePicker(texts[index], lang.locale, formats)
          || invalid(
            parsePicker(texts[index], lang.locale, formats)!,
            index,
            from()
          ))
      );
  }
  async function keyboard(
    event: KeyboardEvent & { currentTarget: EventTarget & HTMLInputElement; },
    index: number
  ) {
    if (time) {
      if (event.key === 'Tab') send(active, 'keyboard-submit-weak');
      else if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        send(active, 'esc');
        requestOpen(false);
      }
      (time.onkeydown ?? time.onKeyDown)?.(event);
      if (event.defaultPrevented || event.isComposing || blocked[index]) return;
      if (event.key === 'Enter') {
        event.preventDefault();
        if (parsePicker(texts[index], lang.locale, formats)) send(index, 'keyboard-submit');
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        requestOpen(true);
        await tick();
        (popup?.querySelector<HTMLButtonElement>(
          '.ant-picker-time-panel-cell-selected button:not(:disabled)'
        ) ?? popup?.querySelector<HTMLButtonElement>(
          'button[data-picker-time-control]:not(:disabled)'
        ))?.focus();
      }
      return;
    }
    onkeydown?.(event);
    if (event.defaultPrevented || event.isComposing || blocked[index]) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      send(index, 'esc');
      requestOpen(false);
    }
    else if (event.key === 'Enter') {
      event.preventDefault();
      if (!visible) {
        focusField(index);
        requestOpen(true);
      } else if (!inputInvalid(index))
        send(index, 'keyboard-submit');
    }
    else if (event.key === 'Tab') {
      if (!inputInvalid(index))
        send(index, 'keyboard-submit-weak');
    }
    else if (event.key === 'ArrowDown') {
      event.preventDefault();
      requestOpen(true);
      await tick();
      (popup?.querySelector<HTMLButtonElement>(
        `[data-picker-date="${view.format('YYYY-MM-DD')}"]:not(:disabled)`
      )
        ?? popup?.querySelector<
          HTMLButtonElement
        >(
          '[data-picker-date]:not(:disabled)'
        ))?.focus();
    }
  }
  function clear(event?: MouseEvent) {
    if (time) event?.stopPropagation();
    interaction.reset();
    revision++;
    commit(null);
    if (!time) onClear?.();
    requestOpen(false);
    if (time) onClear?.();
  }
  function presetValue(next: RangePickerValue) {
    interaction.reset();
    revision++;
    if (commit(next))
      requestOpen(false);
  }
  function setTimePanel(index: number, next: Dayjs, source: 'reset' | 'panel') {
    const pair = panelValues();
    const changed = !samePickerTime(pair[index], next);
    const copy: [Dayjs, Dayjs] = [...pair];
    copy[index] = next;
    if (!pickerValue) panels = copy;
    if (changed) time?.onPickerValueChange?.(copy, {
      range: index === 1 ? 'end' : 'start', source, mode: ['time', 'time']
    });
  }
  function syncTimePanel(index: number, resetDefault: boolean) {
    const defaults = Array.isArray(defaultPickerValue)
      ? defaultPickerValue : [defaultPickerValue, defaultPickerValue];
    let next: Dayjs | null | undefined;
    if (defaults[index]) {
      if (!resetDefault) return;
      next = defaults[index];
    } else if (focused && timePanelWasOpen && previousTimeActive !== index) {
      next = panelValues()[index ^ 1];
    } else {
      next = calendar[index] || calendar[index ^ 1];
    }
    if (!next) return;
    if (!defaults[index]) {
      if (minDate && next.isBefore(minDate)) next = minDate;
      if (maxDate && next.isAfter(maxDate)) next = maxDate;
    }
    setTimePanel(index, next, 'reset');
  }
  function confirmTime() {
    if (!calendar[active] && clock.defaultOpenValue)
      send(active, 'panel-intermediate', clock.defaultOpenValue);
    onOk?.([...calendar]);
    send(active, 'confirm');
  }
  function timeNowDisabled(date: Dayjs) {
    if (!time) return false;
    const other = calendar[active ^ 1];
    return !!(blocked[active ^ 1] && other && !samePickerTime(other, date)
      && (active === 1 ? other.isAfter(date) : date.isAfter(other)))
      || timePickerDateDisabled(date, {
        minDate, maxDate,
        disabledDate: next => !!time.disabledDate?.(next, { type: 'time', from: from() })
      });
  }
  function handleTimeRootClick(event: MouseEvent & { currentTarget: HTMLDivElement; }) {
    if (!time || blocked.every(Boolean)) return;
    if (!rootElement?.contains(event.currentTarget.ownerDocument.activeElement))
      inputs()[blocked.findIndex(value => !value)]?.focus();
    requestOpen(true);
    (time.onclick ?? time.onClick)?.(event);
  }
  function handleTimePanelFocus(event: FocusEvent) {
    if (!time) return;
    focused = true;
    requestOpen(true);
    (time.onfocus ?? time.onFocus)?.(event, { range: active === 1 ? 'end' : 'start' });
  }
  function handleTimePanelBlur(event: FocusEvent & { currentTarget: HTMLDivElement; }) {
    if (!time) return;
    if (event.target instanceof Element && event.target.hasAttribute('disabled'))
      event.currentTarget.focus({ preventScroll: true });
    else blurWithin(event);
    (time.onblur ?? time.onBlur)?.(event, { range: active === 1 ? 'end' : 'start' });
  }
  function handleTimeHover(next: Dayjs | null) {
    if (previewValue !== 'hover') return;
    hover = next;
    if (!next) {
      const copy: [string, string] = [...texts];
      copy[active] = formatPicker(calendar[active], lang.locale, formats);
      texts = copy;
    }
  }
  export function focus(
    options?: FocusOptions & { index?: 0 | 1; cursor?: 'start' | 'end' | 'all'; }
  ) {
    const input = inputs()[options?.index ?? blocked.findIndex(item => !item)];
    input?.focus(options);
    if (options?.cursor)
      input?.setSelectionRange(
        options.cursor === 'end' ? input.value.length : 0,
        options.cursor === 'start' ? 0 : input.value.length
      );
  }
  export function blur() {
    inputs().forEach(input => input?.blur());
  }
  onMount(() => {
    if (attributes.autofocus)
      focus();
  });
</script>

<style>
  .ant-picker-dropdown { position:fixed;margin:0;padding:0;border:0;background:transparent;overflow:visible; }
  .ant-picker-clear { padding:0;border:0;background:transparent;cursor:pointer; }
  .ant-picker-clear:focus-visible { opacity:1;outline:2px solid var(--ant-color-primary); }
  .ant-picker-now-btn { padding:0;border:0;background:transparent;color:var(--ant-color-link);font:inherit;cursor:pointer; }
  .ant-picker-now-btn:disabled { color:var(--ant-color-text-disabled);cursor:not-allowed; }
  .ant-picker-presets button { border:0;padding:0;background:transparent;color:inherit;font:inherit;cursor:pointer; }
</style>

{#snippet timePanelLayout()}
  <div class="ant-picker-panel-layout">
    {#if presets?.length}<div class="ant-picker-presets"><ul>
      {#each presets as preset, index (index)}<li><button
        type="button"
        onmouseenter={() => {
          if (previewValue) presetHover = rangePair(
            typeof preset.value === 'function' ? preset.value() : preset.value
          );
        }}
        onmouseleave={() => { presetHover = null; }}
        onclick={() => presetValue(rangePair(
          typeof preset.value === 'function' ? preset.value() : preset.value
        ))}
      >{#if typeof preset.label === 'function'}{@render preset.label()}
      {:else}{preset.label}{/if}</button></li>{/each}
    </ul></div>{/if}
    <div>
      <div
        class={['ant-picker-panel', config.direction === 'rtl' && 'ant-picker-panel-rtl']}
        tabindex="-1"
      >
        {#if timeLocale}<PickerTimePanel
          value={calendar[active] || clock.defaultOpenValue || null}
          pickerValue={view}
          config={clock}
          locale={timeLocale}
          {now}
          disabledTime={timeRestriction}
          onSelect={selectTime}
          onHover={handleTimeHover}
          onConfirm={confirm ? () => send(active, 'confirm') : undefined}
          cellRender={time?.cellRender}
          range={active === 1 ? 'end' : 'start'}
          class={semantic?.classes.popup.content}
          style={semantic?.styles.popup.content}
          itemClass={semantic?.classes.popup.item}
          itemStyle={semantic?.styles.popup.item}
        />{/if}
      </div>
      {#if confirm || showCurrent || time?.renderExtraFooter}
        <div
          class={['ant-picker-footer', semantic?.classes.popup.footer]}
          style={semantic?.styles.popup.footer}
        >
          {#if time?.renderExtraFooter}<div class="ant-picker-footer-extra">
            {@render time.renderExtraFooter('time')}
          </div>{/if}
          {#if confirm || showCurrent}<ul class="ant-picker-ranges">
            {#if showCurrent}<li class="ant-picker-now"><button
              type="button"
              class="ant-picker-now-btn"
              disabled={timeNowDisabled(now)}
              onclick={() => send(active, 'confirm', validPickerTime(
                adapter.getNow(), clock, timeRestriction
              ))}
            >{lang.now}</button></li>{/if}
            {#if confirm}<li class="ant-picker-ok"><Button
              type="primary"
              size="small"
              disabled={!calendar[active] && !clock.defaultOpenValue
                || !!(calendar[active] || clock.defaultOpenValue)
                  && invalid((calendar[active] || clock.defaultOpenValue)!, active)}
              onclick={confirmTime}
              children={lang.ok}
            /></li>{/if}
          </ul>{/if}
        </div>
      {/if}
    </div>
  </div>
{/snippet}

<div
  bind:this={rootElement}
  role={time ? 'presentation' : 'group'}
  style={componentTheme.style || time || config.rangePicker?.style
    ? [componentTheme.style, time ? semantic?.styles.root : config.rangePicker?.style,
      style].filter(Boolean).join(';') : style}
  dir={config.direction}
  onfocusout={blurWithin}
  onclick={time ? handleTimeRootClick : undefined}
  class={[
      'ant-picker ant-picker-range ant-picker-css-var',
      componentTheme.className,
      `ant-picker-${resolvedVariant}`,
      blocked.every(Boolean) && 'ant-picker-disabled',
      visible && 'ant-picker-open',
      focused && 'ant-picker-focused',
      texts.some((_, index) => inputInvalid(index)) && 'ant-picker-invalid',
      resolvedSize === 'large' && 'ant-picker-large',
      resolvedSize === 'small' && 'ant-picker-small',
      resolvedStatus && `ant-picker-status-${resolvedStatus}`,
      config.direction === 'rtl' && 'ant-picker-rtl',
      compactClasses('ant-picker', config.direction, compact),
      semantic?.classes.root,
      className,
      config.rangePicker?.class,
      rootClassName
    ]}>
  {#if time?.prefix !== undefined && time.prefix !== null
      && typeof time.prefix !== 'boolean' && time.prefix !== ''}
    <div
      class={['ant-picker-prefix', semantic?.classes.prefix]}
      style={semantic?.styles.prefix}
    >{#if typeof time.prefix === 'function'}{@render time.prefix()}{:else}{time.prefix}{/if}</div>
  {/if}
  <div class={[
      'ant-picker-input ant-picker-input-start',
      focused && active === 0 && 'ant-picker-input-active',
      time && previewValue && (presetHover || hover && active === 0)
        && 'ant-picker-input-placeholder'
    ]}>
    <input {...attributes} bind:this={startElement} id={typeof id === 'string' ? id : id?.start ?? field?.id} name={name ?? field?.name} placeholder={time ? timePlaceholder?.[0] : placeholder?.[0] ?? lang.rangePlaceholder[0]} type="text" role="combobox" aria-haspopup="dialog" aria-expanded={visible && active === 0} aria-controls={`ant-range-picker-${generatedId}`} aria-invalid={inputInvalid(0)
        || resolvedStatus === 'error'
        || attributes['aria-invalid']
        || undefined} aria-describedby={[attributes['aria-describedby'], field?.describedBy].filter(
            Boolean
          )
            .join(
              ' '
            )
            || undefined} required={attributes.required ?? field?.required} disabled={blocked[0]} readonly={readOnly} autocomplete="off" value={displayedTexts[0]}
      class={semantic?.classes.input} style={semantic?.styles.input} size={timeInputSize}
      data-range={time ? 'start' : undefined}
      oninput={event => inputChange(0, event.currentTarget.value)} onclick={() => {
          if (!time) focusField(0);
          if (!time) requestOpen(true);
        }} onfocus={event => {
            focusField(0);
            if (time) (time.onfocus ?? time.onFocus)?.(event, { range: 'start' });
            else onfocus?.(event);
          }} onblur={event => blurInput(0, event)} onkeydown={event => keyboard(event, 0)} />
  </div>
  <div class="ant-picker-range-separator">{#if !time && typeof resolvedSeparator === 'function'}{@render resolvedSeparator()}{:else}<span class="ant-picker-separator" aria-hidden={time && resolvedSeparator !== undefined ? undefined : 'true'}>{#if typeof resolvedSeparator === 'function'}{@render resolvedSeparator()}{:else if resolvedSeparator !== undefined}{resolvedSeparator}{:else}<PickerRangeSeparator />{/if}</span>{/if}</div>
  <div class={[
      'ant-picker-input ant-picker-input-end',
      focused && active === 1 && 'ant-picker-input-active',
      time && previewValue && (presetHover || hover && active === 1)
        && 'ant-picker-input-placeholder'
    ]}>
    <input {...attributes} bind:this={endElement} id={typeof id === 'object' ? id.end : undefined} name={name ?? field?.name} placeholder={time ? timePlaceholder?.[1] : placeholder?.[1] ?? lang.rangePlaceholder[1]} type="text" role="combobox" aria-haspopup="dialog" aria-expanded={visible && active === 1} aria-controls={`ant-range-picker-${generatedId}`} aria-invalid={inputInvalid(1)
        || resolvedStatus === 'error'
        || attributes['aria-invalid']
        || undefined} aria-describedby={[attributes['aria-describedby'], field?.describedBy].filter(
            Boolean
          )
            .join(
              ' '
            )
            || undefined} required={attributes.required ?? field?.required} disabled={blocked[1]} readonly={readOnly} autocomplete="off" value={displayedTexts[1]}
      class={semantic?.classes.input} style={semantic?.styles.input} size={timeInputSize}
      data-range={time ? 'end' : undefined}
      oninput={event => inputChange(1, event.currentTarget.value)} onclick={() => {
          if (!time) focusField(1);
          if (!time) requestOpen(true);
        }} onfocus={event => {
            focusField(1);
            if (time) (time.onfocus ?? time.onFocus)?.(event, { range: 'end' });
            else onfocus?.(event);
          }} onblur={event => blurInput(1, event)} onkeydown={event => keyboard(event, 1)} />
  </div>
  <div class="ant-picker-active-bar" style={`position:absolute;left:${bar.left}px;width:${bar.width}px`}></div>
  {#if !time || suffixContent !== false && suffixContent !== null && suffixContent !== ''}
    <span
      class={['ant-picker-suffix', semantic?.classes.suffix]}
      style={semantic?.styles.suffix}
      aria-hidden="true"
    >{#if !time}<PickerCalendarIcon />
    {:else if typeof suffixContent === 'function'}{@render suffixContent()}
    {:else if suffixContent === undefined || suffixContent === true}<PickerClockIcon />
    {:else}{suffixContent}{/if}</span>
  {/if}
  {#if (time ? timeAllowClear : allowClear) && (time ? calendar : committed)
      .some((date, index) => (date || time && previewValue
        && (presetHover?.[index] || index === active && hover)) && !blocked[index])}
    <button
      type="button"
      class="ant-picker-clear"
      aria-label={lang.clear}
      onpointerdown={event => event.preventDefault()}
      onclick={clear}
    >{#if time && typeof clearContent === 'function'}{@render clearContent()}
    {:else if time && (clearContent === null
        || typeof clearContent === 'boolean' || clearContent === '')}<span class="ant-picker-clear-btn"></span>
    {:else if time && clearContent !== undefined}{clearContent}
    {:else}<Icon name="close-circle-filled" />{/if}</button>
  {/if}
</div>
<NoCompactStyle>
  {#key container.target}
  {#if visible}
    {@const initialPopupStyle = untrack(() => popupThemeStyle)}
    <div bind:this={popup} id={`ant-range-picker-${generatedId}`} popover="manual" role="dialog" tabindex="-1" aria-label={attributes['aria-label'] ?? (time ? lang.timeSelect : lang.placeholder)} hidden={!shown} onfocusout={blurWithin}
      class={[
          'ant-picker-dropdown ant-picker-css-var',
          componentTheme.className,
          time && 'ant-picker-dropdown-range',
          config.direction === 'rtl' && 'ant-picker-dropdown-rtl',
          `ant-picker-dropdown-placement-${verticalPlacement}${actualPlacement.endsWith('Right')
            ? 'Right'
            : 'Left'}`,
          time ? semantic?.classes.popup.root : classNames?.popup?.root,
          time && rootClassName
        ]}
      style={initialPopupStyle}
      {@attach node => connectComponentTheme(node, popupThemeStyle)}
      {@attach container.portal}
      onkeydown={event => {
          if (event.key === 'Escape') {
            event.preventDefault();
            event.stopPropagation();
            send(active, 'esc');
            requestOpen(false);
            inputs()[active]?.focus();
          }
        }}>
      {#if time}
        <div
          bind:this={timeWrapper}
          class="ant-picker-range-wrapper ant-picker-time-range-wrapper"
        >
          <div class="ant-picker-range-arrow" style={`left:${timePosition.arrow}px`}></div>
          <div
            bind:this={timeContainer}
            class={[
              'ant-picker-panel-container ant-picker-time-panel-container',
              semantic?.classes.popup.container
            ]}
            style={[
              config.direction === 'rtl'
                ? `margin-right:${timePosition.offset}px;margin-left:auto`
                : `margin-left:${timePosition.offset}px;margin-right:auto`,
              semantic?.styles.popup.container
            ].filter(Boolean).join(';')}
            tabindex="-1"
            onfocusin={handleTimePanelFocus}
            onfocusout={handleTimePanelBlur}
          >
            {#if time.panelRender}{@render time.panelRender(timePanelLayout)}
            {:else}{@render timePanelLayout()}{/if}
          </div>
        </div>
      {:else}
      <div class="ant-picker-range-arrow" style={`left:${bar.left + bar.width / 2}px`}></div>
      <div class="ant-picker-panel-container"><div class="ant-picker-panel-layout">
        {#if presets?.length}<div class="ant-picker-presets"><ul>{#each presets as preset, index (index)}<li><button type="button" onpointerenter={() => {
            if (previewValue)
              presetHover = rangePair(
                typeof preset.value === 'function' ? preset.value() : preset.value
              );
          }} onpointerleave={() => {
              presetHover = null;
            }} onclick={() => presetValue(
              rangePair(typeof preset.value === 'function' ? preset.value() : preset.value)
            )}>{#if typeof preset.label === 'function'}{@render preset.label()}{:else}{preset.label}{/if}</button></li>{/each}</ul></div>{/if}
        <div><div class:ant-picker-panels={!showTime && mode === 'date'}>
          <div class="ant-picker-panel" tabindex="-1"><div class={showTime && mode === 'date'
              ? 'ant-picker-datetime-panel'
              : undefined}>
            <DatePickerCalendar panel={view} selected={calendar[active]} range={displayRange} onHover={date => {
                hover = date;
              }} {mode} locale={lang} restrictions={{ minDate, maxDate, disabledDate: panelDisabled }} {now} direction={config.direction} showNext={Boolean(showTime) || mode !== 'date'} onSelect={selectDate} onNavigate={next => syncPanel(active, 'panel', false, next)} onModeChange={next => {
                  mode = next;
                  onPanelChange?.([...calendar], [next, next]);
                }} />
            {#if showTime && mode === 'date'}<DatePickerTimePanel value={calendar[active] ?? clock.defaultOpenValue ?? view} selectedValue={calendar[active]} config={clock} format={timeFormat} locale={lang.locale} disabledTime={timeRestriction} onSelect={selectTime} />{/if}
          </div></div>
          {#if !showTime && mode === 'date'}<div class="ant-picker-panel" tabindex="-1"><DatePickerCalendar panel={view.add(1, 'month')} selected={calendar[active]} range={displayRange} onHover={date => {
              hover = date;
            }} {mode} locale={lang} restrictions={{ minDate, maxDate, disabledDate: panelDisabled }} {now} direction={config.direction} showPrevious={false} onSelect={selectDate} onNavigate={next => syncPanel(
                active,
                'panel',
                false,
                next.add(-1, 'month')
              )} onModeChange={next => {
                syncPanel(active, 'panel', false, view.add(1, 'month'));
                mode = next;
                onPanelChange?.([...calendar], [next, next]);
              }} /></div>{/if}
        </div>
        {#if renderExtraFooter}<div class="ant-picker-footer-extra">{@render renderExtraFooter()}</div>{/if}
        {#if (confirm || showCurrent) && mode === 'date'}<div class="ant-picker-footer"><ul class="ant-picker-ranges">{#if showCurrent}<li class="ant-picker-now"><button type="button" class="ant-picker-now-btn" disabled={pickerDateDisabled(
            now,
            { minDate, maxDate, disabledDate: panelDisabled }
          )} onclick={() => send(
              active,
              'confirm',
              validPickerTime(adapter.getNow(), clock)
            )}>{showTime ? lang.now : lang.today}</button></li>{/if}{#if confirm}<li class="ant-picker-ok"><Button
              type="primary" size="small" disabled={!calendar[active]
              && !empty[active]
              || Boolean(
                calendar[active] && invalid(calendar[active]!, active, from())
              )} onclick={() => {
                send(active, 'confirm');
                onOk?.([...calendar]);
              }} children={lang.ok} /></li>{/if}</ul></div>{/if}
        </div>
      </div></div>
      {/if}
    </div>
  {/if}
  {/key}
</NoCompactStyle>
