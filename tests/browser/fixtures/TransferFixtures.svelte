<script lang="ts">
  import {
    ConfigProvider, Transfer, Form, FormItem, createForm,
    type TransferKey, type TransferItem, type TransferStatus, type TransferActionInfo,
    type TransferListBodyProps, type TransferListProps, type TransferConfig
  } from 'antd-svelte';

  interface Record extends TransferItem {
    key: TransferKey;
    id: TransferKey;
    title: string;
    group: string;
  }
  const initial = (): Record[] => [
    { key: 'a', title: 'Alpha', group: 'first' },
    { key: 'b', title: 'Beta', group: 'first' },
    { key: 'c', title: 'Charlie', group: 'second' },
    { key: 'd', title: 'Disabled', group: 'first', disabled: true },
    { key: 'e', title: 'Echo', group: 'second' },
    { key: 'locked', title: 'Locked', group: 'second', disabled: true },
    { key: 0, title: 'Zero number', group: 'keys' },
    { key: '0', title: 'Zero string', group: 'keys' },
    { key: 9n, title: 'Bigint nine', group: 'keys' },
    ...Array.from({ length: 24 }, (_, index) => ({ key: `item-${index + 1}`,
      title: `Item ${String(index + 1).padStart(2, '0')}`, group: 'many' }))
  ].map(record => ({ ...record, id: record.key }));
  let records = $state(initial());
  let targets = $state<TransferKey[]>(['c', 'locked', 'missing']);
  let selected = $state<TransferKey[]>([]);
  let sourceSelection = $state<TransferKey[]>([]);
  let targetSelection = $state<TransferKey[]>([]);
  let log = $state<string[]>([]);
  let acceptMove = $state(true);
  let controlled = $state(false);
  let acceptSelection = $state(true);
  let showSearch = $state(true);
  let defaultSearch = $state('');
  let placeholder = $state('');
  let filter = $state('default');
  let pagination = $state('off');
  let fixedSize = $state(false);
  let pageSize = $state('3');
  let sizeChanger = $state(false);
  let lessItems = $state(false);
  let oneWay = $state(false);
  let showSelectAll = $state(true);
  let customContent = $state(false);
  let customBody = $state(false);
  let customFooter = $state(false);
  let customActions = $state(false);
  let actionDisabled = $state(false);
  let prevent = $state(false);
  let rowKey = $state(false);
  let empty = $state(false);
  let emptyText = $state(false);
  let blank = $state(false);
  let iconMode = $state('default');
  let labelMode = $state('default');
  let semantics = $state(false);
  let dark = $state(false);
  let compact = $state(false);
  let localDisabled = $state('inherit');
  let status = $state<TransferStatus>('');
  let formDisabled = $state(false);
  let instance = $state(0);
  let native = $state<HTMLDivElement>();
  const form = createForm({
    initialValues: { field: '' },
    rules: { field: [{ required: true, message: 'Transfer required' }] }
  });
  let context = $derived<TransferConfig | undefined>(semantics ? {
    class: 'context-transfer', style: 'padding:1px;color:red',
    classNames: { root: 'context-root', item: 'context-item', source: { item: 'context-source' } },
    styles: { root: 'padding:2px', section: 'width:210px',
      source: { section: 'width:211px' }, item: 'color:red' }
  } : undefined);
  let data = $derived(empty ? [] : rowKey
    ? records.map(record => ({ ...record, key: `ignored-${String(record.id)}` })) : records);

  function keys(keys: readonly TransferKey[]) {
    return keys.map(key => `${typeof key}:${String(key)}`).join(',');
  }

  function handleChange(next: TransferKey[], direction: string, moved: TransferKey[]) {
    log.push(`change:${direction}:${keys(moved)}=>${keys(next)}`);
    if (acceptMove) targets = next;
  }

  function handleSelect(left: TransferKey[], right: TransferKey[]) {
    sourceSelection = left;
    targetSelection = right;
    log.push(`select:${keys(left)}/${keys(right)}`);
    if (controlled && acceptSelection) selected = [...left, ...right];
  }
</script>

<style>
  .controls { display: flex; flex-wrap: wrap; gap: 8px 16px; margin-block: 16px; }
  .controls label { display: inline-flex; align-items: center; gap: 4px; }
  output { display: block; overflow-wrap: anywhere; }
  .custom-body { margin: 0; padding: 8px; }
  .footer { display: block; padding: 8px; }
</style>

