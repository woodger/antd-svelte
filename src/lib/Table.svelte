<script lang="ts" generics="Row extends object">
  import { untrack } from 'svelte';
  import { useConfig } from './config-context';
  import { useComponentTheme } from './theme-component.svelte';
  import { useDesignTokenContext } from './theme-context.svelte';
  import { getPaginationState } from './pagination.engine';
  import { getTableFixedOffsets } from './table-layout.engine';
  import {
    areTableFiltersEqual,
    changeTableSelection,
    getNextTableSorter,
    getTableData,
    getTableFilters,
    getTableSelection
  } from './table.engine';
  import type {
    TableChange,
    TableFilters,
    TableFilterValue,
    TableKey,
    TableProps,
    TableSorter
  } from './table.types';
  import { ruRU } from './types';
  import Checkbox from './Checkbox.svelte';
  import Icon from './Icon.svelte';
  import Pagination from './Pagination.svelte';
  import TableFilter from './TableFilter.svelte';
  import Spin from './Spin.svelte';
  import Empty from './Empty.svelte';
  import RenderEmpty from './RenderEmpty.svelte';

  let {
    mode = 'client',
    total,
    dataSource,
    columns,
    rowKey,
    rowClassName,
    rowHoverable = true,
    showHeader = true,
    sorter = $bindable(),
    defaultSorter = null,
    filters = $bindable(),
    defaultFilters = {},
    current = $bindable(),
    defaultCurrent = 1,
    pageSize = $bindable(),
    defaultPageSize = 10,
    pagination,
    rowSelection = false,
    selectedRowKeys = $bindable(),
    defaultSelectedRowKeys = [],
    onChange,
    onSelectionChange,
    expandable,
    expandedRowKeys = $bindable(),
    defaultExpandedRowKeys = [],
    onExpand,
    onExpandedRowsChange,
    loading = false,
    disabled,
    bordered = false,
    size,
    title,
    footer,
    caption,
    empty,
    scroll,
    'aria-label': ariaLabel,
    class: className = '',
    style
  }: TableProps<Row> = $props();

  const config = useConfig();
  const componentTheme = useComponentTheme('Table');
  const designTheme = useDesignTokenContext();
  let rootStyle = $derived([componentTheme.style, style].filter(Boolean).join(';') || undefined);
  // InternalTable передаёт только явно подготовленный token в columnWidth до bordered CSS.
  let selectionWidth = $derived(designTheme.enabled
    ? designTheme.state.token.Table?.selectionColumnWidth : 48);
  const id = $props.id();
  const initialSorter = untrack(() => defaultSorter ? { ...defaultSorter } : null);
  const initialCurrent = untrack(() => defaultCurrent);
  const initialSize = untrack(() => defaultPageSize);
  const initialSelection = untrack(() => [...defaultSelectedRowKeys]);
  const initialExpansion = untrack(() => [...defaultExpandedRowKeys]);
  const initialFilters: TableFilters = untrack(
    () => Object.fromEntries(
      Object.entries(defaultFilters).map(([key, values]) => [key, [...values]])
    )
  );
  let tableData = $derived(
    getTableData(
      dataSource,
      columns,
      rowKey,
      sorter === undefined ? initialSorter : sorter,
      filters ?? initialFilters,
      mode
    )
  );
  let hasFilters = $derived(
    columns.some((column) => column.filters?.length && (mode === 'server' || column.onFilter))
  );
  let paging = $derived(
    getPaginationState(
      mode === 'server' ? total ?? dataSource.length : tableData.rows.length,
      current ?? initialCurrent,
      pageSize ?? initialSize
    )
  );
  let pageRows = $derived(
    mode === 'server' || pagination === false
      ? tableData.rows
      : tableData.rows.slice(
        (paging.current - 1) * paging.pageSize,
        paging.current * paging.pageSize
      )
  );
  let panelData = $derived(pageRows.map(row => row.record));
  let selectionOptions = $derived(typeof rowSelection === 'object' ? rowSelection : undefined);
  let visibleRows = $derived(
    pageRows.map(
      (row) => ({
        ...row,
        checkbox: selectionOptions?.getCheckboxProps?.(row.record) ?? {},
        canExpand: expandable ? expandable.rowExpandable?.(row.record) ?? true : false
      })
    )
  );
  let changeableKeys = $derived(
    visibleRows.filter((row) => !row.checkbox.disabled).map((row) => row.key)
  );
  let selectedKeys = $derived(new Set(selectedRowKeys ?? initialSelection));
  let selection = $derived(getTableSelection(changeableKeys, [...selectedKeys]));
  let expandedKeys = $derived(new Set(expandedRowKeys ?? initialExpansion));
  let resolvedDisabled = $derived((disabled ?? config.componentDisabled) || loading);
  let resolvedSize = $derived(size ?? config.componentSize);
  let strings = $derived({ ...ruRU.table, ...config.locale.table });
  let content = $state<HTMLDivElement>();
  let table = $state<HTMLTableElement>();
  let expansionOffset = $derived(expandable ? 1 : 0);
  let dataOffset = $derived(expansionOffset + (rowSelection ? 1 : 0));
  // Hidden влияет только на разметку: InternalTable сохраняет sort/filter до rc-table.
  let visibleColumns = $derived(columns.filter(column => !column.hidden));
  let fixedColumns = $derived(
    [
      ...(expandable ? [expandable.fixed ?? false] : []),
      ...(rowSelection ? [selectionOptions?.fixed ?? false] : []),
      ...visibleColumns.map((column) => column.fixed)
    ]
  );
  let fixedCells = $derived(fixedColumns.map((fixed, index) => ({
    side: fixed === true ? 'start' : fixed || undefined,
    offset: `var(--ant-table-fixed-${index}, auto)`
  })));

  $effect(() => {
    const element = table;
    const viewport = content;
    const fixed = fixedColumns;
    const hasHeader = showHeader && scroll?.y !== undefined;
    const hasExpansion = Boolean(expandable);

    if (!element || !viewport || (!fixed.some(Boolean) && !hasHeader && !hasExpansion)) {
      return;
    }

    let measurementRow = element.tHead?.rows[0];
    if (!showHeader) {
      // Без thead ширины и новые строки страницы измеряются по обычной строке tbody.
      measurementRow = visibleRows.length ? element.tBodies[0]?.rows[0] : undefined;
    }
    const cells = Array.from(measurementRow?.cells ?? []);

    const measure = () => {
      const widths = cells.map((cell) => cell.getBoundingClientRect().width);
      const offsets = getTableFixedOffsets(fixed, widths);
      const pinnedWidth = widths.reduce(
        (sum, width, index) => sum + (fixed[index] ? width : 0),
        0
      );
      const enabled = cells.length === fixed.length && pinnedWidth < viewport.clientWidth;
      let startWidth = 0;
      let endWidth = 0;

      offsets.forEach((offset, index) => {
        const property = `--ant-table-fixed-${index}`;

        if (enabled && offset !== undefined) {
          element.style.setProperty(property, `${offset}px`);

          if (fixed[index] === 'end')
            endWidth += widths[index];
          else startWidth += widths[index];
        } else {
          element.style.removeProperty(property);
        }
      });
      element.style.setProperty('--ant-table-fixed-position', enabled ? 'sticky' : 'relative');
      viewport.style.setProperty('--ant-table-fixed-start-width', `${startWidth}px`);
      viewport.style.setProperty('--ant-table-fixed-end-width', `${endWidth}px`);
      viewport.style.setProperty(
        '--ant-table-header-height',
        `${hasHeader ? element.tHead?.getBoundingClientRect().height ?? 0 : 0}px`
      );
      viewport.style.setProperty('--ant-table-viewport-width', `${viewport.clientWidth}px`);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    cells.forEach((cell) => observer.observe(cell));

    return () => {
      observer.disconnect();
      fixed.forEach((_, index) => element.style.removeProperty(`--ant-table-fixed-${index}`));
      element.style.removeProperty('--ant-table-fixed-position');
      [
        '--ant-table-fixed-start-width',
        '--ant-table-fixed-end-width',
        '--ant-table-header-height',
        '--ant-table-viewport-width'
      ].forEach(
        (property) => viewport.style.removeProperty(property)
      );
    };
  });

  function notifyChange(action: TableChange<Row>['action']) {
    onChange?.({
      action,
      pagination: { current: paging.current, pageSize: paging.pageSize, total: paging.total },
      sorter: tableData.sorter ? { ...tableData.sorter } : null,
      ...(hasFilters ? { filters: getTableFilters(columns, tableData.filters, mode) } : {}),
      currentDataSource: tableData.rows.map((row) => row.record)
    });
  }

  function changeSort(columnKey: string) {
    if (resolvedDisabled) {
      return;
    }

    sorter = getNextTableSorter(columnKey, tableData.sorter);
    notifyChange('sort');
  }

  function changePage(page: number, size: number) {
    if (resolvedDisabled) {
      return;
    }

    current = page;
    pageSize = size;
    notifyChange('paginate');
  }

  function changeFilter(columnKey: string, values: TableFilterValue[]) {
    if (resolvedDisabled) {
      return;
    }

    const next = { ...(filters ?? initialFilters), [columnKey]: [...values] };
    const active = getTableFilters(columns, next, mode);

    if (areTableFiltersEqual(active, tableData.filters)) {
      return;
    }

    if (Object.hasOwn(active, columnKey)) {
      next[columnKey] = active[columnKey];
    } else {
      delete next[columnKey];
    }

    filters = next;
    current = 1;
    notifyChange('filter');
  }

  function changeSelection(keys: TableKey[], checked: boolean, type: 'single' | 'all') {
    if (resolvedDisabled) {
      return;
    }

    const next = changeTableSelection([...selectedKeys], keys, checked);
    selectedRowKeys = next;
    const records = new Map(tableData.allRows.map((row) => [row.key, row.record]));
    const rows = next.flatMap((key) => {
      const record = records.get(key);

      return record ? [record] : [];
    });
    onSelectionChange?.([...next], rows, { type });
  }

  function sortDescription(columnKey: string, active: TableSorter | null): string {
    const next = getNextTableSorter(columnKey, active);

    return next?.order === 'ascend'
      ? strings.sortAscending
      : next?.order === 'descend' ? strings.sortDescending : strings.cancelSort;
  }

  function changeExpansion(record: Row, key: TableKey) {
    if (resolvedDisabled || !expandable || expandable.rowExpandable?.(record) === false) {
      return;
    }

    const next = new Set(expandedKeys);
    const expanded = !next.has(key);

    if (expanded)
      next.add(key);
    else next.delete(key);

    expandedRowKeys = [...next];
    onExpand?.(expanded, record);
    onExpandedRowsChange?.([...next]);
  }

  function expansionId(key: TableKey): string {
    const value = `${typeof key}:${key}`;

    return `ant-table-details-${id}-${Array.from(
      { length: value.length },
      (_, index) => value.charCodeAt(index).toString(16)
    ).join(
      '-'
    )}`;
  }

  function cellValue(record: Row, key: keyof Row | undefined): string {
    const value = key === undefined ? undefined : record[key];

    return value === null || value === undefined ? '' : String(value);
  }
</script>

<style>
  .ant-table-wrapper { min-width: 0; max-width: 100%; }
  .ant-table-content { max-width: 100%; overflow-x: auto; overscroll-behavior-x: contain; }
  .table-sticky { isolation: isolate; scroll-padding-inline: var(--ant-table-fixed-start-width, 0px) var(--ant-table-fixed-end-width, 0px); }
  .table-scroll-y { overflow-y: auto; overscroll-behavior-y: contain; scroll-padding-top: var(--ant-table-header-height, 0px); }
  .ant-table-wrapper .ant-table-cell.table-fixed-cell { position: var(--ant-table-fixed-position, relative); background: var(--ant-color-bg-container); }
  .ant-table-wrapper .ant-table-tbody > tr > th.table-fixed-cell { background: linear-gradient(var(--ant-table-header-bg), var(--ant-table-header-bg)) var(--ant-color-bg-container); }
  .ant-table-wrapper .table-scroll-y .ant-table-thead > tr > th { position: sticky; top: 0; z-index: 2; }
  /* Непрозрачная подложка нужна и для токенов темы с alpha. */
  .ant-table-wrapper .table-scroll-y .ant-table-thead > tr > th,
  .ant-table-wrapper .ant-table-thead > tr > .table-fixed-cell { background: linear-gradient(var(--ant-table-header-bg), var(--ant-table-header-bg)) var(--ant-color-bg-container); }
  .ant-table-wrapper .table-scroll-y .ant-table-thead > tr > th.ant-table-column-sort,
  .ant-table-wrapper .ant-table-thead > tr > .table-fixed-cell.ant-table-column-sort { background: linear-gradient(var(--ant-table-header-sort-active-bg), var(--ant-table-header-sort-active-bg)) var(--ant-color-bg-container); }
  .ant-table-wrapper .table-scroll-y .ant-table-thead > tr > th.ant-table-column-has-sorters:hover,
  .ant-table-wrapper .ant-table-thead > tr > .table-fixed-cell.ant-table-column-has-sorters:hover { background: linear-gradient(var(--ant-table-header-sort-hover-bg), var(--ant-table-header-sort-hover-bg)) var(--ant-color-bg-container); }
  .ant-table-wrapper .ant-table-tbody > tr > :where(td).table-fixed-cell.ant-table-column-sort { background: linear-gradient(var(--ant-table-body-sort-bg), var(--ant-table-body-sort-bg)) var(--ant-color-bg-container); }
  .ant-table-wrapper .ant-table-tbody > tr.ant-table-row-selected > .table-fixed-cell { background: linear-gradient(var(--ant-table-row-selected-bg), var(--ant-table-row-selected-bg)) var(--ant-color-bg-container); }
  .table-source-theme .ant-table-thead th.ant-table-column-has-sorters:hover .ant-table-column-sorter { color: var(--ant-table-header-icon-hover-color); }
  .ant-table-wrapper.table-source-theme .ant-table-thead th.ant-table-column-has-sorters.table-fixed-cell:hover { background: linear-gradient(var(--ant-table-fixed-header-sort-active-bg), var(--ant-table-fixed-header-sort-active-bg)) var(--ant-color-bg-container); }
  .table-source-theme:not(.table-hover-disabled) .ant-table-tbody > tr.ant-table-row:hover > td { background: var(--ant-table-row-hover-bg); }
  .table-source-theme:not(.table-hover-disabled) .ant-table-tbody > tr.ant-table-row.ant-table-row-selected:hover > :is(th, td) { background: var(--ant-table-row-selected-hover-bg); }
  .table-source-theme:not(.table-hover-disabled) .ant-table-tbody > tr.ant-table-row:hover > td.table-fixed-cell { background: linear-gradient(var(--ant-table-row-hover-bg), var(--ant-table-row-hover-bg)) var(--ant-color-bg-container); }
  .table-source-theme:not(.table-hover-disabled) .ant-table-tbody > tr.ant-table-row.ant-table-row-selected:hover > :is(th, td).table-fixed-cell { background: linear-gradient(var(--ant-table-row-selected-hover-bg), var(--ant-table-row-selected-hover-bg)) var(--ant-color-bg-container); }
  .ant-table-content:focus-visible, .sort-button:focus-visible { outline: var(--ant-line-width-focus) solid var(--ant-color-primary-border); outline-offset: 2px; }
  caption { padding: var(--ant-padding-sm); color: var(--ant-color-text-heading); text-align: start; font-weight: 600; }
  .sort-button { width: 100%; padding: 0; border: 0; background: transparent; color: inherit; font: inherit; text-align: inherit; cursor: pointer; }
  .sort-button:disabled { cursor: not-allowed; }
  .sort-button::after { content: none; }
  .column-heading { display: flex; align-items: center; gap: var(--ant-margin-xxs); }
  .column-heading > :first-child { flex: 1; }
  .sort-arrow { display: block; width: 0; height: 0; border-inline: 4px solid transparent; }
  .sort-arrow.active { color: var(--ant-color-primary); }
  .sort-up { margin-bottom: 2px; border-bottom: 5px solid currentColor; }
  .sort-down { border-top: 5px solid currentColor; }
  .loading-state { display: flex; align-items: center; gap: var(--ant-margin-xs); padding: var(--ant-padding-sm); color: var(--ant-color-primary); }
  .ant-table-wrapper .ant-table-row-expand-icon:disabled { color: var(--ant-color-text-disabled); border-color: var(--ant-table-border-color); cursor: not-allowed; }
  .ant-table-wrapper .ant-table .ant-table-tbody > tr.ant-table-expanded-row > td.ant-table-cell { padding: 0; }
  .expanded-content { position: sticky; inset-inline-start: 0; box-sizing: border-box; width: var(--ant-table-viewport-width, 100%); max-width: 100%; padding: var(--ant-table-cell-padding-block) var(--ant-table-cell-padding-inline); overflow-wrap: anywhere; }
  .ant-table-medium .expanded-content { padding: var(--ant-table-cell-padding-block-md) var(--ant-table-cell-padding-inline-md); }
  .ant-table-small .expanded-content { padding: var(--ant-table-cell-padding-block-sm) var(--ant-table-cell-padding-inline-sm); }
</style>

<div class={[
    'ant-table-wrapper ant-table-css-var',
    componentTheme.className,
    designTheme.enabled && 'table-source-theme',
    !rowHoverable && 'table-hover-disabled',
    config.direction === 'rtl' && 'ant-table-wrapper-rtl',
    className
  ]} dir={config.direction} style={rootStyle}>
  {#if loading}<div class="loading-state" role="status"><Spin size="small" aria-hidden />{strings.loadingText}</div>{/if}
  <div class={[
      'ant-table',
      `ant-table-${resolvedSize === 'middle' ? 'medium' : resolvedSize}`,
      bordered && 'ant-table-bordered',
      showHeader === false && !title && 'ant-table-no-header',
      !visibleRows.length && 'ant-table-empty'
    ]}>
    {#if title}<div class="ant-table-title">{@render title(panelData)}</div>{/if}
    <div class="ant-table-container">
      <!-- svelte-ignore a11y_no_noninteractive_tabindex (Фокус нужен для прокрутки таблицы с клавиатуры.) -->
      <div bind:this={content} class={[
          'ant-table-content',
          (scroll?.y !== undefined || fixedColumns.some(Boolean)) && 'table-sticky',
          scroll?.y !== undefined && 'table-scroll-y'
        ]} style:max-height={typeof scroll?.y === 'number' ? `${scroll.y}px` : scroll?.y} role="region" aria-label={caption ?? ariaLabel ?? strings.label} tabindex="0">
        <table bind:this={table} aria-label={ariaLabel ?? (caption ? undefined : strings.label)} aria-busy={loading || undefined} style:min-width={typeof scroll?.x === 'number' ? `${scroll.x}px` : scroll?.x}>
          {#if caption}<caption>{caption}</caption>{/if}
          {#if visibleColumns.length || dataOffset}<colgroup>
            {#if expandable}<col class={designTheme.enabled ? 'ant-table-expand-icon-col' : undefined}
              style:width={typeof expandable.columnWidth === 'number'
                ? `${expandable.columnWidth}px`
                : expandable.columnWidth ?? (designTheme.enabled ? undefined : '48px')} />{/if}
            {#if rowSelection}<col class={designTheme.enabled ? 'ant-table-selection-col' : undefined}
              style:width={typeof selectionWidth === 'number'
                ? `${selectionWidth}px` : selectionWidth} />{/if}
            {#each visibleColumns as column (column.key)}<col style:width={typeof column.width === 'number'
                ? `${column.width}px`
                : column.width} />{/each}
          </colgroup>{/if}
          {#if showHeader}<thead class="ant-table-thead">
            <tr>
              {#if expandable}
                <th scope="col" aria-label={expandable.columnTitle ?? strings.expandColumn} class={[
                    'ant-table-cell ant-table-row-expand-icon-cell',
                    expandable.fixed
                    && 'table-fixed-cell ant-table-cell-fix ant-table-cell-fix-start'
                  ]} style:inset-inline-start={expandable.fixed ? fixedCells[0].offset : undefined} style:z-index={expandable.fixed ? 3 : undefined}>{expandable.columnTitle ?? ''}</th>
              {/if}
              {#if rowSelection}
                <th scope="col" class={[
                    'ant-table-cell ant-table-selection-column',
                    selectionOptions?.fixed
                    && 'table-fixed-cell ant-table-cell-fix ant-table-cell-fix-start'
                  ]} style:inset-inline-start={selectionOptions?.fixed
                      ? fixedCells[expansionOffset].offset
                      : undefined} style:z-index={selectionOptions?.fixed ? 3 : undefined}>
                  <Checkbox skipGroup checked={selection.all} indeterminate={selection.some} disabled={resolvedDisabled || selection.disabled} aria-label={strings.selectAll} onCheckedChange={(checked) => changeSelection(
                      changeableKeys,
                      checked,
                      'all'
                    )} />
                </th>
              {/if}
              {#each visibleColumns as column, columnIndex (column.key)}
                {@const sortable = typeof column.sorter === 'function' || (mode === 'server' && column.sorter === true)}
                {@const order = tableData.sorter?.columnKey === column.key ? tableData.sorter.order : undefined}
                {@const fixed = fixedCells[columnIndex + dataOffset]}
                <th scope="col" class={[
                    'ant-table-cell',
                    column.className,
                    fixed.side
                    && `table-fixed-cell ant-table-cell-fix ant-table-cell-fix-${fixed.side}`,
                    sortable && 'ant-table-column-has-sorters',
                    order && 'ant-table-column-sort'
                  ]} style:inset-inline-start={fixed.side === 'start' ? fixed.offset : undefined} style:inset-inline-end={fixed.side === 'end' ? fixed.offset : undefined} style:z-index={fixed.side ? 3 : undefined} style:text-align={column.align} aria-sort={order === 'ascend'
                      ? 'ascending'
                      : order === 'descend' ? 'descending' : undefined}>
                  <div class="column-heading">
                    {#if sortable}
                      <button type="button" class="sort-button ant-table-column-sorters" disabled={resolvedDisabled} title={sortDescription(column.key, tableData.sorter)} onclick={() => changeSort(column.key)}>
                        <span class="ant-table-column-title">{column.title}</span>
                        <span class="ant-table-column-sorter" aria-hidden="true"><span class="ant-table-column-sorter-inner">{#if designTheme.enabled}<span class={[
                            'anticon anticon-caret-up ant-table-column-sorter-up',
                            order === 'ascend' && 'active'
                          ]}><svg viewBox="0 0 1024 1024" width="1em" height="1em" fill="currentColor" focusable="false"><path d="M858.9 689L530.5 308.2c-9.4-10.9-27.5-10.9-37 0L165.1 689c-12.2 14.2-1.2 35 18.5 35h656.8c19.7 0 30.7-20.8 18.5-35z" /></svg></span><span class={[
                              'anticon anticon-caret-down ant-table-column-sorter-down',
                              order === 'descend' && 'active'
                            ]}><svg viewBox="0 0 1024 1024" width="1em" height="1em" fill="currentColor" focusable="false"><path d="M840.4 300H183.6c-19.7 0-30.7 20.8-18.5 35l328.4 380.8c9.4 10.9 27.5 10.9 37 0L858.9 335c12.2-14.2 1.2-35-18.5-35z" /></svg></span>{:else}<span class={[
                            'sort-arrow sort-up',
                            order === 'ascend' && 'active'
                          ]}></span><span class={[
                              'sort-arrow sort-down',
                              order === 'descend' && 'active'
                            ]}></span>{/if}</span></span>
                      </button>
                    {:else}<span>{column.title}</span>{/if}
                    {#if column.filters && (mode === 'server' || column.onFilter)}
                      <TableFilter title={column.title} options={column.filters} value={Object.hasOwn(tableData.filters, column.key)
                          ? tableData.filters[column.key]
                          : []} multiple={column.filterMultiple !== false} disabled={resolvedDisabled} onApply={(values) => changeFilter(column.key, values)} />
                    {/if}
                  </div>
                </th>
              {:else}
                {#if !dataOffset}<th class="ant-table-cell"></th>{/if}
              {/each}
            </tr>
          </thead>{/if}
          <tbody class="ant-table-tbody">
            {#each visibleRows as row, index (row.key)}
              {@const expanded = row.canExpand && expandedKeys.has(row.key)}
              <tr class={[
                  'ant-table-row',
                  typeof rowClassName === 'function'
                    ? rowClassName(row.record, index, 0) : rowClassName,
                  rowSelection && selectedKeys.has(row.key) && 'ant-table-row-selected'
                ]}>
                {#if expandable}
                  <td class={[
                      'ant-table-cell ant-table-row-expand-icon-cell',
                      expandable.fixed
                      && 'table-fixed-cell ant-table-cell-fix ant-table-cell-fix-start'
                    ]} style:inset-inline-start={expandable.fixed ? fixedCells[0].offset : undefined} style:z-index={expandable.fixed ? 1 : undefined}>
                    {#if row.canExpand}
                      <button type="button" class={[
                          'ant-table-row-expand-icon',
                          expanded
                            ? 'ant-table-row-expand-icon-expanded'
                            : 'ant-table-row-expand-icon-collapsed'
                        ]} disabled={resolvedDisabled} aria-label={`${expanded
                            ? strings.collapseRow
                            : strings.expandRow} ${row.key}`} aria-expanded={expanded} aria-controls={expanded ? expansionId(row.key) : undefined} onclick={() => changeExpansion(row.record, row.key)}></button>
                    {/if}
                  </td>
                {/if}
                {#if rowSelection}
                  <td class={[
                      'ant-table-cell ant-table-selection-column',
                      selectionOptions?.fixed
                      && 'table-fixed-cell ant-table-cell-fix ant-table-cell-fix-start'
                    ]} style:inset-inline-start={selectionOptions?.fixed
                        ? fixedCells[expansionOffset].offset
                        : undefined} style:z-index={selectionOptions?.fixed ? 1 : undefined}>
                    <Checkbox skipGroup checked={selectedKeys.has(row.key)} disabled={resolvedDisabled || row.checkbox.disabled} aria-label={row.checkbox['aria-label']
                        ?? `${strings.selectRow} ${row.key}`} onCheckedChange={(checked) => changeSelection(
                            [row.key],
                            checked,
                            'single'
                          )} />
                  </td>
                {/if}
                {#each visibleColumns as column, columnIndex (column.key)}
                  {@const fixed = fixedCells[columnIndex + dataOffset]}
                  <svelte:element this={column.rowScope ? 'th' : 'td'} scope={column.rowScope} class={[
                      'ant-table-cell',
                      column.className,
                      fixed.side
                      && `table-fixed-cell ant-table-cell-fix ant-table-cell-fix-${fixed.side}`,
                      tableData.sorter?.columnKey === column.key && 'ant-table-column-sort'
                    ]} style:inset-inline-start={fixed.side === 'start' ? fixed.offset : undefined} style:inset-inline-end={fixed.side === 'end' ? fixed.offset : undefined} style:z-index={fixed.side ? 1 : undefined} style:text-align={column.align}>
                    {#if column.render}{@render column.render(row.record, index)}{:else}{cellValue(row.record, column.dataIndex)}{/if}
                  </svelte:element>
                {:else}
                  {#if !dataOffset}<td class="ant-table-cell"></td>{/if}
                {/each}
              </tr>
              {#if expanded && expandable}
                <tr class="ant-table-expanded-row"><td class="ant-table-cell" colspan={Math.max(visibleColumns.length + dataOffset, 1)}><div class="expanded-content" id={expansionId(row.key)}>{@render expandable.expandedRowRender(row.record, index)}</div></td></tr>
              {/if}
            {:else}
              <tr class="ant-table-placeholder"><td class="ant-table-cell" colspan={Math.max(visibleColumns.length + dataOffset, 1)}>{#if !loading}
                {#snippet nativeEmpty()}<Empty image="simple" description={strings.emptyText} />{/snippet}
                <RenderEmpty componentName="Table" local={empty} fallback={nativeEmpty} />
              {:else}&nbsp;{/if}</td></tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
    {#if footer}<div class="ant-table-footer">{@render footer(panelData)}</div>{/if}
  </div>
  {#if pagination !== false}
    <Pagination {...pagination} total={paging.total} current={paging.current} pageSize={paging.pageSize} disabled={resolvedDisabled} size={resolvedSize} class="ant-table-pagination ant-table-pagination-end" onChange={changePage} />
  {/if}
</div>
