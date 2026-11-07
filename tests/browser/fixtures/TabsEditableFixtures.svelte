<script lang="ts">
  import {
    ConfigProvider,
    Tabs,
    type ComponentSize,
    type TabsItem,
    type TabsPlacement,
    type TabsProps,
    type TabsType
  } from 'antd-svelte';
  import reference from './ant-design-tabs-editable-metrics.json';

  let sample = $state('default');
  let placement = $state<TabsPlacement>('top');
  let size = $state<ComponentSize>('medium');
  let type = $state<TabsType>('editable-card');
  let rtl = $state(false);
  let dark = $state(false);
  let compact = $state(false);
  let accept = $state(false);
  let selectOnEdit = $state(false);
  let ownerFocus = $state(false);
  let unmountDuringEdit = $state(false);
  let hideAdd = $state(false);
  let mounted = $state(true);
  let reverse = $state(false);
  let disabled = $state(false);
  let betaDisabled = $state(false);
  let betaClosable = $state(true);
  let localized = $state(false);
  let customIcons = $state(false);
  let current = $state<string | undefined>('');
  let closed = $state<string[]>([]);
  let added = $state<TabsItem[]>([]);
  let edits = $state<{ action: 'add' | 'remove'; key?: string; event?: string; }[]>([]);
  let changes = $state<string[]>([]);
  let clicks = $state<string[]>([]);
  let submissions = $state(0);
  let nextKey = 1;
  let selected = $derived(reference.cases.find(item => item.name === sample)!);
  let sampleProps = $derived(selected.props as Partial<TabsProps> | undefined);
  let items = $derived.by(() => {
    const source: TabsItem[] = [
      { key: '', label: 'Alpha', children: alpha },
      { key: 'locked', label: 'Locked', disabled: true, closable: true },
      { key: 'fixed', label: 'Fixed', closable: false },
      { key: 'beta', label: 'Beta', children: beta, disabled: betaDisabled, closable: betaClosable },
      { key: 'gamma', label: 'Gamma', children: gamma },
      ...added
    ];
    const visible = source.filter(item => !closed.includes(item.key));
    return reverse ? visible.toReversed() : visible;
  });

  function edit(target: MouseEvent | KeyboardEvent | string, action: 'add' | 'remove') {
    edits = [...edits, typeof target === 'string' ? { action, key: target }
      : { action, event: target.type }];
    if (accept) {
      if (action === 'add') {
        const key = `new-${nextKey++}`;
        added = [...added, { key, label: key, children: addedContent }];
        if (selectOnEdit) current = key;
      } else if (typeof target === 'string') {
        closed = [...closed, target];
        if (selectOnEdit && current === target) {
          current = items.find(item => item.key !== target && !item.disabled)?.key;
        }
      }
    }
    if (unmountDuringEdit) mounted = false;
    if (ownerFocus) document.getElementById('tabs-editable-outside')?.focus();
  }
</script>

<style>
  label { display: block; }
  .sample { width: 800px; }
  .stage { width: 420px; max-width: 100%; }
</style>

