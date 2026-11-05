<script lang="ts">
  import { Collapse, ConfigProvider, type CollapseActiveKey } from 'antd-svelte';

  let activeKey = $state<CollapseActiveKey | undefined>([1]);
  let mounted = $state(true);
  let removed = $state(false);
  let reversed = $state(false);
  let disabled = $state(false);
  let extra = $state(true);
  let destroy = $state(false);
  let forced = $state(false);
  let nested = $state(false);
  let accordion = $state(false);
  let configured = $state(false);
  let prefix = $state('ant-collapse');
  let itemsMode = $state(false);
  let firstKey = $state<string | number>(1);
  let actions = $state(0);
  let changes = $state<string[]>([]);
  let refs = $state<Record<string, HTMLDivElement | undefined>>({});
  let objectRefs = $state<Record<string, HTMLDivElement | undefined>>({});
  let order = $derived(reversed ? [2, 1] : [1, 2]);

  function hotkey(event: KeyboardEvent) {
    if (event.key === 'F3') disabled = !disabled;
    if (event.key === 'F4') extra = !extra;
    if (event.key === 'F5') removed = !removed;
    if (event.key === 'F6') reversed = !reversed;
    if (event.key === 'F7') activeKey = [];
  }
</script>

<svelte:window onkeydown={hotkey} />
{#snippet firstHeader()}<strong>First legacy section</strong>{/snippet}
{#snippet firstBody()}<input aria-label="First legacy draft" defaultValue="First draft" />
  {#if nested}<Collapse aria-label="Nested legacy sections">
    <Collapse.Panel key={1} header="Nested legacy section">
      <input aria-label="Nested legacy draft" defaultValue="Nested draft" />
    </Collapse.Panel>
  </Collapse>{/if}
{/snippet}
{#snippet secondBody()}<input aria-label="Second legacy draft" defaultValue="Second draft" />{/snippet}
{#snippet firstExtra()}<button type="button" onclick={() => actions++}>Legacy extra action</button>{/snippet}

<section id="collapse-panel-fixture">
  <h2>Legacy Collapse panels</h2>
  <button type="button">Before legacy Collapse</button>
  <label><input type="checkbox" bind:checked={accordion} /> Legacy accordion</label>
  <label><input type="checkbox" bind:checked={destroy} /> Destroy legacy content</label>
  <label><input type="checkbox" bind:checked={forced} /> Force legacy content</label>
  <label><input type="checkbox" bind:checked={itemsMode} /> Override legacy with items</label>
  <label><input type="checkbox" bind:checked={nested} /> Show nested legacy panels</label>
  <button type="button" onclick={() => mounted = !mounted}>Toggle legacy mount</button>
  <button type="button" onclick={() => configured = !configured}>Configure legacy Collapse</button>
  <button type="button" onclick={() => prefix = 'live-legacy'}>Change legacy prefix</button>
  <button type="button" onclick={() => firstKey = 'renamed'}>Change legacy key</button>
  <button type="button" onclick={() => activeKey = ['renamed']}>Open renamed legacy panel</button>
  <ConfigProvider theme={{ cssVar: { key: 'legacy-scope' }, components: {
    Collapse: configured ? { headerPadding: '19px 23px', contentBg: '#ddeeff' } : {}
  } }} collapse={configured ? { classNames: { title: 'configured-legacy-title' } } : undefined}>
    {#if mounted}<Collapse aria-label="Legacy sections" bind:activeKey {accordion}
      prefixCls={prefix} destroyOnHidden={destroy}
      items={itemsMode ? [{ key: 'item', label: 'Items override' }] : undefined}
      onChange={keys => changes = [...changes, keys.join('|')]}>
      {#each order as value (value)}
        {#if value !== 1 || !removed}
          <Collapse.Panel key={value === 1 ? firstKey : value}
            header={value === 1 ? firstHeader : 'Second legacy section'}
            children={value === 1 ? firstBody : secondBody}
            extra={value === 1 && extra ? firstExtra : undefined}
            collapsible={value === 1 && disabled ? 'disabled' : undefined}
            forceRender={forced} headerClass="legacy-header-class"
            bind:nativeElement={() => refs[value], node => refs[value] = node}
            bind:ref={() => objectRefs[value], node => objectRefs[value] = node} />
        {/if}
      {/each}
    </Collapse>{/if}
  </ConfigProvider>
  <button type="button">After legacy Collapse</button>
  <output aria-label="Legacy owner">{JSON.stringify(activeKey)}</output>
  <output aria-label="Legacy changes">{JSON.stringify(changes)}</output>
  <output aria-label="Legacy extra actions">{actions}</output>
  <output aria-label="Legacy first native ref">{Boolean(refs[1]?.isConnected)}</output>
  <output aria-label="Legacy first object ref">{Boolean(objectRefs[1]?.isConnected)}</output>
  <Collapse.Panel key="standalone" header="Standalone legacy section" forceRender>
    <input aria-label="Standalone legacy draft" defaultValue="Standalone draft" />
  </Collapse.Panel>
</section>
