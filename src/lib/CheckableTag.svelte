<script lang="ts">
  import { useConfig } from './config-context';
  import { connectFeedbackFocus } from './feedback.dom';
  import type { CheckableTagProps } from './tag.types';

  let {
    children,
    checked = false,
    disabled,
    icon,
    onChange,
    onClick,
    onclick,
    onKeyDown,
    onkeydown,
    nativeElement = $bindable(),
    id,
    dir,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
    'aria-describedby': ariaDescribedby,
    class: className = '',
    style,
    ...attributes
  }: CheckableTagProps = $props();
  const config = useConfig();
  let blocked = $derived(disabled ?? config.componentDisabled);
  $effect(() => {
    const node = nativeElement;
    if (node) return connectFeedbackFocus(node);
  });

  function handleClick(event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement; }) {
    if (blocked || event.defaultPrevented) return;

    // Callback может синхронно удалить владельца вместе с его props.
    const click = onclick ?? onClick;
    onChange?.(!checked);
    click?.(event);
  }

  function handleKeyDown(
    event: KeyboardEvent & { currentTarget: EventTarget & HTMLButtonElement; }
  ) {
    const disabled = blocked;
    const nextChecked = !checked;
    const change = onChange;
    (onkeydown ?? onKeyDown)?.(event);
    if (disabled || event.defaultPrevented) return;

    if (event.key === ' ') {
      event.preventDefault();
      if (!event.repeat) change?.(nextChecked);
    }
  }
</script>

<style>
  .ant-tag { display: inline-flex; align-items: center; appearance: none; min-width: 0; max-width: 100%; white-space: normal; vertical-align: middle; --ant-tag-default-color: var(--ant-color-text); }
  .ant-tag-content { min-width: 0; overflow-wrap: anywhere; }
  .ant-tag-icon { display: inline-flex; flex: none; align-items: center; }
  .ant-tag-icon :global(svg) { max-width: 1em; max-height: 1em; }
  .ant-tag:focus-visible { outline: var(--ant-line-width-focus) solid var(--ant-color-primary-border); outline-offset: 1px; }
  @media (prefers-reduced-motion: reduce) { .ant-tag { transition: none; } }
</style>

<button
  {...attributes}
  bind:this={nativeElement}
  {id}
  type="button"
  aria-pressed={checked}
  disabled={blocked}
  aria-label={ariaLabel}
  aria-labelledby={ariaLabelledby}
  aria-describedby={ariaDescribedby}
  dir={dir ?? config.direction}
  class={[
    'ant-tag ant-tag-css-var ant-tag-checkable',
    checked && 'ant-tag-checkable-checked',
    blocked && 'ant-tag-checkable-disabled',
    config.direction === 'rtl' && 'ant-tag-rtl',
    className
  ]}
  {style}
  onclick={handleClick}
  onkeydown={handleKeyDown}
>
  {#if icon}<span class="ant-tag-icon anticon" aria-hidden="true" inert>{@render icon()}</span>{/if}<span class="ant-tag-content">{@render children()}</span>
</button>
