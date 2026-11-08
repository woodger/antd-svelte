<script lang="ts">
  import { ConfigProvider, Steps, Timeline, type StepsIconInfo } from 'antd-svelte';
  import type { Snippet } from 'svelte';
  import {
    stepsContextConfig, stepsConfigRecord, stepsLocalProps, stepsConfigItems, stepsTimelineConfig,
    type StepsConfigSample
  } from './steps-config-cases';

  let { sample, interactive = false, customIcon = false, removeFirst = false }: {
    sample: StepsConfigSample;
    interactive?: boolean;
    customIcon?: boolean;
    removeFirst?: boolean;
  } = $props();
  let chosen = $state<number>();
  let context = $derived(stepsContextConfig(sample));
  let inner = $derived(stepsConfigRecord(sample.inner));
  let timeline = $derived(stepsTimelineConfig(sample));
  let componentProps = $derived({
    ...stepsLocalProps(sample),
    ...(chosen === undefined ? {} : { current: chosen })
  });
  let items = $derived(stepsConfigItems(sample).slice(removeFirst ? 1 : 0));
</script>

{#snippet mappedIcon(original: Snippet, info: StepsIconInfo)}
  <info.components.Icon data-testid="prefix-step-icon">{info.index + 1}</info.components.Icon>
{/snippet}

{#snippet steps(id: string)}
  <div data-steps-config={id} data-steps-prefix={id}
    data-prefix={id === 'sibling' ? 'ant-steps' : sample.prefixCls || 'ant-steps'}>
    {#if sample.kind === 'timeline'}
      <Timeline items={items} orientation={sample.orientation} />
    {:else}
      <Steps {...componentProps} {items} prefixCls={id === 'sibling' ? undefined : sample.prefixCls}
        onChange={interactive ? value => { chosen = value; } : undefined}
        iconRender={customIcon ? mappedIcon : undefined} />
    {/if}
  </div>
{/snippet}

<ConfigProvider direction={sample.direction}
  theme={{ ...sample.theme, token: { motion: false, ...sample.theme?.token } }}
  steps={context} {timeline}>
  {@render steps('normal')}
  <ConfigProvider steps={inner}>{@render steps('nested')}</ConfigProvider>
</ConfigProvider>
<ConfigProvider direction={sample.direction} theme={{ token: { motion: false } }}
  steps={{ class: 'inner-sibling', style: 'padding:13px' }}>
  {@render steps('sibling')}
</ConfigProvider>
