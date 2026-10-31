<script lang="ts">
  import Button from './Button.svelte';
  import Icon from './Icon.svelte';
  import { useConfig } from './config-context';
  import type { TransferAction, TransferActionInfo, TransferDirection } from './transfer.types';

  let { action, direction, disabled, onMove, extra = false }: {
    action?: TransferAction;
    direction: TransferDirection;
    disabled: boolean;
    onMove: () => void;
    extra?: boolean;
  } = $props();
  const config = useConfig();
  let descriptor = $derived(typeof action === 'object' && action !== null ? action : undefined);
  let content = $derived(descriptor?.children ?? action);
  let blocked = $derived(Boolean(descriptor?.disabled) || (!extra && disabled));
  let arrow = $derived(config.direction === 'rtl'
    ? direction === 'left' ? 'right' : 'left'
    : direction);
  let info: TransferActionInfo = $derived({
    disabled: blocked, direction, icon, onClick: handleClick
  });

  function handleClick(event: MouseEvent) {
    if (blocked) {
      event.preventDefault();
      return;
    }

    descriptor?.onClick?.(event);
    if (!extra) onMove();
  }
</script>

{#snippet icon()}<Icon name={arrow} />{/snippet}

{#if typeof content === 'function'}
  {@render content(info)}
{:else if extra}
  {#if typeof content !== 'boolean'}{content}{/if}
{:else}
  <Button
    type="primary"
    size="small"
    disabled={blocked}
    {icon}
    aria-label={typeof content === 'string' && content ? content : direction}
    onClick={handleClick}
    children={typeof content === 'string' || typeof content === 'number'
      || typeof content === 'boolean' ? content : undefined}
  />
{/if}
