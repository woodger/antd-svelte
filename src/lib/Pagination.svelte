<script module lang="ts">
  export type { PaginationProps } from './pagination.types';
</script>

<script lang="ts">
  import { tick, untrack } from 'svelte';
  import { useConfig } from './config-context';
  import { provideFormField, useFormField } from './form-context';
  import { createBreakpoint } from './grid-breakpoint.model.svelte.js';
  import { getPaginationItems, getPaginationState, getPageSizeOptions } from './pagination.engine';
  import { ruRU } from './types';
  import type {
    PaginationProps,
    PaginationContent,
    PaginationSemantic,
    PaginationSizeChangerInfo,
    PaginationSizeChangerProps
  } from './pagination.types';
  import PaginationControl from './PaginationControl.svelte';
  import Select from './Select.svelte';

  let { current = $bindable(), pageSize = $bindable(), ...rawProps }: PaginationProps = $props();
  let {
    total = 0,
    defaultCurrent = 1,
    defaultPageSize = 10,
    pageSizeOptions = [10, 20, 50, 100],
    showSizeChanger,
    totalBoundaryShowSizeChanger,
    hideOnSinglePage = false,
    showTotal,
    showLessItems = false,
    showPrevNextJumpers = true,
    showQuickJumper = false,
    showTitle = true,
    simple = false,
    align,
    responsive = false,
    disabled,
    size,
    locale,
    onChange,
    onShowSizeChange,
    itemRender,
    prevIcon,
    nextIcon,
    jumpPrevIcon,
    jumpNextIcon,
    components,
    selectComponentClass,
    classNames,
    styles,
    rootClassName,
    prefixCls = 'ant-pagination',
    selectPrefixCls,
    id,
    role,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
    'aria-describedby': ariaDescribedby,
    class: className = '',
    style,
    ...attributes
  } = $derived(rawProps);

  const config = useConfig();
  const field = useFormField();
  provideFormField(field ? {
    get status() { return field.status; },
    get disabled() { return field.disabled; },
    required: false,
    describedBy: undefined,
    onBlur() { field.onBlur(); }
  } : undefined);
  const breakpoint = createBreakpoint();
  const initialCurrent = untrack(() => defaultCurrent);
  const initialSize = untrack(() => defaultPageSize);
  let navigation = $state<HTMLElement>();
  let simpleElement = $state<HTMLInputElement>();
  let quickElement = $state<HTMLInputElement>();
  let pagination = $derived(getPaginationState(
    total,
    current ?? initialCurrent,
    pageSize ?? initialSize
  ));
  let items = $derived(getPaginationItems(pagination, showLessItems, showPrevNextJumpers));
  let displayedCurrent = $derived(pagination.current);
  let blocked = $derived(disabled ?? config.componentDisabled);
  let explicitSize = $derived(size ?? config.explicitComponentSize);
  let resolvedSize = $derived(size ?? config.componentSize);
  let mini = $derived(resolvedSize === 'small'
    || responsive && !explicitSize && Boolean(breakpoint.screens.xs));
  let strings = $derived.by(() => {
    const context = config.locale.pagination;
    const base = { ...ruRU.pagination, ...context, ...locale };
    return {
      ...base,
      previous: locale?.prev_page ?? locale?.previous ?? context?.prev_page ?? base.previous,
      next: locale?.next_page ?? locale?.next ?? context?.next_page ?? base.next,
      page: context?.page ?? ruRU.pagination.page,
      jumpPrevious: (showLessItems ? locale?.prev_3 : locale?.prev_5)
        ?? locale?.jumpPrevious ?? (showLessItems ? context?.prev_3 : context?.prev_5)
        ?? base.jumpPrevious,
      jumpNext: (showLessItems ? locale?.next_3 : locale?.next_5)
        ?? locale?.jumpNext ?? (showLessItems ? context?.next_3 : context?.next_5)
        ?? base.jumpNext,
      pageSize: locale?.page_size ?? locale?.pageSize ?? context?.page_size ?? base.pageSize,
      itemsPerPage: locale?.items_per_page ?? locale?.itemsPerPage
        ?? context?.items_per_page ?? base.itemsPerPage,
      jumpTo: locale?.jump_to ?? locale?.jumpTo ?? context?.jump_to ?? base.jumpTo,
      jumpToConfirm: locale?.jump_to_confirm ?? locale?.jumpToConfirm
        ?? context?.jump_to_confirm ?? base.jumpToConfirm,
      suffix: locale?.page ?? locale?.pageSuffix ?? context?.pageSuffix ?? ''
    };
  });
  let showChanger = $derived(showSizeChanger ?? config.pagination?.showSizeChanger
    ?? pagination.total > (totalBoundaryShowSizeChanger
      ?? config.pagination?.totalBoundaryShowSizeChanger ?? 50));
  let selectConfig: PaginationSizeChangerProps = $derived(
    typeof showChanger === 'object' ? showChanger : {}
  );
  let sizeDisabled = $derived(selectConfig.disabled ?? blocked);
  let sizeOptions = $derived(getPageSizeOptions(pageSizeOptions.map(Number), pagination.pageSize)
    .map(value => ({ value, label: `${value} ${strings.itemsPerPage}` })));
  let sizeRenderer = $derived(components?.sizeChanger ?? selectComponentClass);
  let sizeInfo: PaginationSizeChangerInfo = $derived({
    ...(components?.sizeChanger ? {} : { ...selectConfig, size: explicitSize }),
    value: pagination.pageSize,
    disabled: Boolean(components?.sizeChanger ? blocked : sizeDisabled),
    class: components?.sizeChanger ? `${prefixCls}-options-size-changer`
      : join([`${prefixCls}-options-size-changer`, `${prefixCls}-options-size-changer-select`,
        selectConfig.class], ' ')!,
    prefixCls: selectPrefixCls ?? 'ant-select',
    options: components?.sizeChanger ? sizeOptions : selectConfig.options ?? sizeOptions,
    onChange: value => components?.sizeChanger ? chooseSize(value, true, blocked)
      : chooseSelectSize(value, true)
  });
  let semanticProps = $derived({
    ...rawProps,
    current,
    pageSize,
    size: size ?? config.explicitComponentSize
  });
  let contextClasses = $derived(resolve(config.pagination?.classNames));
  let localClasses = $derived(resolve(classNames));
  let contextStyles = $derived(resolve(config.pagination?.styles));
  let localStyles = $derived(resolve(styles));
  let rootStyle = $derived(join([contextStyles.root, config.pagination?.style,
    localStyles.root, style], ';'));
  let itemClass = $derived(join([contextClasses.item, localClasses.item], ' '));
  let itemStyle = $derived(join([contextStyles.item, localStyles.item], ';'));
  let simpleText = $state<string | number>(untrack(() => pagination.current));
  let quickText = $state('');
  let goButton = $derived(
    typeof showQuickJumper === 'object' ? showQuickJumper.goButton : undefined
  );
  let quickGo = $derived(Boolean(showQuickJumper)
    && pagination.total > pagination.pageSize);
  let count = $derived(Math.ceil(pagination.total / pagination.pageSize));
  let rtl = $derived(config.direction === 'rtl');
  let forwarded = $derived(Object.fromEntries(Object.entries(attributes)
    .filter(([name]) => name.startsWith('aria-') || name.startsWith('data-'))));

  $effect(() => {
    if (responsive) return breakpoint.connect(window);
  });

  $effect(() => {
    simpleText = displayedCurrent;
  });

  $effect(() => {
    if (simpleElement) simpleElement.defaultValue = String(simpleText);
    if (quickElement) quickElement.defaultValue = quickText;
  });

  function join(values: (string | undefined)[], separator: string) {
    return values.filter(Boolean).join(separator) || undefined;
  }

  function resolve(value: PaginationSemantic | undefined) {
    return (typeof value === 'function' ? value({ props: semanticProps }) : value) ?? {};
  }

  async function changePage(requested: number, event?: MouseEvent) {
    if (blocked || !Number.isInteger(requested) || requested === pagination.current
      || pagination.total <= 0) return;

    const next = getPaginationState(pagination.total, requested, pagination.pageSize).current;
    const size = pagination.pageSize;
    const view = navigation?.ownerDocument.defaultView;
    const button = view && event?.currentTarget instanceof view.HTMLElement
      ? event.currentTarget : undefined;
    simpleText = next;
    current = next;
    onChange?.(next, size);
    await tick();

    if (button && (!button.isConnected || button.matches(':disabled'))) {
      navigation?.querySelector<HTMLElement>('[aria-current="page"]')?.focus();
    }
  }

  function chooseSize(value: number, allowSame = false, disabled = sizeDisabled) {
    if (disabled || !allowSame && value === pagination.pageSize) return;

    const previous = pagination.current;
    const next = getPaginationState(pagination.total, previous, value);
    simpleText = next.current;
    pageSize = next.pageSize;
    current = next.current;
    onShowSizeChange?.(previous, next.pageSize);
    onChange?.(next.current, next.pageSize);
  }

  function chooseSelectSize(value: number, allowSame = false) {
    const props = selectConfig;
    const options = props.options ?? sizeOptions;
    chooseSize(value, allowSame);
    props.onValueChange?.(value);
    props.onChange?.(value, options.find(option => option.value === value));
  }

  function readSimple(input: HTMLInputElement): string | number {
    const value = input.value;
    if (value === '') return '';
    if (Number.isNaN(Number(value))) return simpleText;
    return Number(value) >= count ? count : Number(value);
  }

  function handleSimpleInput(event: Event & { currentTarget: HTMLInputElement; }) {
    simpleText = readSimple(event.currentTarget);
    event.currentTarget.value = String(simpleText);
  }

  function handleSimpleKey(event: KeyboardEvent & { currentTarget: HTMLInputElement; }) {
    const value = Number(readSimple(event.currentTarget));
    if (event.key === 'Enter') void changePage(value);
    else if (event.key === 'ArrowUp') void changePage(value - 1);
    else if (event.key === 'ArrowDown') void changePage(value + 1);
  }

  function quickJump() {
    if (!quickText) return;

    const value = Number(quickText);
    quickText = '';
    void changePage(value);
  }

  function handleQuickBlur(event: FocusEvent & { currentTarget: HTMLInputElement; }) {
    if (goButton || !quickText) return;

    const value = Number(quickText);
    quickText = '';
    const target = event.relatedTarget;
    const view = event.currentTarget.ownerDocument.defaultView;
    if (view && target instanceof view.Element && target.closest(
      `.${prefixCls}-item, .${prefixCls}-prev, .${prefixCls}-next, .${prefixCls}-jump-prev, .${prefixCls}-jump-next`
    )) return;

    void changePage(value);
  }
