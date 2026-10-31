<script lang="ts">
  import Icon from './Icon.svelte';
  import PaginationJumpIcon from './PaginationJumpIcon.svelte';
  import type {
    PaginationContent,
    PaginationItemInfo,
    PaginationItemType,
    PaginationProps
  } from './pagination.types';

  let {
    page,
    type,
    disabled,
    active = false,
    label,
    title,
    prefix,
    rtl,
    icon,
    itemRender,
    onClick
  }: {
    page: number;
    type: PaginationItemType;
    disabled: boolean;
    active?: boolean;
    label: string;
    title?: string;
    prefix: string;
    rtl: boolean;
    icon?: PaginationContent;
    itemRender?: PaginationProps['itemRender'];
    onClick: (event: MouseEvent) => void;
  } = $props();
  let info: PaginationItemInfo = $derived({ disabled, active, label, title, onClick: handleClick });

  function handleClick(event: MouseEvent) {
    if (disabled) {
      event.preventDefault();
      return;
    }

    onClick(event);
  }
</script>

<style>
  button { font: inherit; color: inherit; cursor: inherit; }
  .page-button { display: block; width: 100%; height: 100%; padding: 0 6px; border: 0; border-radius: inherit; background: transparent; }
  .jump-button { width: 100%; height: 100%; padding: 0; border: 0; background: transparent; }
  button:focus-visible { outline: var(--ant-line-width-focus) solid var(--ant-color-primary-border); outline-offset: 1px; }
</style>

{#snippet originalElement()}
  <button type="button" {disabled} {title} aria-label={label}
    aria-current={active ? 'page' : undefined} onclick={handleClick}
    class={type === 'page' ? 'page-button' : type.startsWith('jump-')
      ? `${prefix}-item-link jump-button` : `${prefix}-item-link`}>
    {#if icon !== undefined}
      {#if typeof icon === 'function'}{@render icon()}
      {:else if typeof icon !== 'boolean' && icon}{icon}{/if}
    {:else if type === 'page'}{page}
    {:else if type.startsWith('jump-')}
      <span class={`${prefix}-item-container`}>
        <span class={`${prefix}-item-link-icon`} aria-hidden="true">
          <PaginationJumpIcon name={(type === 'jump-prev') !== rtl ? 'previous' : 'next'} />
        </span><span class={`${prefix}-item-ellipsis`} aria-hidden="true">
          <PaginationJumpIcon name="ellipsis" />
        </span>
      </span>
    {:else}<Icon name={(type === 'prev') !== rtl ? 'left' : 'right'} />{/if}
  </button>
{/snippet}

{#if itemRender}{@render itemRender(page, type, originalElement, info)}
{:else}{@render originalElement()}{/if}
