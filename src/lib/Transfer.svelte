<script module lang="ts">
  export type { TransferProps } from './transfer.types';
</script>

<script lang="ts" generics="RecordType extends object = TransferItem">
  import { untrack } from 'svelte';
  import { useConfig } from './config-context';
  import { useComponentTheme } from './theme-component.svelte';
  import { provideFormField, useForm, useFormField } from './form-context';
  import {
    transferData, transferDisabled, transferKey, transferMove, transferSelectAll,
    transferSelection, transferSelectRange
  } from './transfer.engine';
  import { transferRuRU } from './transfer.locale';
  import TransferSection from './TransferSection.svelte';
  import TransferAction from './TransferAction.svelte';
  import Empty from './Empty.svelte';
  import DefaultRenderEmpty from './DefaultRenderEmpty.svelte';
  import type {
    TransferDirection, TransferItem, TransferKey, TransferListProps, TransferProps,
    TransferSemanticValue, TransferSlots, TransferSectionSlots
  } from './transfer.types';

  let { nativeElement = $bindable(), ...props }: TransferProps<RecordType> = $props();
  const config = useConfig();
  const componentTheme = useComponentTheme('Transfer');
  const form = useForm();
  const field = useFormField(() => nativeElement);
  // Служебные checkbox/search не являются отдельными полями внешнего FormItem.
  provideFormField(field ? {
    get disabled() {
      return field.disabled;
    },
    get status() {
      return field.status;
    },
    required: false,
    describedBy: undefined,
    onBlur() {
      field.onBlur();
    }
  } : undefined);
  let localSelected = $state<TransferKey[]>([]);
  let wasControlled = untrack(() => props.selectedKeys !== undefined);
  const anchors: Record<TransferDirection, number | null> = { left: null, right: null };
  const previousKeys: Record<TransferDirection, TransferKey[]> = { left: [], right: [] };
  let prefix = $derived(props.prefixCls ?? 'ant-transfer');
  let disabled = $derived(props.disabled ?? form?.disabled ?? config.componentDisabled);
  let status = $derived(props.status || field?.status);
  let data = $derived(transferData(props.dataSource ?? [], props.targetKeys ?? [], props.rowKey));
  let selected = $derived(props.selectedKeys ?? localSelected);
  let sourceSelected = $derived(transferSelection(selected, data.left));
  let targetSelected = $derived(transferSelection(selected, data.right));
  let keysSignature = $derived(JSON.stringify([data.left, data.right].map(records =>
    [...new Set(records.map(transferKey))].map(key => [typeof key, String(key)]))));
  let semanticInfo = $derived({ props: { ...props, nativeElement, disabled } });
  let contextClasses = $derived(resolveSlots(config.transfer?.classNames));
  let localClasses = $derived(resolveSlots(props.classNames));
  let contextStyles = $derived(resolveSlots(config.transfer?.styles));
  let localStyles = $derived(resolveSlots(props.styles));
  let classes = $derived({
    root: join([contextClasses.root, localClasses.root], ' '),
    actions: join([contextClasses.actions, localClasses.actions], ' ')
  });
  let rootStyle = $derived(join([componentTheme.style, contextStyles.root, config.transfer?.style,
    localStyles.root, props.style], ';'));
  let actionsStyle = $derived(join([contextStyles.actions,
    localStyles.actions], ';'));
  let contextEmpty = $derived(config.renderEmpty?.('Transfer'));
  let locale = $derived({ ...transferRuRU, ...config.locale.transfer,
    notFoundContent: contextEmpty || defaultEmpty, ...props.locale });
  let titles = $derived(props.titles ?? locale.titles ?? []);
  let icon = $derived(props.selectionsIcon ?? config.transfer?.selectionsIcon);
  let actions = $derived(props.actions ?? []);
  let rightActive = $derived(data.left.some(item =>
    sourceSelected.includes(transferKey(item)) && !transferDisabled(item)));
  let leftActive = $derived(data.right.some(item =>
    targetSelected.includes(transferKey(item)) && !transferDisabled(item)));
  let source = $derived(listProps('left'));
  let target = $derived(listProps('right'));
  let attributes = $derived(Object.fromEntries(Object.entries(props).filter(([key]) =>
    key.startsWith('aria-') || key.startsWith('data-'))));

  $effect(() => {
    const controlled = props.selectedKeys;

    if (controlled !== undefined) localSelected = [...controlled];
    else if (wasControlled) localSelected = [];

    wasControlled = controlled !== undefined;
  });

  $effect(() => {
    void keysSignature;
    untrack(() => {
      localSelected = [...sourceSelected, ...targetSelected];
    });
  });

  function join(parts: (string | undefined | null)[], separator: string) {
    return parts.filter(Boolean).join(separator) || undefined;
  }

  function resolveSlots(value: TransferSemanticValue<string> | undefined): TransferSlots<string> {
    return (typeof value === 'function' ? value(semanticInfo) : value) ?? {};
  }

  function sectionSlots(side: 'source' | 'target', styles: boolean): TransferSectionSlots<string> {
    const context = styles ? contextStyles : contextClasses;
    const local = styles ? localStyles : localClasses;
    const keys = ['section', 'header', 'title', 'body', 'list', 'item',
      'itemIcon', 'itemContent', 'footer'] as const;

    return Object.fromEntries(keys.map(key => [key, join([
      context[key], local[key], context[side]?.[key], local[side]?.[key]
    ], styles ? ';' : ' ')]));
  }

  function listProps(direction: TransferDirection): TransferListProps<RecordType> {
    const left = direction === 'left';

    return {
      ...locale,
      prefixCls: prefix,
      direction: config.direction === 'rtl' ? left ? 'right' : 'left' : direction,
      disabled,
      dataSource: left ? data.left : data.right,
      checkedKeys: left ? sourceSelected : targetSelected,
      titleText: titles[left ? 0 : 1],
      render: props.render,
      filterOption: props.filterOption,
      showSearch: props.showSearch,
      showSelectAll: props.showSelectAll,
      showRemove: !left && props.oneWay,
      selectAllLabel: props.selectAllLabels?.[left ? 0 : 1],
      pagination: !props.children && props.pagination,
      selectionsIcon: icon,
      classNames: sectionSlots(left ? 'source' : 'target', false),
      styles: sectionSlots(left ? 'source' : 'target', true),
      footer: props.footer,
      renderList: props.children,
      onItemSelect: (key, check, event, items) => select(direction, key, check, event, items),
      onItemSelectAll: (keys, check) => selectAll(direction, keys, check),
      onItemRemove: left ? undefined : remove,
      onScroll: event => props.onScroll?.(direction, event),
      handleFilter: event => search(direction, event.currentTarget.value),
      handleClear: () => search(direction, '')
    };
  }

  function updateSelection(direction: TransferDirection, next: TransferKey[], individual = false) {
    const left = direction === 'left' ? next : sourceSelected;
    const right = direction === 'right' ? next : targetSelected;
    props.onSelectChange?.([...left], [...right]);

    if (!individual || props.selectedKeys === undefined) localSelected = [...left, ...right];
  }

  function select(
    direction: TransferDirection,
    key: TransferKey,
    check: boolean,
    event?: MouseEvent,
    filtered?: RecordType[]
  ) {
    const holder = direction === 'left' ? sourceSelected : targetSelected;
    const records = filtered ?? (direction === 'left' ? data.left : data.right);
    const keys = records.filter(item => !transferDisabled(item)).map(transferKey);
    const index = keys.indexOf(key);
    const same = keys.length === previousKeys[direction].length
      && keys.every((key, index) => key === previousKeys[direction][index]);
    previousKeys[direction] = keys;
    let next: TransferKey[];

    if (event?.shiftKey && holder.length > 0 && same) {
      const range = transferSelectRange(holder, keys, anchors[direction], index);
      next = range.selected;
      anchors[direction] = range.anchor;
    } else {
      const single = new Set(holder);
      single.delete(key);
      anchors[direction] = null;

      if (check) {
        single.add(key);
        anchors[direction] = index;
      }

      next = [...single];
    }

    updateSelection(direction, next, true);
  }

  function selectAll(
    direction: TransferDirection,
    keys: readonly TransferKey[],
    check: boolean | 'replace'
  ) {
    updateSelection(direction, transferSelectAll(
      direction === 'left' ? sourceSelected : targetSelected, keys, check
    ));
    anchors[direction] = null;
  }

  function move(direction: TransferDirection) {
    if (disabled) return;

    const left = direction === 'left';
    const result = transferMove(props.targetKeys ?? [], left ? targetSelected : sourceSelected,
      data.all, direction);
    const from: TransferDirection = left ? 'right' : 'left';
    updateSelection(from, []);
    props.onChange?.(result.targetKeys, direction, result.moveKeys);
    anchors[direction] = null;
  }

  function remove(keys: readonly TransferKey[]) {
    const removed = new Set(keys);
    localSelected = [...sourceSelected];

    if (targetSelected.length) props.onSelectChange?.([...sourceSelected], []);

    props.onChange?.((props.targetKeys ?? []).filter(key => !removed.has(key)), 'left', [...keys]);
  }

  function search(direction: TransferDirection, value: string) {
    anchors[direction] = null;
    props.onSearch?.(direction, value);
  }
