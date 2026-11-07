<script lang="ts">
  import { Tabs } from 'antd-svelte';
  import TabsContent from './TabsContent.svelte';
  import reference from './ant-design-tabs-destroy-reference.json';

  interface DestroySample {
    name: string;
    rootModern?: boolean;
    itemModern?: boolean;
    force?: boolean;
  }

  let name = $state(reference.cases[0].name);
  let sample: DestroySample = $derived(reference.cases.find(item => item.name === name)!);
  let enabled = $state(true);
  let current = $state<string | undefined>('alpha');
  let events = $state<string[]>([]);
  let changes = $state<string[]>([]);
</script>

<style>
  label { display: block; }
</style>

{#snippet alpha()}<TabsContent name="Alpha" onLifecycle={event => events.push(event)} />{/snippet}
{#snippet beta()}<TabsContent name="Beta" onLifecycle={event => events.push(event)} />{/snippet}
<section id="tabs-destroy-fixture">
  <h2>Tabs destruction</h2>
  <label>Tabs destruction reference <select aria-label="Tabs destruction reference" bind:value={name}>
    {#each reference.cases as item}<option value={item.name}>{item.name}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={enabled} /> Use destruction flags</label>
  <button type="button" onclick={() => current = 'beta'}>Hide Alpha</button>
  <form id="tabs-destroy-form" onsubmit={event => event.preventDefault()}>
    <Tabs id="tabs-destroy-main" aria-label="Destruction sections" bind:activeKey={current}
      destroyOnHidden={enabled ? sample.rootModern : undefined}
      items={[
        {
          key: 'alpha', label: 'Alpha', children: alpha, forceRender: sample.force,
          destroyOnHidden: enabled ? sample.itemModern : undefined
        },
        { key: 'beta', label: 'Beta', children: beta }
      ]} onChange={key => changes.push(key)} />
  </form>
  <output aria-label="Tabs destruction lifecycle">{JSON.stringify(events)}</output>
  <output aria-label="Tabs destruction changes">{JSON.stringify(changes)}</output>
</section>
