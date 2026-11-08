<script lang="ts">
  import { ConfigProvider, Steps, Timeline } from 'antd-svelte';
  import {
    stepsContextConfig, stepsConfigRecord, stepsLocalProps, stepsConfigItems, stepsTimelineConfig,
    type StepsConfigSample
  } from './steps-config-cases';

  let { sample }: { sample: StepsConfigSample } = $props();
  let context = $derived(stepsContextConfig(sample));
  let inner = $derived(stepsConfigRecord(sample.inner));
  let timeline = $derived(stepsTimelineConfig(sample));
  let componentProps = $derived(stepsLocalProps(sample));
  let items = $derived(stepsConfigItems(sample));
</script>

{#snippet steps(id: string)}
  <div data-steps-config={id}>
    {#if sample.kind === 'timeline'}
      <Timeline items={items} orientation={sample.orientation} />
    {:else}
      <Steps {...componentProps} {items} />
    {/if}
  </div>
{/snippet}

<ConfigProvider direction={sample.direction} theme={{ token: { motion: false } }}
  steps={context} {timeline}>
  {@render steps('normal')}
  <ConfigProvider steps={inner}>{@render steps('nested')}</ConfigProvider>
</ConfigProvider>
<ConfigProvider direction={sample.direction} theme={{ token: { motion: false } }}
  steps={{ class: 'inner-sibling', style: 'padding:13px' }}>
  {@render steps('sibling')}
</ConfigProvider>