</script>

<div {...attributes} bind:this={nativeElement}
  class={[prefix, 'ant-transfer-css-var', componentTheme.className, disabled && `${prefix}-disabled`,
    config.direction === 'rtl' && `${prefix}-rtl`, props.children && `${prefix}-customize-list`,
    status && `${prefix}-status-${status}`, config.transfer?.class, props.class,
    props.rootClassName, classes.root]} style={rootStyle}>
  <TransferSection section={source} children={props.children} footer={props.footer}
    style={source.styles.section}
    onSearch={value => search('left', value)} />
  <div class={[`${prefix}-actions`, classes.actions]} style={actionsStyle}>
    <TransferAction action={actions[0]} direction="right" disabled={disabled || !rightActive}
      onMove={() => move('right')} />
    {#if !props.oneWay}
      <TransferAction action={actions[1]} direction="left" disabled={disabled || !leftActive}
        onMove={() => move('left')} />
    {/if}
    {#each actions.slice(props.oneWay ? 1 : 2) as action}
      <TransferAction {action} direction="right" disabled={disabled} onMove={() => {}} extra />
    {/each}
  </div>
  <TransferSection section={target} children={props.children} footer={props.footer}
    style={target.styles.section}
    onSearch={value => search('right', value)} />
</div>

{#snippet defaultEmpty()}
  {#if config.renderEmpty}<DefaultRenderEmpty componentName="Transfer" />
  {:else}<Empty image="simple" />{/if}
{/snippet}
