<script lang="ts">
  import { TreeSelect } from 'antd-svelte';
  import type { TreeSelectRef, TreeSelectRootContext } from 'antd-svelte';
  let custom = $state(true);
  let active = $state(true);
  let revision = $state(0);
  let nativeElement = $state<HTMLButtonElement | HTMLDivElement>();
  let inputElement = $state<HTMLInputElement>();
  let control = $state<TreeSelectRef>();
  let events = $state<unknown[]>([]);
</script>
{#snippet response(context: TreeSelectRootContext<HTMLButtonElement>)}
  <button {...context.attributes} {@attach context.register}>Custom response</button>
{/snippet}
<section id="tree-select-root-lifecycle-fixture">
  <form data-root-life-form>
    {#if active}<TreeSelect bind:nativeElement bind:inputElement bind:this={control}
      components={custom ? { root: { render: response, props: {
        type: 'button', title: revision ? 'Updated root title' : 'Initial root title',
        class: 'root-live', 'data-live': String(revision)
      } } } : undefined}
      name="root-choice" aria-label="Lifecycle root" defaultValue="a" showSearch={false}
      treeData={[{ value: 'a', title: 'Alpha' }, { value: 'b', title: 'Beta' }]}
      onChange={value => events.push(value)} />{/if}
  </form>
  <output data-root-life-refs>{JSON.stringify({ native: nativeElement?.tagName ?? null,
    input: inputElement?.tagName ?? null })}</output>
  <output data-root-life-events hidden>{JSON.stringify(events)}</output>
  <button type="button" onclick={() => { revision++; }}>Update live root</button>
  <button type="button" onclick={() => { custom = false; }}>Use default root</button>
  <button type="button" onclick={() => { custom = true; }}>Use custom root</button>
  <button type="button" onclick={() => control?.focus()}>Focus live root</button>
  <button type="button" onclick={() => control?.blur()}>Blur live root</button>
  <button type="button" onclick={() => { active = false; }}>Unmount live root</button>
</section>
