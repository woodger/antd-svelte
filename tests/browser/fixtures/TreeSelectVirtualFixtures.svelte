<script lang="ts">
  import { untrack, type Snippet } from 'svelte';
  import { ConfigProvider, TreeSelect, enUS, type TreeSelectRef } from 'antd-svelte';
  import { treeSelectVirtualData, treeSelectVirtualProps, treeSelectVirtualSamples } from './tree-select-virtual-cases';

  let { initialSample = 'default' }: { initialSample?: string } = $props();
  let id = $state(untrack(() => initialSample));
  let sample = $derived(treeSelectVirtualSamples.find(entry => entry.id === id)!);
  let data = $derived(treeSelectVirtualData(sample));
  let options = $state.raw<ReturnType<typeof treeSelectVirtualProps>>({});
  let actionIndex = $state(0);
  let instance = $state<TreeSelectRef>();
  let element = $state<HTMLDivElement>();
  let scrolls = $state(0);
  let validScrollTarget = $state(true);
  let expansions = $state(0);

  function setSample(next: string) {
    options = {};
    actionIndex = 0;
    scrolls = 0;
    validScrollTarget = true;
    expansions = 0;
    id = next;
  }
  function apply() {
    const action = sample.actions?.[actionIndex];
    if (!action) return;
    if ('scroll' in action) instance?.scrollTo(action.scroll);
    if ('props' in action) options = { ...options, ...action.props };
  }
</script>

{#snippet customPopup(menu: Snippet)}
  {@render menu()}
  <input aria-label="Virtual popup draft" />
{/snippet}

<section id="tree-select-virtual-fixture">
  <label>Virtual TreeSelect sample<select value={id} onchange={event => setSample(event.currentTarget.value)}>
    {#each treeSelectVirtualSamples as entry}<option value={entry.id}>{entry.id}</option>{/each}
  </select></label>
  <label>Virtual TreeSelect action<select bind:value={actionIndex}>
    {#each sample.actions ?? [] as _, index}<option value={index}>{index}</option>{/each}
  </select></label>
  <button type="button" onclick={apply}>Apply virtual TreeSelect action</button>
  <output data-virtual-scrolls={scrolls} data-virtual-scroll-target={validScrollTarget}
    data-virtual-expansions={expansions} data-virtual-ref={Boolean(instance?.scrollTo && element?.matches('[data-ant-tree-choice-control]'))}></output>
  {#key id}
    <ConfigProvider {...sample.provider} theme={{ token: { motion: false, ...sample.tokens } }} locale={enUS}>
      <div style="margin:64px">
        <TreeSelect {...treeSelectVirtualProps(sample)} {...options} treeData={data}
          bind:this={instance} bind:nativeElement={element} aria-label="Virtual tree selection"
          style={`width:${sample.wide ? 180 : 320}px`} popupRender={sample.customPopup ? customPopup : undefined}
          onTreeExpand={() => { expansions++; }} onPopupScroll={event => {
            scrolls++;
            validScrollTarget &&= event.currentTarget.matches('.ant-tree-list-holder');
          }} />
      </div>
    </ConfigProvider>
  {/key}
</section>
