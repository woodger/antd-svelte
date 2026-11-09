<script lang="ts">
  import type { Dayjs } from 'dayjs';
  import { untrack, type Snippet } from 'svelte';
  import { connectTimePickerColumn } from './time-picker-column.dom';
  import type { TimePickerOption } from './time-picker.engine';
  import type { PickerLocale } from './picker-locale.types';
  import type {
    TimePickerCellRenderInfo,
    TimePickerColumnType,
    TimePickerProps
  } from './time-picker.types';

  let {
    prefixCls,
    type,
    options,
    value,
    optionalValue,
    changeOnScroll,
    onChange,
    onHover,
    onDblClick,
    cellRender,
    locale,
    today,
    range,
    class: className,
    style
  }: {
    prefixCls: string;
    type: TimePickerColumnType;
    options: readonly TimePickerOption[];
    value: TimePickerOption['value'] | null;
    optionalValue: TimePickerOption['value'] | null;
    changeOnScroll?: boolean;
    onChange: (value: TimePickerOption['value']) => void;
    onHover?: (value: TimePickerOption['value'] | null) => void;
    onDblClick?: () => void;
    cellRender?: TimePickerProps['cellRender'];
    locale: PickerLocale;
    today: Dayjs;
    range?: 'start' | 'end';
    class?: string;
    style?: string;
  } = $props();

  let element = $state<HTMLUListElement>();
  let firstClickEnabled = false;
  let signature = $derived(options.map(option =>
    `${option.value},${option.label},${option.disabled}`).join(';'));

  $effect(() => {
    void signature;
    void value;
    void optionalValue;
    if (!element) return;

    const column = element;
    return untrack(() => connectTimePickerColumn(
      column,
      value ?? optionalValue,
      options,
      () => changeOnScroll,
      next => onChange(next)
    ));
  });

  $effect(() => {
    const column = element;
    if (!column) return;
    const handleBlankClick = (event: MouseEvent) => {
      if (event.target === column && event.detail < 2) firstClickEnabled = false;
    };
    const handleDoubleClick = (event: MouseEvent) => {
      // Скролл между вторыми down/up переносит click/dblclick на общий ul.
      if (event.target !== column || !firstClickEnabled) return;
      firstClickEnabled = false;
      onDblClick?.();
    };
    column.addEventListener('click', handleBlankClick);
    column.addEventListener('dblclick', handleDoubleClick);

    return () => {
      column.removeEventListener('click', handleBlankClick);
      column.removeEventListener('dblclick', handleDoubleClick);
    };
  });

  function handleKeydown(event: KeyboardEvent) {
    if (!(event.target instanceof HTMLButtonElement)
      || !event.target.hasAttribute('data-picker-time-control')) return;
    if (!['ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;

    const buttons = [...element!.querySelectorAll<HTMLButtonElement>(
      'button[data-picker-time-control]:not(:disabled)'
    )];
    const index = buttons.indexOf(event.target);
    const next = event.key === 'Home' ? 0
      : event.key === 'End' ? buttons.length - 1
        : (index + (event.key === 'ArrowDown' ? 1 : -1) + buttons.length) % buttons.length;
    event.preventDefault();
    buttons[next]?.click();
    buttons[next]?.focus();
  }

  function renderInfo(originNode: Snippet): TimePickerCellRenderInfo {
    return {
      prefixCls, originNode, today, type: 'time', subType: type, locale, range
    };
  }
</script>

<style>
  button { color: inherit; width: 100%; border: 0; background: transparent; font: inherit; text-align: inherit; padding: 0; cursor: pointer; }
  button:focus-visible { outline: 2px solid var(--ant-color-primary); outline-offset: -2px; }
</style>

<ul class={`${prefixCls}-time-panel-column`} data-type={type} aria-label={type} bind:this={element}>
  {#each options as option (option.value)}
    <li
      role="presentation"
      data-value={option.value}
      data-picker-time-cell-selected={value === option.value || undefined}
      class={[
        `${prefixCls}-time-panel-cell`,
        value === option.value && `${prefixCls}-time-panel-cell-selected`,
        option.disabled && `${prefixCls}-time-panel-cell-disabled`,
        className
      ]}
      {style}
      onclick={event => {
        // Автопрокрутка после первого click может подставить другую ячейку под второй.
        if (event.detail >= 2) return;
        firstClickEnabled = !option.disabled;
        if (firstClickEnabled) onChange(option.value);
      }}
      ondblclick={() => { if (!option.disabled) onDblClick?.(); }}
      onmouseenter={() => onHover?.(option.value)}
      onmouseleave={() => onHover?.(null)}
      onkeydown={handleKeydown}
    >
      {#snippet originNode()}
        <button
          type="button"
          class={`${prefixCls}-time-panel-cell-inner`}
          data-picker-time-control
          disabled={option.disabled}
          tabindex={value === option.value
            || value === null && optionalValue === option.value ? 0 : -1}
          aria-label={type === 'meridiem' ? option.label : `${type} ${option.value}`}
          aria-pressed={value === option.value}
        >{option.label}</button>
      {/snippet}
      {#if cellRender}{@render cellRender(option.value, renderInfo(originNode))}
      {:else}{@render originNode()}{/if}
    </li>
  {/each}
</ul>
