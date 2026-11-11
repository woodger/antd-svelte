<script lang="ts">
  import { untrack } from 'svelte';
  import { ConfigProvider, TreeSelect, type TreeSelectProps, type TreeSelectRef } from 'antd-svelte';
  import { treeScrollbarData, type TreeScrollbarAction, type TreeScrollbarSample } from './tree-scrollbar-cases';
  let { sample }: { sample: TreeScrollbarSample } = $props();
  let mode = $state<TreeSelectProps['showScrollBar']>(untrack(() => sample.mode));
  let height = $state(96);
  let instance = $state<TreeSelectRef>();
  let element = $state<HTMLDivElement>();
  let mounted = $state(true);
  let selected = $state<TreeScrollbarAction>('resize');
  const commands: readonly TreeScrollbarAction[] = ['scroll-to', 'resize', 'mode-true', 'mode-false', 'mode-optional', 'mode-default'];
  function apply() {
    if (selected === 'scroll-to') instance?.scrollTo({ top: 240 });
    if (selected === 'resize') height = 144;
    if (selected === 'mode-true') mode = true;
    if (selected === 'mode-false') mode = false;
    if (selected === 'mode-optional') mode = 'optional';
    if (selected === 'mode-default') mode = undefined;
  }
</script>
<div data-tree-scrollbar-host data-tree-scrollbar-kind="tree-select" data-tree-scrollbar-ref={Boolean(instance && element)}
  data-tree-scrollbar-mode={String(mode)} style="margin:64px;width:320px">
  <ConfigProvider theme={{ token: { motion: false } }}>
    {#if mounted}<TreeSelect bind:this={instance} bind:nativeElement={element} aria-label="Scrollbar field"
      open treeData={treeScrollbarData(sample)} style="width:320px" listHeight={height}
      virtual={sample.virtual} showScrollBar={mode} />{/if}
  </ConfigProvider>
</div>
<label>Tree scrollbar action<select bind:value={selected}>
  {#each commands as command}<option value={command}>{command}</option>{/each}
</select></label>
<button type="button" onclick={apply}>Apply tree scrollbar action</button>
<button type="button" onclick={() => { mounted = false; }}>Unmount tree scrollbar</button>
