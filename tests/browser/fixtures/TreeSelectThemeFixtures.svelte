<script lang="ts">
  import { ConfigProvider, TreeSelect, type ThemeConfig, type TreeSelectValue } from 'antd-svelte';
  import { treeSelectThemePresets } from './tree-select-theme-presets';

  let preset = $state('default');
  let enabled = $state(true);
  let mounted = $state(true);
  let hashed = $state(true);
  let compact = $state(false);
  let parentAliases = $state(false);
  let color = $state('');
  let width = $state(240);
  let listHeight = $state(256);
  let value = $state<TreeSelectValue>('a');
  let search = $state('');
  let changes = $state(0);
  let searches = $state(0);
  let selections = $state(0);
  let focusEvents = $state(0);
  let openings = $state<boolean[]>([]);
  let nativeRoot = $state<HTMLDivElement>();
  let editor = $state<HTMLInputElement>();
  const sizes = ['middle', 'small', 'large'] as const;
  const treeData = [{ value: 'p', title: 'Parent', children: [
    { value: 'a', title: 'Alpha' }, { value: 'b', title: 'Beta' },
    { value: 'd', title: 'Disabled', disabled: true }
  ] }, { value: 'c', title: 'Gamma' }];
  let config = $derived<ThemeConfig>({
    ...treeSelectThemePresets[preset],
    cssVar: { ...treeSelectThemePresets[preset].cssVar, key: 'tree-select-source-scope' },
    hashed,
    components: color ? {
      ...treeSelectThemePresets[preset].components,
      TreeSelect: { ...treeSelectThemePresets[preset].components?.TreeSelect, nodeSelectedBg: color }
    } : treeSelectThemePresets[preset].components
  });
</script>

<style>
  .samples { display:grid;grid-template-columns:repeat(3,240px);align-items:start;gap:20px;margin-block:24px; }
</style>

<section id="tree-select-theme-fixture">
  <h2>Source TreeSelect tokens</h2>
  <label>TreeSelect token preset <select bind:value={preset} aria-label="TreeSelect token preset">
    {#each Object.keys(treeSelectThemePresets) as name}<option value={name}>{name}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={enabled} /> Apply source TreeSelect tokens</label>
  <label><input type="checkbox" bind:checked={mounted} /> Mount themed TreeSelect</label>
  <label><input type="checkbox" bind:checked={hashed} /> Hash themed TreeSelect</label>
  <label><input type="checkbox" bind:checked={compact} /> Native compact TreeSelect</label>
  <label><input type="checkbox" bind:checked={parentAliases} /> Parent TreeSelect aliases</label>
  <label>TreeSelect color override <input bind:value={color} /></label>
  <label>TreeSelect popup width <input type="number" bind:value={width} /></label>
  <label>TreeSelect list height <input type="number" bind:value={listHeight} /></label>
  {#if mounted}
    <ConfigProvider theme={enabled ? config : { compact }}>
      <form id="themed-tree-select-form">
        <div class="samples" style={parentAliases ? '--ant-font-size:30px;--ant-color-text:red' : undefined}>
          {#each sizes as size}
            <TreeSelect {size} {treeData} defaultValue="a" class={`tree-token-single-${size}`}
              aria-label={`Themed single tree ${size}`} style="width:240px" />
          {/each}
          {#each sizes as size}
            <TreeSelect {size} {treeData} defaultValue={['a']} multiple
              class={`tree-token-multiple-${size}`} name={size === 'middle' ? 'teams' : undefined}
              aria-label={`Themed multiple tree ${size}`} style="width:240px" />
          {/each}
          <TreeSelect {treeData} defaultValue={['a']} multiple disabled class="tree-token-disabled"
            aria-label="Themed disabled tree" style="width:240px" />
          <TreeSelect {treeData} {value} class="tree-token-popup" name="project"
            bind:nativeElement={nativeRoot} bind:inputElement={editor}
            aria-label="Themed tree popup" style="width:240px" allowClear treeDefaultExpandAll
            {listHeight} popupMatchSelectWidth={width}
            showSearch={{ searchValue: search, filterTreeNode: false, onSearch: next => {
              search = next;
              searches++;
            } }}
            onChange={next => { value = next; changes++; }}
            onSelect={() => selections++}
            onfocus={() => focusEvents++}
            onOpenChange={next => { openings = [...openings, next]; }} />
          <TreeSelect {treeData} defaultValue={['a']} treeCheckable treeDefaultExpandAll
            class="tree-token-checks" aria-label="Themed tree checks" style="width:240px" />
          <TreeSelect treeData={[]} notFoundContent="No results" class="tree-token-empty"
            aria-label="Themed tree empty" style="width:240px" />
        </div>
      </form>
    </ConfigProvider>
  {/if}
  <button type="button" onclick={() => editor?.focus()}>Focus bound TreeSelect</button>
  <output aria-label="TreeSelect native refs">{JSON.stringify({
    root: Boolean(nativeRoot), input: Boolean(editor),
    contains: Boolean(nativeRoot && editor && nativeRoot.contains(editor))
  })}</output>
  <output aria-label="TreeSelect theme changes">{changes}</output>
  <output aria-label="TreeSelect theme searches">{searches}</output>
  <output aria-label="TreeSelect theme selections">{selections}</output>
  <output aria-label="TreeSelect theme focus events">{focusEvents}</output>
  <output aria-label="TreeSelect theme openings">{JSON.stringify(openings)}</output>
</section>
