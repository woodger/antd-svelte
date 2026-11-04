<script lang="ts">
  import { ConfigProvider, TypographyParagraph } from 'antd-svelte';
  import OverlayConfigCase from './OverlayConfigCase.svelte';
  import { buildOverlayProvider } from './overlay-config-presets';
  import reference from './ant-design-typography-tooltip-reference.json';
  import type { OverlayConfigCase as Sample } from './overlay-config-presets';

  let name = $state(reference.cases[0].name);
  let step = $state(0);
  let interactive = $state(false);
  let preparing = $state(false);
  let mounted = $state(true);
  let actions = $state(false);
  let actionEvents = $state<string[]>([]);

  let source = $derived(reference.cases.find(sample => sample.name === name)! as Sample);
  let sample = $derived(preparing ? { ...source, provider: { tooltip: { trigger: [] } },
    child: {}, local: { trigger: [] } } as Sample : source);
</script>

<section id="typography-tooltip-fixture">
  <h2>Typography Tooltip events and defaults</h2>
  <label>Typography tooltip reference <select bind:value={name} onchange={() => step = 0}>
    {#each reference.cases as sample}<option value={sample.name}>{sample.name}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={interactive} /> Interactive Typography tooltip</label>
  <label><input type="checkbox" bind:checked={preparing} /> Prepare Typography measurement</label>
  <label style="position:fixed;right:8px;bottom:8px">
    <input type="checkbox" bind:checked={actions} /> Typography action tooltips
  </label>
  <button type="button" onclick={() => step++}>Next Typography tooltip frame</button>
  <button type="button" onclick={() => mounted = !mounted}>Toggle Typography tooltip</button>
  <output aria-label="Typography tooltip frame">{step}</output>
  {#if mounted}
    {#if actions}
      <ConfigProvider theme={{ token: { motion: false } }} {...buildOverlayProvider(sample.provider)}>
        <ConfigProvider {...buildOverlayProvider(sample.child)}>
          <TypographyParagraph children="Action text"
            editable={{ tooltip: 'Edit text', onStart: () => actionEvents.push('edit') }}
            copyable={{ tooltips: ['Copy text', 'Copied text'],
              onCopy: () => actionEvents.push('copy') }} />
        </ConfigProvider>
      </ConfigProvider>
    {:else}
      {#key name}<OverlayConfigCase {sample} {step} {interactive} />{/key}
    {/if}
  {/if}
  <output aria-label="Typography action events">{actionEvents.join('|')}</output>
  <button type="button">After Typography tooltip</button>
</section>
