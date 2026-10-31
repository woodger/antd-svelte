<script lang="ts">
  import { untrack } from 'svelte';
  import { useConfig } from './config-context';
  import { getPaginationState, getPageSizeOptions } from './pagination.engine';
  import { transferPaginationItems } from './transfer.engine';
  import { ruRU } from './types';
  import Icon from './Icon.svelte';
  import Select from './Select.svelte';

  let { current, pageSize, total, simple, showSizeChanger, showLessItems, disabled, onChange,
    class: className = '' }: {
    current: number;
    pageSize: number;
    total: number;
    simple: boolean;
    showSizeChanger: boolean;
    showLessItems: boolean;
    disabled: boolean;
    onChange: (page: number, size: number) => void;
    class?: string;
  } = $props();
  const config = useConfig();
  let strings = $derived({ ...ruRU.pagination, ...config.locale.pagination });
  let paginationState = $derived(getPaginationState(total, current, pageSize));
  let pages = $derived(transferPaginationItems(
    paginationState.current, paginationState.pageCount, showLessItems
  ));
  let input = $state<string | number>(untrack(() => current));
  let inputPage = $state(untrack(() => current));
  let inputTotal = $state(untrack(() => total));
  let displayed = $derived(current !== inputPage || total !== inputTotal ? current : input);
  let options = $derived(getPageSizeOptions([10, 20, 50, 100], pageSize));

  function change(page: number, size = pageSize) {
    if (disabled || !Number.isInteger(page) || total <= 0) return;

    const next = getPaginationState(total, page, size).current;
    input = next;
    inputPage = current;
    inputTotal = total;

    if (next !== current || size !== pageSize) onChange(next, size);
  }

  function read(input: HTMLInputElement): number | string {
    if (input.value === '') return '';
    const parsed = Number(input.value);
    return Number.isNaN(parsed) ? displayed : Math.min(parsed, paginationState.pageCount);
  }

  function handleInput(event: Event & { currentTarget: HTMLInputElement; }) {
    input = read(event.currentTarget);
    inputPage = current;
    inputTotal = total;
  }

  function handleKeyUp(event: KeyboardEvent & { currentTarget: HTMLInputElement; }) {
    const value = read(event.currentTarget);

    if (event.key === 'Enter') change(Number(value));
    else if (event.key === 'ArrowUp') change(Number(value) - 1);
    else if (event.key === 'ArrowDown') change(Number(value) + 1);
  }
</script>

<style>
  button { font: inherit; color: inherit; cursor: inherit; }
  .page-button { display: block; width: 100%; height: 100%; padding: 0 6px; border: 0; border-radius: inherit; background: transparent; }
  .jump-button { width: 100%; height: 100%; padding: 0; border: 0; background: transparent; }
  button:focus-visible { outline: var(--ant-line-width-focus) solid var(--ant-color-primary-border); outline-offset: 1px; }
</style>

<ul class={['ant-pagination ant-pagination-small ant-pagination-mini',
    simple && 'ant-pagination-simple',
    disabled && 'ant-pagination-disabled', config.direction === 'rtl' && 'ant-pagination-rtl',
    className]} aria-label={strings.label}>
  <li class={['ant-pagination-prev', (disabled || current <= 1) && 'ant-pagination-disabled']}>
    <button type="button" class="ant-pagination-item-link" aria-label={strings.previous}
      disabled={disabled || current <= 1} onclick={() => change(current - 1)}>
      <Icon name={config.direction === 'rtl' ? 'right' : 'left'} />
    </button>
  </li>
  {#if simple}
    <li class="ant-pagination-simple-pager" title={`${current}/${paginationState.pageCount}`}>
      <input type="text" size="3" aria-label={strings.page} value={displayed} {disabled}
        oninput={handleInput} onkeyup={handleKeyUp}
        onkeydown={event => {
          if (event.key === 'ArrowUp' || event.key === 'ArrowDown') event.preventDefault();
        }} onblur={event => change(Number(read(event.currentTarget)))} />
      <span class="ant-pagination-slash">/</span>{paginationState.pageCount}
    </li>
  {:else}
    {#each pages as page (page)}
      {#if typeof page === 'number'}
        <li class={['ant-pagination-item', page === current && 'ant-pagination-item-active']}>
          <button type="button" class="page-button" aria-label={`${strings.page} ${page}`}
            aria-current={page === current ? 'page' : undefined} {disabled}
            onclick={() => change(page)}>{page}</button>
        </li>
      {:else}
        <li class={page === 'jump-prev' ? 'ant-pagination-jump-prev' : 'ant-pagination-jump-next'}>
          <button type="button" class="jump-button" {disabled}
            aria-label={page === 'jump-prev' ? strings.jumpPrevious : strings.jumpNext}
            onclick={() => change(current + (page === 'jump-prev' ? -1 : 1)
              * (showLessItems ? 3 : 5))}><span aria-hidden="true">•••</span></button>
        </li>
      {/if}
    {/each}
  {/if}
  <li class={['ant-pagination-next',
      (disabled || current >= paginationState.pageCount) && 'ant-pagination-disabled']}>
    <button type="button" class="ant-pagination-item-link" aria-label={strings.next}
      disabled={disabled || current >= paginationState.pageCount} onclick={() => change(current + 1)}>
      <Icon name={config.direction === 'rtl' ? 'left' : 'right'} />
    </button>
  </li>
  {#if showSizeChanger}
    <li class="ant-pagination-options"><Select
      class="ant-pagination-options-size-changer ant-pagination-options-size-changer-select"
      aria-label={strings.pageSize} size="small" {disabled} showSearch
      bind:value={() => pageSize, value => {
        if (value !== undefined) change(getPaginationState(total, current, value).current, value);
      }}
      options={options.map(value => ({ value, label: `${value} ${strings.itemsPerPage}` }))}
    /></li>
  {/if}
</ul>
