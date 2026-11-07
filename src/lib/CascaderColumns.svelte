<script lang="ts" generics="OptionType extends CascaderOption = CascaderOption">
  import { tick } from 'svelte';
  import type { Snippet } from 'svelte';
  import type {
    CascaderContent,
    CascaderFieldNames,
    CascaderOption,
    CascaderPath,
    CascaderProps
  } from './cascader.types';
  import { cascaderHighlight, cascaderPathKey, type CascaderRow } from './cascader.engine';
  import Icon from './Icon.svelte';

  let {
    columns,
    active,
    search,
    searchRender,
    fields,
    checked,
    half,
    loading,
    multiple,
    disabled,
    hover,
    expandIcon,
    loadingIcon,
    rtl,
    optionRender,
    id,
    label,
    classes,
    styles,
    panel,
    empty,
    onActivate,
    onSelect,
    onClose,
    onKeyDown,
    onKeyUp,
    onScroll
  }: {
    columns: CascaderRow<OptionType>[][];
    active: CascaderPath;
    search: string;
    searchRender?: Snippet<[string, OptionType[], string, Required<CascaderFieldNames>]>;
    fields: Required<CascaderFieldNames>;
    checked: readonly string[];
    half: readonly string[];
    loading: readonly string[];
    multiple: boolean;
    disabled: boolean;
    hover: boolean;
    expandIcon?: CascaderContent;
    loadingIcon?: CascaderContent;
    rtl: boolean;
    optionRender?: CascaderProps<OptionType>['optionRender'];
    id: string;
    label: string;
    classes: { list?: string; listItem?: string; };
    styles: { list?: string; listItem?: string; };
    panel: boolean;
    empty: Snippet;
    onActivate: (row: CascaderRow<OptionType>, hover: boolean) => void;
    onSelect: (row: CascaderRow<OptionType>, keyboard?: boolean) => void;
    onClose?: () => void;
    onKeyDown: (event: KeyboardEvent) => void;
    onKeyUp: (event: KeyboardEvent) => void;
    onScroll?: CascaderProps['onPopupScroll'];
  } = $props();
  let host = $state<HTMLDivElement>();

  $effect(() => {
    void active;
    const root = host;
    let disposed = false;
    void tick().then(() => {
      if (disposed || !root) return;
      const items = [...root.querySelectorAll<HTMLElement>('[data-cascader-active="true"]')];
      if (panel && root.contains(root.ownerDocument.activeElement))
        items.at(-1)?.querySelector<HTMLButtonElement>('button')?.focus({ preventScroll: true });
      for (const item of items) {
        const menu = item.parentElement!;
        const top = item.offsetTop - menu.offsetTop;
        if (top < menu.scrollTop)
          menu.scrollTop = top;
        else if (top + item.offsetHeight > menu.scrollTop + menu.clientHeight)
          menu.scrollTop = top + item.offsetHeight - menu.clientHeight;
      }
    });
    return () => { disposed = true; };
  });

  function activeRow(row: CascaderRow<OptionType>, column: number) {
    return search ? row.key === active[0] || row.option[fields.value] === active[0]
      : row.key === cascaderPathKey(active.slice(0, column + 1));
  }

  function optionAttributes(option: OptionType, prefix: 'aria-' | 'data-') {
    return Object.fromEntries(Object.entries(option).filter(
      ([key]) => key.startsWith(prefix)
    ));
  }
</script>

<style>
  .ant-cascader-menu { position: relative; }
  .cascader-option { display:flex;align-items:center;width:100%;min-width:0;padding:0;border:0;background:transparent;color:inherit;font:inherit;line-height:inherit;text-align:start;cursor:inherit; }
  .cascader-option:focus-visible { outline:2px solid var(--ant-color-primary);outline-offset:2px; }
  .ant-cascader-checkbox { flex:none; }
  .cascader-option .ant-cascader-menu-item-content { padding:0;text-align:start; }
  .ant-cascader-menu-item-expand-icon,.ant-cascader-menu-item-loading-icon { display:flex;flex:none; }
</style>

