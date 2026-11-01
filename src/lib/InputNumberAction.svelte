<script lang="ts">
  import { useConfig } from './config-context';
  import { ruRU } from './types';
  import { connectInputNumberStep } from './input-number.dom';
  import type { InputNumberContent } from './input-number.types';
  import Icon from './Icon.svelte';

  let {
    prefixCls,
    action,
    disabled,
    controlId,
    content,
    spinner,
    class: className,
    style,
    onStep
  }: {
    prefixCls: string;
    action: 'up' | 'down';
    disabled: boolean;
    controlId: string;
    content?: InputNumberContent;
    spinner: boolean;
    class?: string;
    style?: string;
    onStep: () => void;
  } = $props();
  const config = useConfig();
  let locale = $derived(config.locale.inputNumber ?? ruRU.inputNumber);
</script>

<style>
  button { padding: 0; border: 0; border-radius: 0; background: transparent; font: inherit; }
  button:focus-visible { outline: 2px solid var(--ant-color-primary); outline-offset: -2px; }
  .action-icon { display: inline-flex; }
  .up-icon { transform: rotate(180deg); }
  @media (prefers-reduced-motion: reduce) { button { transition: none; } }
</style>

<button type="button" tabindex="-1" {disabled} aria-controls={controlId}
  aria-label={action === 'up' ? locale.increase ?? ruRU.inputNumber.increase
    : locale.decrease ?? ruRU.inputNumber.decrease}
  class={[`${prefixCls}-action`, `${prefixCls}-action-${action}`,
    disabled && `${prefixCls}-action-${action}-disabled`, className]}
  {style} {@attach element => connectInputNumberStep(element, () => onStep())}
  onclick={event => { if (event.detail === 0) onStep(); }}>
  {#if typeof content === 'function'}{@render content()}
  {:else if content}{content}
  {:else}
    <span class={['action-icon', !spinner && action === 'up' && 'up-icon']}>
      <Icon name={spinner ? action === 'up' ? 'plus' : 'minus' : 'down'} />
    </span>
  {/if}
</button>
