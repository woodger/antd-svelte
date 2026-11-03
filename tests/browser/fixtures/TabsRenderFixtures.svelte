<script lang="ts">
  import reference from './ant-design-tabs-render-reference.json';
  import TabsRenderCase from './TabsRenderCase.svelte';
  import type { TabsRenderCase as RenderCase } from './tabs-render-presets';

  let name = $state(reference.cases[0].name);
  let sample = $derived(reference.cases.find(item => item.name === name)! as RenderCase);
  let mounted = $state(true);
  let custom = $state(true);
  let updated = $state(false);
  let reverse = $state(false);
  let compact = $state(false);
  let keyboard = $state(false);
  let cancel = $state(false);
  let observeScroll = $state(false);
  let attachments = $state<string[]>([]);
  let lifecycle = $state<string[]>([]);
  let headerRefs = $state<string[]>([]);
</script>

<section id="tabs-render-fixture">
  <h2>Tabs custom tab bar</h2>
  <label>Tabs render reference <select aria-label="Tabs render reference" bind:value={name}>
    {#each reference.cases as item}<option value={item.name}>{item.name}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={mounted} /> Mount render Tabs</label>
  <label><input type="checkbox" bind:checked={custom} /> Use custom tab bar</label>
  <label><input type="checkbox" bind:checked={updated} /> Update tab bar props</label>
  <label><input type="checkbox" bind:checked={reverse} /> Reverse render items</label>
  <label><input type="checkbox" bind:checked={compact} /> Compact render theme</label>
  <label><input type="checkbox" bind:checked={keyboard} /> Keyboard custom activation</label>
  <label><input type="checkbox" bind:checked={cancel} /> Cancel custom activation</label>
  <label><input type="checkbox" bind:checked={observeScroll} /> Observe custom scroll</label>
  <input aria-label="Render Tabs outside" />
  {#if mounted}
    {#key name}<TabsRenderCase {sample} {updated} {reverse} {compact} {custom} {keyboard}
      {cancel} {observeScroll} onAttachment={event => attachments.push(event)}
      onHeaderRef={event => headerRefs.push(event)}
      onLifecycle={event => lifecycle.push(event)} />{/key}
  {/if}
  <output aria-label="Render Tabs attachments">{JSON.stringify(attachments)}</output>
  <output aria-label="Render Tabs lifecycle">{JSON.stringify(lifecycle)}</output>
  <output aria-label="Render Tabs header refs">{JSON.stringify(headerRefs)}</output>
</section>