</script>

<style>
  .ant-pagination { flex-wrap: wrap; row-gap: var(--ant-margin-xs); }
  .ant-pagination .ant-pagination-options { display: inline-flex; align-items: center; }
  .ant-pagination .ant-pagination-options :global(.container) { min-width: 90px; }
  .quick-button { cursor: pointer; font: inherit; }
  input:focus-visible, .quick-button:focus-visible { outline: var(--ant-line-width-focus) solid var(--ant-color-primary-border); outline-offset: 1px; }
  @media (max-width: 576px) { .ant-pagination .ant-pagination-options-quick-jumper, .ant-pagination .quick-options-only { display: none; } }
  @media (prefers-reduced-motion: reduce) { input, .ant-pagination :global(.ant-pagination-item), .ant-pagination :global(.ant-pagination-item-link) { transition: none; } }
</style>

{#snippet content(node: PaginationContent | undefined)}
  {#if typeof node === 'function'}{@render node()}
  {:else if typeof node !== 'boolean'}{node}{/if}
{/snippet}

{#snippet confirm(simpleMode: boolean)}
  <button type="button" disabled={blocked}
    class={['quick-button', !simpleMode && goButton === true
      && `${prefixCls}-options-quick-jumper-button`]}
    onclick={() => {
      if (simpleMode) void changePage(Number(simpleText));
      quickJump();
    }}>
    {#if goButton === true}{strings.jumpToConfirm}{:else}{@render content(goButton)}{/if}
  </button>
{/snippet}

{#if !hideOnSinglePage || pagination.total > pagination.pageSize}
  <nav {...forwarded} bind:this={navigation} {id} {role} aria-label={ariaLabel ?? strings.label}
    aria-labelledby={ariaLabelledby} aria-describedby={ariaDescribedby} dir={config.direction}
    class={[config.pagination?.class, rootClassName, contextClasses.root, localClasses.root]}
    style={rootStyle}>
    <ul class={[prefixCls, 'ant-pagination-css-var', `${prefixCls}-${resolvedSize}`,
        mini && `${prefixCls}-mini`, align && `${prefixCls}-${align}`,
        simple && `${prefixCls}-simple`, blocked && `${prefixCls}-disabled`,
        rtl && `${prefixCls}-rtl`, config.input?.variant && config.input.variant !== 'outlined'
          && `${prefixCls}-${config.input.variant}`, className]}>
      {#if showTotal}<li class={`${prefixCls}-total-text`}>
        {@render showTotal(pagination.total, pagination.range)}
      </li>{/if}
      <li class={[`${prefixCls}-prev`, itemClass, (blocked || pagination.current <= 1)
          && `${prefixCls}-disabled`]} style={itemStyle}
        title={showTitle ? strings.previous : undefined}>
        <PaginationControl page={Math.max(0, pagination.current - 1)} type="prev"
          disabled={blocked || pagination.current <= 1} label={strings.previous}
          prefix={prefixCls} {rtl} icon={prevIcon} {itemRender}
          onClick={event => changePage(pagination.current - 1, event)} />
      </li>
      {#if simple}
        <li class={[`${prefixCls}-simple-pager`, itemClass]} style={itemStyle}
          title={showTitle ? `${pagination.current}/${count}` : undefined}>
          {#if typeof simple === 'object' && simple.readOnly}{simpleText}
          {:else}<input bind:this={simpleElement} type="text" size="3" value={simpleText}
            aria-label={strings.jumpTo} disabled={blocked} oninput={handleSimpleInput}
            onkeyup={handleSimpleKey}
            onblur={event => changePage(Number(readSimple(event.currentTarget)))}
            onkeydown={event => {
              if (event.key === 'ArrowUp' || event.key === 'ArrowDown') event.preventDefault();
            }} />{/if}<span class={`${prefixCls}-slash`}>/</span>{count}
        </li>
      {:else}
        {#each items as item (item)}
          {#if typeof item === 'number'}
            <li class={[`${prefixCls}-item`, `${prefixCls}-item-${item}`, itemClass,
                pagination.total > 0 && item === pagination.current && `${prefixCls}-item-active`,
                pagination.total === 0 && `${prefixCls}-item-disabled`,
                items[items.indexOf(item) - 1] === 'jump-prev' && `${prefixCls}-item-after-jump-prev`,
                items[items.indexOf(item) + 1] === 'jump-next' && `${prefixCls}-item-before-jump-next`]}
              style={itemStyle} title={showTitle ? String(item) : undefined}>
              <PaginationControl page={item} type="page" label={`${strings.page} ${item}`}
                title={showTitle ? String(item) : undefined}
                active={pagination.total > 0 && item === pagination.current}
                disabled={blocked || pagination.total === 0} prefix={prefixCls} {rtl} {itemRender}
                onClick={event => changePage(item, event)} />
            </li>
          {:else}
            {@const target = item === 'jump-prev'
              ? Math.max(1, pagination.current - (showLessItems ? 3 : 5))
              : Math.min(count, pagination.current + (showLessItems ? 3 : 5))}
            {@const label = item === 'jump-prev' ? strings.jumpPrevious : strings.jumpNext}
            {@const icon = item === 'jump-prev' ? jumpPrevIcon : jumpNextIcon}
            <li class={[`${prefixCls}-${item}`,
                (icon === undefined || Boolean(icon))
                  && `${prefixCls}-${item}-custom-icon`]}
              title={showTitle ? label : undefined}>
              <PaginationControl page={target} type={item} disabled={blocked} {label}
                prefix={prefixCls} {rtl} {itemRender}
                {icon}
                onClick={event => changePage(target, event)} />
            </li>
          {/if}
        {/each}
      {/if}
      <li class={[`${prefixCls}-next`, itemClass, (blocked || pagination.current >= count)
          && `${prefixCls}-disabled`]} style={itemStyle}
        title={showTitle ? strings.next : undefined}>
        <PaginationControl page={Math.min(count, pagination.current + 1)} type="next"
          disabled={blocked || pagination.current >= count} label={strings.next}
          prefix={prefixCls} {rtl} icon={nextIcon} {itemRender}
          onClick={event => changePage(pagination.current + 1, event)} />
      </li>
      {#if showChanger || quickGo}
        <li class={[`${prefixCls}-options`, !showChanger && 'quick-options-only']}>
          {#if showChanger}
            {#if sizeRenderer}{@render sizeRenderer(sizeInfo)}
            {:else}<Select
              showSearch
              {...selectConfig} options={selectConfig.options ?? sizeOptions}
              size={resolvedSize}
              disabled={sizeDisabled} aria-label={selectConfig['aria-label'] ?? strings.pageSize}
              class={[`${prefixCls}-options-size-changer`,
                  `${prefixCls}-options-size-changer-select`, selectConfig.class].filter(Boolean)
                .join(' ')}
              bind:value={() => pagination.pageSize, () => {}}
              onValueChange={value => {
                if (value !== undefined) chooseSelectSize(value);
              }}
            />{/if}
          {/if}
          {#if quickGo}<div class={`${prefixCls}-options-quick-jumper`}>
            {strings.jumpTo}<input bind:this={quickElement} type="text" value={quickText}
              disabled={blocked} aria-label={locale?.page || strings.page}
              oninput={event => {
                if (/^\d*$/.test(event.currentTarget.value)) quickText = event.currentTarget.value;
                else event.currentTarget.value = quickText;
              }} onkeyup={event => { if (event.key === 'Enter') quickJump(); }}
              onblur={handleQuickBlur} />
            {strings.suffix}{#if goButton}
              {#if simple}
                <!-- В upstream здесь вложенный li; span сохраняет валидную структуру списка. -->
                <span class={`${prefixCls}-simple-pager`}
                  title={showTitle ? `${strings.jumpTo}${pagination.current}/${count}` : undefined}>
                  {@render confirm(true)}
                </span>
              {:else}{@render confirm(false)}{/if}
            {/if}
          </div>{/if}
        </li>
      {/if}
    </ul>
  </nav>
{/if}