{#snippet content(value: CascaderContent | undefined)}
  {#if typeof value === 'function'}{@render value()}
  {:else if typeof value !== 'boolean'}{value ?? ''}{/if}
{/snippet}
{#snippet rowLabel(row: CascaderRow<OptionType>)}
  {#if search && searchRender}
    {@render searchRender(search, row.options, 'ant-cascader', fields)}
  {:else if search}
    {#each row.options as option, index}
      {#if index > 0}{' / '}{/if}
      {@const label = option[fields.label] as CascaderContent | undefined}
      {#if typeof label === 'string' || typeof label === 'number'}
        {#each cascaderHighlight(label, search) as part}
          {#if part.match}<span class="ant-cascader-menu-item-keyword">{part.text}</span>
          {:else}{part.text}{/if}
        {/each}
      {:else}{@render content(label)}{/if}
    {/each}
  {:else}{@render content(row.option[fields.label] as CascaderContent | undefined)}{/if}
{/snippet}

<div bind:this={host} id={id} class={['ant-cascader-menus', !columns.length && 'ant-cascader-menu-empty']}>
  {#each columns as rows, column}
    <ul role="menu" aria-label={label} tabindex={panel && column === 0 ? 0 : -1}
      class={['ant-cascader-menu', classes.list]} style={styles.list}
      onkeydown={onKeyDown} onkeyup={onKeyUp} onscroll={onScroll}>
      {#each rows as row (row.key)}
        {@const blocked = disabled || row.disabled}
        {@const selected = checked.includes(row.key)}
        {@const indeterminate = half.includes(row.key)}
        {@const pending = loading.includes(row.key)}
        {@const current = activeRow(row, column)}
        {@const title = typeof row.option.title === 'string' ? row.option.title
          : typeof row.option[fields.label] === 'string' ? row.option[fields.label] as string
          : undefined}
        <li {...optionAttributes(row.option, 'data-')} role="presentation" class={[
          'ant-cascader-menu-item',
          !row.leaf && 'ant-cascader-menu-item-expand',
          current && 'ant-cascader-menu-item-active',
          blocked && 'ant-cascader-menu-item-disabled',
          pending && 'ant-cascader-menu-item-loading',
          classes.listItem
        ]} style={styles.listItem}
          data-cascader-active={current} data-path-key={row.key}
          onmouseenter={() => { if (hover && !blocked) onActivate(row, true); }}
          ondblclick={onClose}
          onmousedown={event => { if (!panel) event.preventDefault(); }}
          onclick={event => {
            if (event.target !== event.currentTarget) return;
            const button = event.currentTarget.querySelector('button');
            if (panel) button?.focus();
            button?.click();
          }}>
          <button {...optionAttributes(row.option, 'aria-')} type="button" role="menuitemcheckbox"
            id={`${id}-${encodeURIComponent(row.key)}`} class="cascader-option" {title}
            disabled={blocked} tabindex="-1" aria-checked={selected}
            aria-disabled={blocked || undefined} aria-busy={pending || undefined}
            onclick={event => {
              if (blocked) return;
              const target = event.target;
              const checkbox = target instanceof Element && target.closest('.ant-cascader-checkbox');
              if (!checkbox) onActivate(row, hover);
              if (!row.option.disableCheckbox && (checkbox || !multiple || row.leaf))
                onSelect(row);
            }}>
            {#if multiple}
              <span class={[
                'ant-cascader-checkbox',
                selected && 'ant-cascader-checkbox-checked',
                indeterminate && 'ant-cascader-checkbox-indeterminate',
                (blocked || row.option.disableCheckbox) && 'ant-cascader-checkbox-disabled'
              ]} aria-hidden="true"><span class="ant-cascader-checkbox-inner"></span></span>
            {/if}
            <span class="ant-cascader-menu-item-content">
              {#snippet originNode()}{@render rowLabel(row)}{/snippet}
              {#if optionRender}
                {@render optionRender(row.option, {
                  path: row.options, searchValue: search, originNode
                })}
              {:else}{@render originNode()}{/if}
            </span>
            {#if pending && loadingIcon !== false}
              <span class="ant-cascader-menu-item-loading-icon" aria-hidden="true">
                {#if loadingIcon == null}<Icon name="loading" />
                {:else}{@render content(loadingIcon)}{/if}
              </span>
            {:else if !pending && !row.leaf && expandIcon !== false}
              <span class="ant-cascader-menu-item-expand-icon" aria-hidden="true">
                {#if expandIcon == null}<Icon name={rtl ? 'left' : 'right'} />
                {:else}{@render content(expandIcon)}{/if}
              </span>
            {/if}
          </button>
        </li>
      {/each}
    </ul>
  {:else}
    {#if panel}{@render empty()}
    {:else}<ul role="menu" aria-label={label} class={['ant-cascader-menu', classes.list]}
      style={styles.list} onscroll={onScroll}>
      <li role="presentation" class={[
        'ant-cascader-menu-item ant-cascader-menu-item-disabled', classes.listItem
      ]} style={styles.listItem} ondblclick={onClose}>
        <span role="menuitemcheckbox" aria-checked="false" aria-disabled="true">{@render empty()}</span>
      </li>
    </ul>{/if}
  {/each}
</div>