{#snippet alpha()}<input name="alpha" aria-label="Editable Alpha draft" value="Alpha draft" />{/snippet}
{#snippet beta()}<input name="beta" aria-label="Editable Beta draft" value="Beta draft" />{/snippet}
{#snippet gamma()}<input name="gamma" aria-label="Editable Gamma draft" value="Gamma draft" />{/snippet}
{#snippet addedContent()}<input name="new" aria-label="Editable new draft" value="New draft" />{/snippet}
{#snippet addIcon()}<strong>Add icon</strong>{/snippet}
{#snippet removeIcon()}<strong>Remove icon</strong>{/snippet}
<section id="tabs-editable-fixture">
  <h2>Editable Tabs</h2>
  <label>Tabs editable reference <select bind:value={sample} aria-label="Tabs editable reference">
    {#each reference.cases as item}<option value={item.name}>{item.name}</option>{/each}
  </select></label>
  <label>Editable Tabs placement <select bind:value={placement} aria-label="Editable Tabs placement">
    {#each ['top', 'bottom', 'start', 'end'] as value}<option>{value}</option>{/each}
  </select></label>
  <label>Editable Tabs size <select bind:value={size} aria-label="Editable Tabs size">
    {#each ['medium', 'small', 'large'] as value}<option>{value}</option>{/each}
  </select></label>
  <label>Editable Tabs type <select bind:value={type} aria-label="Editable Tabs type">
    {#each ['line', 'card', 'editable-card'] as value}<option>{value}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={rtl} /> RTL editable Tabs</label>
  <label><input type="checkbox" bind:checked={dark} /> Dark editable Tabs</label>
  <label><input type="checkbox" bind:checked={compact} /> Compact editable Tabs</label>
  <label><input type="checkbox" bind:checked={accept} /> Accept Tabs edits</label>
  <label><input type="checkbox" bind:checked={selectOnEdit} /> Select owner edit result</label>
  <label><input type="checkbox" bind:checked={ownerFocus} /> Owner focus after edit</label>
  <label><input type="checkbox" bind:checked={unmountDuringEdit} /> Unmount during Tabs edit</label>
  <label><input type="checkbox" bind:checked={hideAdd} /> Hide Tabs add</label>
  <label><input type="checkbox" bind:checked={mounted} /> Mount editable Tabs</label>
  <label><input type="checkbox" bind:checked={reverse} /> Reverse editable Tabs</label>
  <label><input type="checkbox" bind:checked={disabled} /> Disable Tabs provider</label>
  <label><input type="checkbox" bind:checked={betaDisabled} /> Disable editable Beta</label>
  <label><input type="checkbox" bind:checked={betaClosable} /> Close editable Beta</label>
  <label><input type="checkbox" bind:checked={localized} /> Localized Tabs actions</label>
  <label><input type="checkbox" bind:checked={customIcons} /> Custom Tabs action icons</label>
  <input id="tabs-editable-outside" aria-label="Editable Tabs outside" />
  <ConfigProvider direction={rtl ? 'rtl' : 'ltr'}>
    <div class="sample">
      <Tabs id="tabs-editable-reference" type="editable-card" activeKey="one"
        tabPlacement={placement} {size} aria-label="Reference editable Tabs"
        items={selected.empty ? [] : [{ key: 'one', label: 'Tab One', ...selected.item }]}
        {...sampleProps} />
    </div>
  </ConfigProvider>
  <ConfigProvider theme={{ mode: dark ? 'dark' : 'light', compact }}
    componentDisabled={disabled} direction={rtl ? 'rtl' : 'ltr'}>
    <form onsubmit={event => { event.preventDefault(); submissions += 1; }}>
      <div class="stage">
        {#if mounted}
          <Tabs id="tabs-editable-main" aria-label="Owned editable Tabs" {items} {type}
            {size} tabPlacement={placement} bind:activeKey={current} {hideAdd} onEdit={edit}
            locale={localized ? { addAriaLabel: 'Add section', removeAriaLabel: 'Close section' }
              : undefined}
            addIcon={customIcons ? addIcon : undefined} removeIcon={customIcons ? removeIcon : undefined}
            onChange={key => { changes = [...changes, key]; }}
            onTabClick={key => { clicks = [...clicks, key]; }} />
        {/if}
      </div>
    </form>
  </ConfigProvider>
  <output aria-label="Tabs edit events">{JSON.stringify(edits)}</output>
  <output aria-label="Tabs editable changes">{JSON.stringify(changes)}</output>
  <output aria-label="Tabs editable clicks">{JSON.stringify(clicks)}</output>
  <output aria-label="Tabs editable value">{String(current)}</output>
  <output aria-label="Tabs editable submissions">{submissions}</output>
</section>
