<script lang="ts">
  import { ConfigProvider, TreeSelect, type TreeSelectInputContext, type TreeSelectTagInfo } from 'antd-svelte';
  import TreeSelectInputResponsiveEditor from './TreeSelectInputResponsiveEditor.svelte';
  import type { TreeSelectInputResponsiveAction, TreeSelectInputResponsiveSample } from './tree-select-input-responsive-cases';
  let { sample }: { sample: TreeSelectInputResponsiveSample } = $props();
  let width = $state(234);
  let prefixWidth = $state(64);
  let root = $state<HTMLDivElement>();
  let input = $state<HTMLInputElement>();
  let textarea = $state<HTMLInputElement | HTMLTextAreaElement>();
  let editor = $derived(sample.tag === 'textarea' ? textarea : input);
  function update(action: TreeSelectInputResponsiveAction) {
    if (action.type === 'prefix-resize') prefixWidth = action.width!;
    else if (action.type === 'resize' && root) {
      const content = root.querySelector<HTMLElement>('.ant-select-content')!;
      width = action.width! + root.getBoundingClientRect().width - content.clientWidth;
    }
  }
</script>

{#snippet inputRender(context: TreeSelectInputContext<HTMLInputElement>)}
  <TreeSelectInputResponsiveEditor {context} kind={sample.id} {prefixWidth} />
{/snippet}
{#snippet textareaRender(context: TreeSelectInputContext<HTMLTextAreaElement>)}
  <textarea {...context.attributes} {@attach context.register} data-input-responsive-editor></textarea>
{/snippet}
{#snippet tag(info: TreeSelectTagInfo)}
  <span data-input-responsive-tag={info.isMaxTag ? undefined : String(info.value)} data-input-responsive-rest={info.isMaxTag || undefined}
    style="display:inline-flex;width:64px;height:22px;box-sizing:border-box">{#if info.isMaxTag}Rest{:else}{@render info.label()}{/if}</span>
{/snippet}
<div data-input-responsive-case={sample.id} data-input-responsive-bound={Boolean(root && editor)}>
  <ConfigProvider theme={{ cssVar: { key: 'tree-select-input-responsive-source' }, token: { motion: false } }}>
    {#if sample.tag === 'textarea'}
      <TreeSelect id="responsive-source" multiple value={['a', 'b', 'c', 'd']} style={`width:${width}px`}
        components={{ input: { render: textareaRender, props: {} } }} maxTagCount="responsive"
        showSearch={{ filterTreeNode: false }} tagRender={tag}
        treeData={[{ value: 'a', title: 'One' }, { value: 'b', title: 'Two' }, { value: 'c', title: 'Three' }, { value: 'd', title: 'Four' }]}
        bind:nativeElement={root} bind:inputElement={textarea} />
    {:else}
      <TreeSelect id="responsive-source" multiple value={['a', 'b', 'c', 'd']} style={`width:${width}px`}
        components={{ input: { render: inputRender, props: {} } }} maxTagCount="responsive"
        showSearch={{ filterTreeNode: false }} tagRender={tag}
        treeData={[{ value: 'a', title: 'One' }, { value: 'b', title: 'Two' }, { value: 'c', title: 'Three' }, { value: 'd', title: 'Four' }]}
        bind:nativeElement={root} bind:inputElement={input} />
    {/if}
  </ConfigProvider>
  <div data-input-responsive-update {@attach node => {
    const listener = (event: Event) => update((event as CustomEvent<TreeSelectInputResponsiveAction>).detail);
    node.addEventListener('fixtureupdate', listener);
    return () => node.removeEventListener('fixtureupdate', listener);
  }}></div>
</div>
