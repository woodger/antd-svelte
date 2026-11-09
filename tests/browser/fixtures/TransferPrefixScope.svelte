<script lang="ts">
  import { Transfer, type TransferKey, type TransferProps } from 'antd-svelte';

  export interface TransferPrefixSample {
    id: string;
    prefix?: string;
    childPrefix?: string;
    variablePrefix?: string;
    local?: string;
    rtl?: boolean;
    aliases?: boolean;
    mode?: string;
    disabled?: boolean;
    status?: TransferProps['status'];
    userStyle?: boolean;
  }
  let { sample, local = true }: { sample: TransferPrefixSample; local?: boolean } = $props();
  const records = [
    { key: 'a', title: 'Alpha' }, { key: 'b', title: 'Beta' },
    { key: 'locked', title: 'Locked', disabled: true },
    { key: 'c', title: 'Gamma' }, { key: 'd', title: 'Delta' }
  ];
  let mode = $derived(sample.mode ?? 'basic');
  let targetKeys = $state<TransferKey[]>(['b']);
  let selectedKeys = $state<TransferKey[]>(['a', 'b']);
  let root = $state<HTMLDivElement>();
  let events = $state<string[]>([]);
</script>

{#snippet footer(_props: unknown, info: { direction: 'left' | 'right' })}<span>{info.direction} footer</span>{/snippet}
{#snippet custom(props: { filteredItems: typeof records })}<div data-transfer-custom>{#each props.filteredItems as record (record.key)}<span>{record.title}</span>{/each}</div>{/snippet}
<section data-transfer-theme="tree" style="width:760px">
  <div data-transfer-panel={mode}>
    <Transfer prefixCls={local ? sample.local : undefined} class="fixture-transfer-prefix"
      bind:nativeElement={root} dataSource={mode === 'empty' ? [] : records}
      targetKeys={mode === 'empty' ? [] : targetKeys}
      selectedKeys={mode === 'empty' ? [] : selectedKeys} titles={['Source', 'Target']}
      render={record => record.title} showSearch={mode !== 'custom'} oneWay={mode === 'one-way'}
      pagination={mode === 'pagination' ? { pageSize: 2 } : false}
      disabled={sample.disabled} status={sample.status} {footer}
      children={mode === 'custom' ? custom : undefined}
      style={sample.userStyle ? 'font-size:19px;color:rgb(18, 52, 86)' : undefined}
      onSearch={(direction, query) => events.push(`search:${direction}:${query}`)}
      onChange={(next, direction, moved) => {
        targetKeys = next;
        events.push(`move:${direction}:${moved.join(',')}`);
      }}
      onSelectChange={(source, target) => {
        selectedKeys = [...source, ...target];
        events.push(`select:${source.join(',')}:${target.join(',')}`);
      }} />
  </div>
  <output aria-label="Transfer prefix events">{events.join('|')}</output>
  <output aria-label="Transfer prefix ref">{root?.classList.contains('fixture-transfer-prefix') ? 'connected' : 'empty'}</output>
</section>
