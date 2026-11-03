<script lang="ts">
  import { Badge, ConfigProvider, theme } from 'antd-svelte';
  import type { BadgeContext, BadgeCountContext } from 'antd-svelte';
  import type { BadgeCountCase } from './badge-count-presets';
  import BadgeCountState from './BadgeCountState.svelte';

  let {
    sample,
    changed = false,
    mounted = true,
    dark = false,
    mode = 'case'
  }: {
    sample: BadgeCountCase;
    changed?: boolean;
    mounted?: boolean;
    dark?: boolean;
    mode?: 'case' | 'none' | 'string';
  } = $props();
  let clicks = $state(0);
  let count = $derived(mode === 'none' ? null : mode === 'string' ? 'new'
    : sample.custom === 'empty' ? empty : sample.custom === 'stateful' ? stateful
      : sample.custom === 'label' ? label : changed ? 'fresh' : sample.count);
</script>

{#snippet label({ class: className, style }: BadgeCountContext)}<span data-count-root
  class={['case-custom-count', className]}
  style={`${style ?? ''};display:inline-flex;width:24px;height:16px;align-items:center;justify-content:center;color:rgb(245,34,45);${sample.ownOffset ? 'margin-top:7px;inset-inline-end:3px' : ''}`}
  title={sample.ownTitle ? 'Own count' : undefined}>★</span>{/snippet}
{#snippet stateful(attributes: BadgeCountContext)}<BadgeCountState {...attributes} />{/snippet}
{#snippet empty()}{/snippet}
{#snippet target(context: BadgeContext)}<button type="button" aria-label="Badge count target"
  aria-describedby={context.descriptionId} data-count={String(context.count)}
  onclick={() => clicks++}
  style="display:inline-block;padding:0;border:0;width:48px;height:48px;font:inherit;line-height:1;background:#eee">T</button>{/snippet}

<ConfigProvider direction={sample.direction} theme={{
  token: { motion: false },
  algorithm: dark || sample.theme === 'dark' ? theme.darkAlgorithm
    : sample.theme === 'compact' ? theme.compactAlgorithm : undefined,
  components: sample.badge ? { Badge: sample.badge } : undefined
}}>
  <div id="badge-count-surface"
    style="font-family:Arial;font-size:14px;color:rgb(12,34,56);line-height:22px">
    {#if mounted}<Badge {count} overflowCount={sample.overflowCount} showZero={sample.showZero}
      dot={sample.dot} status={sample.status} text={sample.text} size={sample.size}
      offset={changed ? [18, 6] : sample.offset} title={sample.title}
      children={sample.wrap === false ? undefined : target} />{/if}
  </div>
</ConfigProvider>
<output aria-label="Badge target clicks">{clicks}</output>
