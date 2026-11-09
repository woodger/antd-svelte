<script lang="ts">
  import { tick } from 'svelte';
  import ThemeScopeStyle from './ThemeScopeStyle.svelte';
  import { useConfig } from './config-context';
  import { getCheckboxPrefixCss } from './checkbox-prefix.engine';
  import { useComponentTheme } from './theme-component.svelte';

  let { checked, indeterminate = false, disabled, label, onSelect,
    class: className = '', style }: {
    checked: boolean;
    indeterminate?: boolean;
    disabled: boolean;
    label: string;
    onSelect: (event: MouseEvent) => void;
    class?: string;
    style?: string;
  } = $props();
  let input = $state<HTMLInputElement>();
  const componentTheme = useComponentTheme('Checkbox');
  const config = useConfig();
  let prefix = $derived(config.getPrefixCls('checkbox'));
  let rootPrefix = $derived(config.getPrefixCls());
  let prefixCss = $derived(getCheckboxPrefixCss(prefix, rootPrefix));

  $effect(() => {
    if (input) input.indeterminate = indeterminate;
  });

  async function handleClick(event: MouseEvent) {
    onSelect(event);
    await tick();

    // Владелец может отклонить controlled selection; браузер уже переключил native checkbox.
    if (input) {
      input.checked = checked;
      input.indeterminate = indeterminate;
    }
  }
</script>

{#if prefixCss}<ThemeScopeStyle css={prefixCss} scope={`transfer-checkbox-prefix:${prefix}:${rootPrefix}`} />{/if}<span data-ant-transfer-checkbox data-ant-checkbox-prefix={prefix} data-ant-checkbox-global={rootPrefix} class={[`${prefix}-wrapper ant-checkbox-css-var`, componentTheme.className, className,
    checked && `${prefix}-wrapper-checked`, disabled && `${prefix}-wrapper-disabled`]}
  style={componentTheme.style ? [componentTheme.style, style].filter(Boolean).join(';') : style}>
  <span class={[prefix, checked && `${prefix}-checked`,
      indeterminate && `${prefix}-indeterminate`, disabled && `${prefix}-disabled`]}>
    <input bind:this={input} type="checkbox" class={`${prefix}-input`} {checked} {disabled}
      aria-label={label} aria-checked={indeterminate ? 'mixed' : checked} onclick={handleClick} />
  </span>
</span>
