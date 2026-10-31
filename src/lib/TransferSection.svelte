<script lang="ts" generics="RecordType extends object">
  import { untrack } from 'svelte';
  import type { Snippet } from 'svelte';
  import type { DropdownItem } from './dropdown.types';
  import type {
    TransferListProps, TransferListBodyProps, TransferSearchOption, TransferContent
  } from './transfer.types';
  import { transferDisabled, transferKey, transferRender } from './transfer.engine';
  import { getPaginationState } from './pagination.engine';
  import TransferCheckbox from './TransferCheckbox.svelte';
  import TransferPagination from './TransferPagination.svelte';
  import Dropdown from './Dropdown.svelte';
  import Input from './Input.svelte';
  import Icon from './Icon.svelte';

  let { section, children, footer, style, onSearch }: {
    section: TransferListProps<RecordType>;
    children?: Snippet<[TransferListBodyProps<RecordType>]>;
    footer?: Snippet<[TransferListProps<RecordType>, { direction: 'left' | 'right'; }]>;
    style?: string;
    onSearch: (value: string) => void;
  } = $props();
  let search = $state(untrack(() => typeof section.showSearch === 'object'
    ? section.showSearch.defaultValue || '' : ''));
  let page = $state(1);
  let localSize = $state(10);
  let searchElement = $state<HTMLInputElement>();
  let searchOption: TransferSearchOption = $derived(
    typeof section.showSearch === 'object' ? section.showSearch : {}
  );
  let pagination = $derived(typeof section.pagination === 'object' ? section.pagination : {});
  let pageSize = $derived(pagination.pageSize ?? localSize);
  let rows = $derived(transferRender(section.dataSource, section.render, search,
    section.filterOption, section.direction));
  let filtered = $derived(rows.map(row => row.item));
  let enabledKeys = $derived(filtered.filter(item => !transferDisabled(item)).map(transferKey));
  let checked = $derived(new Set(section.checkedKeys));
  let selectedCount = $derived(enabledKeys.filter(key => checked.has(key)).length);
  let all = $derived(selectedCount > 0 && selectedCount === enabledKeys.length);
  let half = $derived(selectedCount > 0 && !all);
  let current = $derived(getPaginationState(rows.length, page, pageSize).current);
  let visibleRows = $derived(section.pagination
    ? rows.slice((current - 1) * pageSize, current * pageSize) : rows);
  let currentKeys = $derived(children ? [] : visibleRows
    .filter(row => !transferDisabled(row.item)).map(row => transferKey(row.item)));
  let customProps: TransferListBodyProps<RecordType> = $derived.by(() => {
    const { checkedKeys, handleClear, handleFilter, ...props } = section;
    return {
      ...props,
      filteredItems: filtered,
      filteredRenderItems: rows,
      selectedKeys: checkedKeys,
      onItemSelect: (key, selected) => section.onItemSelect(key, selected)
    };
  });
  let hasCustomLabel = $derived(section.selectAllLabel !== undefined
    && section.selectAllLabel !== null && section.selectAllLabel !== false
    && section.selectAllLabel !== '');
  let label = $derived(typeof section.selectAllLabel === 'function'
    ? section.selectAllLabel({ selectedCount, totalCount: filtered.length })
    : section.selectAllLabel);
  let empty: TransferContent = $derived.by(() => {
    const content = section.notFoundContent;
    return Array.isArray(content) ? content[section.direction === 'left' ? 0 : 1] : content;
  });
  let commands: DropdownItem[] = $derived.by(() => {
    if (section.showRemove) {
      return [
        ...(section.pagination
          ? [{ key: 'remove-current', label: section.removeCurrent ?? '' }] : []),
        { key: 'remove-all', label: section.removeAll ?? '' }
      ];
    }

    return [
      { key: 'all', label: (all ? section.deselectAll : section.selectAll) ?? '' },
      ...(section.pagination ? [{ key: 'current', label: section.selectCurrent ?? '' }] : []),
      { key: 'invert', label: section.selectInvert ?? '' }
    ];
  });

  $effect(() => {
    // Пустой результат/custom body размонтирует upstream ListBody вместе с page/pageSize.
    if (children || rows.length === 0) {
      page = 1;
      localSize = 10;
    } else if (section.pagination && page !== current) page = current;
  });

  $effect(() => {
    // React синхронизирует value attribute controlled input; native reset сохраняет query.
    if (searchElement) searchElement.defaultValue = search;
  });

  function command(key: string) {
    if (section.disabled) return;

    if (key === 'all') section.onItemSelectAll(enabledKeys, !all);
    else if (key === 'current') section.onItemSelectAll(currentKeys, true);
    else if (key === 'invert') {
      const next = new Set(section.checkedKeys);

      for (const item of currentKeys) {
        if (next.has(item)) next.delete(item);
        else next.add(item);
      }

      section.onItemSelectAll([...next], 'replace');
    } else section.onItemRemove?.(key === 'remove-current' ? currentKeys : enabledKeys);
  }

  function changeSearch(value: string) {
    search = value;
    onSearch(value);
  }
