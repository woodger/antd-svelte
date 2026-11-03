<script lang="ts">
  import { untrack } from 'svelte';
  import { Badge, ConfigProvider } from 'antd-svelte';
  import type { BadgeContext, BadgeCountContext } from 'antd-svelte';
  import type { BadgeZoomCase, BadgeZoomValues } from './badge-zoom-presets';

  let { sample, interactive = false, fast = false }: {
    sample: BadgeZoomCase;
    interactive?: boolean;
    fast?: boolean;
  } = $props();
  let values = $state<BadgeZoomValues>(untrack(() => ({
    count: 0, custom: false, show: true, dot: false, ...sample
  })));
  let step = $state(0);
  let mounted = $state(true);
  let surface = $state<HTMLDivElement>();
  let count = $derived(values.custom ? values.show ? custom : null : values.count);

  function current() {
    return surface?.querySelector(
      'sup, [data-custom-zoom], [data-ant-badge-visual]'
    );
  }

  function next() {
    const action = sample.steps[step++];
    if (action?.kind === 'set') {
      const { kind: _kind, ...patch } = action;
      values = { ...values, ...patch };
    }
    if (action?.kind === 'unmount') mounted = false;
    if (action?.kind === 'end') current()?.dispatchEvent(new AnimationEvent('animationend', {
      bubbles: true, animationName: 'antZoomBadgeOut'
    }));
    if (action?.kind === 'inner-end') {
      surface?.querySelector('.ant-scroll-number-only')?.dispatchEvent(new TransitionEvent(
        'transitionend', { bubbles: true, propertyName: 'transform' }
      ));
    }
  }
</script>

{#snippet custom(attributes: BadgeCountContext)}<span {...attributes} data-custom-zoom
  class={[attributes.class, 'case-custom-zoom']}
  style={`${attributes.style ?? ''};width:24px;height:16px;display:inline-block`}>{#if interactive}<input
    aria-label="Zoom custom draft" value="Seed" style="width:64px;font:inherit" />{:else}★{/if}</span>{/snippet}
{#snippet target(context: BadgeContext)}<button type="button" aria-label="Zoom owner"
  aria-describedby={context.descriptionId} style="width:48px;height:48px;border:0;padding:0">T</button>{/snippet}

<button type="button" onclick={next} disabled={step >= sample.steps.length}>Next zoom step</button>
<ConfigProvider theme={{ token: {
  motion: sample.motion ?? true, motionDurationSlow: fast ? '0.3s' : '10s'
} }}>
  <div id="badge-zoom-surface" bind:this={surface}
    data-badge-zoom-prefix={values.prefixCls || 'ant-badge'}>
    {#if mounted}<Badge {count} dot={values.dot} status={values.status} title={values.title}
      prefixCls={values.prefixCls} scrollNumberPrefixCls={values.scrollNumberPrefixCls}
      children={sample.wrap === false ? undefined : target} />{/if}
  </div>
</ConfigProvider>
