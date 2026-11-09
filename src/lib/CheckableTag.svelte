<script lang="ts">
  import { untrack } from 'svelte';
  import { useConfig } from './config-context';
  import { useComponentTheme } from './theme-component.svelte';
  import { connectTagStyle } from './tag-style.dom';
  import { connectFeedbackFocus } from './feedback.dom';
  import { getTagPrefixCss } from './tag-prefix.engine';
  import ThemeScopeStyle from './ThemeScopeStyle.svelte';
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
    prefixCls,
    ...attributes
  }: CheckableTagProps = $props();
  const config = useConfig();
  const componentTheme = useComponentTheme('Tag');
  let prefix = $derived(config.getPrefixCls('tag', prefixCls));
  let prefixCss = $derived(getTagPrefixCss(prefix));
  let blocked = $derived(disabled ?? config.componentDisabled);
  let rootStyle = $derived([
    componentTheme.style,
    config.tag?.style,
    style
  ].filter(Boolean).join(';') || undefined);

  function rootStyles(node: HTMLButtonElement) {
    const update = connectTagStyle(node);
    $effect(() => update([componentTheme.style, config.tag?.style, style]));
  }

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
  .ant-tag-css-var { display: inline-flex; align-items: center; appearance: none; min-width: 0; max-width: 100%; white-space: normal; vertical-align: middle; --ant-tag-default-color: var(--ant-color-text); }
  .ant-tag-content { box-sizing: border-box; min-width: 0; overflow-wrap: anywhere; }
  .ant-tag-icon { box-sizing: border-box; display: inline-flex; flex: none; align-items: center; }
  .ant-tag-icon :global(svg) { max-width: 1em; max-height: 1em; }
  .ant-tag-css-var:focus-visible { outline: var(--ant-line-width-focus) solid var(--ant-color-primary-border); outline-offset: 1px; }
  @media (prefers-reduced-motion: reduce) { .ant-tag-css-var { transition: none; } }
</style>

{#if prefixCss}<ThemeScopeStyle css={prefixCss} scope={`tag-prefix:${prefix}`} />{/if}<button
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
    prefix,
    'ant-tag-css-var',
    `${prefix}-checkable`,
    componentTheme.className,
    config.tag?.class,
    checked && `${prefix}-checkable-checked`,
    blocked && `${prefix}-checkable-disabled`,
    config.direction === 'rtl' && `${prefix}-rtl`,
    className
  ]}
  style={untrack(() => rootStyle)}
  {@attach rootStyles}
  onclick={handleClick}
  onkeydown={handleKeyDown}
>
  {#if icon}<span class="ant-tag-icon anticon" aria-hidden="true" inert>{@render icon()}</span>{/if}<span class="ant-tag-content">{@render children()}</span>
</button>