<section id="transfer-fixture">
  <h2>Transfer</h2>
  <div class="controls">
    <label><input type="checkbox" bind:checked={acceptMove} /> Accept transfer</label>
    <label><input type="checkbox" bind:checked={controlled} /> Controlled selection</label>
    <label><input type="checkbox" bind:checked={acceptSelection} /> Accept selection</label>
    <label><input type="checkbox" bind:checked={showSearch} /> Search lists</label>
    <label>Initial search<input bind:value={defaultSearch} /></label>
    <label>Search placeholder<input bind:value={placeholder} /></label>
    <label>Transfer filter<select aria-label="Transfer filter" bind:value={filter}>
      <option value="default">Default</option><option value="group">Group</option>
      <option value="physical">Physical left</option>
    </select></label>
    <label>Transfer pagination<select aria-label="Transfer pagination" bind:value={pagination}>
      <option value="off">Off</option><option value="simple">Simple</option>
      <option value="normal">Normal</option>
    </select></label>
    <label><input type="checkbox" bind:checked={fixedSize} /> Fixed page size</label>
    <label>Transfer page size<input bind:value={pageSize} /></label>
    <label><input type="checkbox" bind:checked={sizeChanger} /> Page size changer</label>
    <label><input type="checkbox" bind:checked={lessItems} /> Fewer page items</label>
    <label><input type="checkbox" bind:checked={oneWay} /> One way</label>
    <label><input type="checkbox" bind:checked={showSelectAll} /> Header selection</label>
    <label><input type="checkbox" bind:checked={customContent} /> Rich transfer content</label>
    <label><input type="checkbox" bind:checked={blank} /> Blank render</label>
    <label><input type="checkbox" bind:checked={customBody} /> Custom transfer body</label>
    <label><input type="checkbox" bind:checked={customFooter} /> Transfer footer</label>
    <label><input type="checkbox" bind:checked={customActions} /> Custom transfer actions</label>
    <label><input type="checkbox" bind:checked={actionDisabled} /> Disable custom action</label>
    <label><input type="checkbox" bind:checked={prevent} /> Prevent custom click</label>
    <label><input type="checkbox" bind:checked={rowKey} /> Custom row key</label>
    <label><input type="checkbox" bind:checked={empty} /> Empty transfer</label>
    <label><input type="checkbox" bind:checked={emptyText} /> Custom empty content</label>
    <label>Transfer icon<select aria-label="Transfer icon" bind:value={iconMode}>
      <option value="default">Default</option><option value="custom">Custom</option>
      <option value="none">None</option>
    </select></label>
    <label>Transfer label<select aria-label="Transfer label" bind:value={labelMode}>
      <option value="default">Default</option><option value="custom">Custom</option>
      <option value="zero">Zero</option><option value="false">False</option>
    </select></label>
    <label><input type="checkbox" bind:checked={semantics} /> Transfer semantics</label>
    <label><input type="checkbox" bind:checked={dark} /> Dark transfer</label>
    <label><input type="checkbox" bind:checked={compact} /> Compact transfer</label>
    <label><input type="checkbox" bind:checked={formDisabled} /> Disable transfer form</label>
    <label>Transfer disabled<select aria-label="Transfer disabled" bind:value={localDisabled}>
      <option value="inherit">Inherit</option><option value="false">False</option>
      <option value="true">True</option>
    </select></label>
    <label>Transfer status<select aria-label="Transfer status" bind:value={status}>
      <option value="">None</option><option value="error">Error</option>
      <option value="warning">Warning</option>
      <option value="success">Success</option><option value="validating">Validating</option>
    </select></label>
    <button type="button" onclick={() => instance++}>Remount transfer</button>
    <button type="button" onclick={() => log = []}>Clear transfer events</button>
    <button type="button" onclick={() => {
      controlled = true;
      selected = ['a', 'locked', 0];
    }}>Preselect transfer</button>
    <button type="button" onclick={() => targets = ['locked', 'c', 'a', 'missing']}>
      Reorder transfer targets
    </button>
    <button type="button" onclick={() => records = records.filter(record => record.key !== 'a')}>
      Drop Alpha
    </button>
    <button type="button" onclick={() => targets = []}>Clear transfer targets</button>
    <button type="button" onclick={() => targets = ['c', 'locked', 'missing']}>
      Restore transfer targets
    </button>
  </div>
  <ConfigProvider theme={{ mode: dark ? 'dark' : 'light', compact }} transfer={context}
    style="background:var(--ant-color-bg-container);color:var(--ant-color-text)">
    <form data-testid="transfer-form" onsubmit={event => event.preventDefault()}>
      {#key instance}
        <Transfer dataSource={data} targetKeys={targets} selectedKeys={controlled ? selected : undefined}
          render={blank ? undefined : customContent
            ? record => ({ label: richRow, value: record.title.toLowerCase() })
            : record => record.title}
          rowKey={rowKey ? record => record.id : undefined}
          showSearch={showSearch ? { defaultValue: defaultSearch, placeholder } : false}
          filterOption={filter === 'default' ? undefined : (value, record, direction) =>
            filter === 'physical' ? direction === 'left' : record.group.includes(value)}
          pagination={pagination === 'off' ? false : { simple: pagination === 'simple',
            pageSize: fixedSize ? Number(pageSize) : undefined,
            showSizeChanger: sizeChanger, showLessItems: lessItems }}
          {oneWay} {showSelectAll} titles={['Source', 'Target']}
          children={customBody ? body : undefined} footer={customFooter ? footer : undefined}
          locale={emptyText ? { notFoundContent: ['Empty physical left', 'Empty physical right'] }
            : undefined}
          selectionsIcon={iconMode === 'custom' ? '⋮' : iconMode === 'none' ? false : undefined}
          selectAllLabels={labelMode === 'custom' ? [info => `${info.selectedCount} of ${info.totalCount}`]
            : labelMode === 'zero' ? [0, () => 0] : labelMode === 'false' ? [false, ''] : undefined}
          disabled={localDisabled === 'inherit' ? undefined : localDisabled === 'true'}
          status={status || undefined}
          actions={customActions ? [{ children: action, disabled: actionDisabled,
            onClick: event => {
              log.push('custom-action');
              if (prevent) event.preventDefault();
            } }, 'Back', extraAction] : undefined}
          class="fixture-transfer" rootClassName={semantics ? 'root-extra' : undefined}
          style={semantics ? 'padding:4px;color:green' : undefined}
          classNames={semantics ? ({ props }) => ({ root: `local-disabled-${props.disabled}`,
            item: 'local-item', source: { item: 'local-source' }, target: { item: 'local-target' } })
            : undefined}
          styles={semantics ? { root: 'padding:3px', section: 'width:214px',
            source: { section: 'width:215px' }, item: 'color:blue' } : undefined}
          onChange={handleChange} onSelectChange={handleSelect}
          onSearch={(side, value) => log.push(`search:${side}:${value}`)}
          onScroll={side => log.push(`scroll:${side}`)}
          data-testid="transfer-root" aria-label="Transfer lists" id="ignored-transfer-id"
          title="ignored transfer title" bind:nativeElement={native}
        />
      {/key}
    </form>
    <Form {form} disabled={formDisabled} data-testid="transfer-library-form">
      <FormItem name="field" label="Form transfer" htmlFor="transfer-field">
        <Transfer dataSource={[{ key: 'form', title: 'Form row' }]} render={item => item.title}
          showSearch data-testid="transfer-field-root" />
      </FormItem>
      <button type="submit">Validate transfer</button>
    </Form>
  </ConfigProvider>
  <output aria-label="Transfer targets">{keys(targets)}</output>
  <output aria-label="Transfer source selection">{keys(sourceSelection)}</output>
  <output aria-label="Transfer target selection">{keys(targetSelection)}</output>
  <output aria-label="Transfer events">{log.join('|')}</output>
  <output aria-label="Transfer ref">{native?.tagName}</output>
</section>

{#snippet richRow(record: Record)}<strong>{record.title}</strong><small> {record.group}</small>{/snippet}

{#snippet body(props: TransferListBodyProps<Record>)}
  <div class="custom-body" data-testid={`custom-${props.direction}`}>
    <p>{props.direction}:{props.filteredItems.length}/{props.selectedKeys.length}</p>
    <button type="button" disabled={props.disabled}
      onclick={() => props.onItemSelectAll(props.filteredItems.filter(item => !item.disabled)
        .map(item => item.key), true)}>Custom select all {props.direction}</button>
    {#each props.filteredItems as record (record.key)}
      <button type="button" disabled={props.disabled || record.disabled}
        aria-pressed={props.selectedKeys.includes(record.key)}
        onclick={() => props.onItemSelect(record.key, !props.selectedKeys.includes(record.key))}>
        Custom {record.title}
      </button>
    {/each}
  </div>
{/snippet}

{#snippet footer(props: TransferListProps<Record>, info: { direction: string; })}
  <span class="footer" data-testid={`footer-${info.direction}`}>
    {info.direction}:{props.dataSource.length}/{props.checkedKeys.length}
  </span>
{/snippet}

{#snippet action(info: TransferActionInfo)}
  <button type="button" disabled={info.disabled} onclick={info.onClick}>
    {@render info.icon()}Custom move
  </button>
{/snippet}

{#snippet extraAction(_info: TransferActionInfo)}
  <button type="button" onclick={() => log.push('extra-action')}>Extra action</button>
{/snippet}