</script>

<style>
  .row-label { display: flex; flex: auto; align-items: center; min-width: 0; max-width: 100%; cursor: inherit; }
  .row-label > :global(*:not(:last-child)) { margin-inline-end: var(--ant-margin-xs); }
  .row-label > :global(.ant-checkbox-wrapper) { flex: none; }
  .dropdown-button { padding: 0; border: 0; background: transparent; color: inherit; }
  .dropdown-button:focus-visible, .remove-button:focus-visible { outline: var(--ant-line-width-focus) solid var(--ant-color-primary-border); outline-offset: 2px; }
  .remove-button { padding: 0; border: 0; background: transparent; font: inherit; }
  .remove-button svg { display: inline-block; width: 1em; height: 1em; vertical-align: -0.125em; }
</style>

{#snippet text(content: TransferContent)}
  {#if typeof content === 'function'}{@render content()}
  {:else if typeof content !== 'boolean'}{content}{/if}
{/snippet}

<div class={[`${section.prefixCls}-section`, section.classNames.section,
    section.pagination && `${section.prefixCls}-section-with-pagination`,
    footer && `${section.prefixCls}-section-with-footer`]} {style}>
  <div class={[`${section.prefixCls}-list-header`, section.classNames.header]}
    style={section.styles.header}>
    {#if section.showSelectAll !== false}
      {#if !section.showRemove && !section.pagination}
        <TransferCheckbox class={`${section.prefixCls}-list-checkbox`} checked={all}
          indeterminate={half} disabled={section.disabled || enabledKeys.length === 0}
          label={(all ? section.deselectAll : section.selectAll) ?? ''}
          onSelect={() => section.onItemSelectAll(enabledKeys, !all)} />
      {/if}
      <Dropdown disabled={section.disabled} trigger="click" menu={{ items: commands,
          onClick: info => command(info.key) }}>
        <button type="button" class={[`${section.prefixCls}-list-header-dropdown`,
            'dropdown-button']} disabled={section.disabled} aria-label={section.selectAll}>
          {#if section.selectionsIcon !== undefined}{@render text(section.selectionsIcon)}
          {:else}<Icon name="down" />{/if}
        </button>
      </Dropdown>
    {/if}
    <span class={`${section.prefixCls}-list-header-selected`}>
      {#if hasCustomLabel}{@render text(label)}
      {:else}{selectedCount > 0 ? `${selectedCount}/` : ''}{filtered.length} {filtered.length > 1
          ? section.itemsUnit : section.itemUnit}{/if}
    </span>
    <span class={[`${section.prefixCls}-list-header-title`, section.classNames.title]}
      style={section.styles.title}>{@render text(section.titleText)}</span>
  </div>
  <div class={[`${section.prefixCls}-list-body`, section.classNames.body]}
    style={section.styles.body}>
    {#if section.showSearch}
      <div class={`${section.prefixCls}-list-body-search-wrapper`}>
        <Input class={`${section.prefixCls}-list-search`} value={search}
          bind:inputElement={searchElement}
          disabled={section.disabled} allowClear prefix={searchIcon}
          placeholder={searchOption.placeholder || section.searchPlaceholder}
          aria-label={searchOption.placeholder || section.searchPlaceholder}
          onChange={event => changeSearch(event.type === 'click' ? '' : event.target.value)} />
      </div>
    {/if}
    {#if children}
      <div class={`${section.prefixCls}-list-body-customize-wrapper`}>
        {@render children(customProps)}
      </div>
    {:else if rows.length === 0}
      <div class={`${section.prefixCls}-list-body-not-found`}>
        {@render text(empty)}
      </div>
    {:else}
      <ul class={[`${section.prefixCls}-list-content`, section.classNames.list,
          section.showRemove && `${section.prefixCls}-list-content-show-remove`]}
        style={section.styles.list} onscroll={section.onScroll}>
        {#each visibleRows as row (transferKey(row.item))}
          {@const key = transferKey(row.item)}
          {@const blocked = section.disabled || transferDisabled(row.item)}
          <li class={[`${section.prefixCls}-list-content-item`, section.classNames.item,
              blocked && `${section.prefixCls}-list-content-item-disabled`,
              checked.has(key) && !blocked && `${section.prefixCls}-list-content-item-checked`]}
            style={section.styles.item} title={row.renderedText}>
            {#if section.showRemove}
              {@render itemContent(row)}
              <button type="button" class={`${section.prefixCls}-list-content-item-remove remove-button`}
                disabled={blocked} aria-label={section.remove}
                onclick={() => section.onItemRemove?.([key])}>
                <svg viewBox="64 64 896 896" fill="currentColor" aria-hidden="true" focusable="false">
                  <path d="M360 184h-8c4.4 0 8-3.6 8-8v8h304v-8c0 4.4 3.6 8 8 8h-8v72h72v-80c0-35.3-28.7-64-64-64H352c-35.3 0-64 28.7-64 64v80h72v-72zm504 72H160c-17.7 0-32 14.3-32 32v32c0 4.4 3.6 8 8 8h60.4l24.7 523c1.6 34.1 29.8 61 63.9 61h454c34.2 0 62.3-26.8 63.9-61l24.7-523H888c4.4 0 8-3.6 8-8v-32c0-17.7-14.3-32-32-32zM731.3 840H292.7l-24.2-512h487l-24.2 512z" />
                </svg>
              </button>
            {:else}
              <label class="row-label">
                <TransferCheckbox class={[`${section.prefixCls}-checkbox`,
                    section.classNames.itemIcon].filter(Boolean).join(' ')}
                  style={section.styles.itemIcon} checked={checked.has(key)} disabled={blocked}
                  label={row.renderedText} onSelect={event =>
                    section.onItemSelect(key, !checked.has(key), event, filtered)} />
                {@render itemContent(row)}
              </label>
            {/if}
          </li>
        {/each}
      </ul>
      {#if section.pagination}
        <TransferPagination class={`${section.prefixCls}-list-pagination`} {pageSize}
          current={current} total={rows.length} disabled={section.disabled}
          simple={pagination.simple ?? true} showSizeChanger={pagination.showSizeChanger ?? false}
          showLessItems={pagination.showLessItems ?? false}
          onChange={(next, size) => {
            page = next;
            localSize = size;
          }} />
      {/if}
    {/if}
  </div>
  {#if footer}
    <div class={[`${section.prefixCls}-list-footer`, section.classNames.footer]}
      style={section.styles.footer}>{@render footer(section, { direction: section.direction })}</div>
  {/if}
</div>

{#snippet searchIcon()}<Icon name="search" />{/snippet}

{#snippet itemContent(row: (typeof rows)[number])}
  <span class={[`${section.prefixCls}-list-content-item-text`, section.classNames.itemContent]}
    style={section.styles.itemContent}>
    {#if typeof row.renderedEl === 'function'}{@render row.renderedEl(row.item)}
    {:else if typeof row.renderedEl !== 'boolean'}{row.renderedEl}{/if}
  </span>
{/snippet}
