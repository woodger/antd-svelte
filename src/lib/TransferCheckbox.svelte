<script lang="ts">
  import { tick } from 'svelte';
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

<span class={['ant-checkbox-wrapper ant-checkbox-css-var', componentTheme.className, className,
    checked && 'ant-checkbox-wrapper-checked', disabled && 'ant-checkbox-wrapper-disabled']}
  style={componentTheme.style ? [componentTheme.style, style].filter(Boolean).join(';') : style}>
  <span class={['ant-checkbox', checked && 'ant-checkbox-checked',
      indeterminate && 'ant-checkbox-indeterminate', disabled && 'ant-checkbox-disabled']}>
    <input bind:this={input} type="checkbox" class="ant-checkbox-input" {checked} {disabled}
      aria-label={label} aria-checked={indeterminate ? 'mixed' : checked} onclick={handleClick} />
  </span>
</span>
