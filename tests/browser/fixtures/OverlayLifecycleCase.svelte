<script lang="ts">
  import { untrack } from 'svelte';
  import { ConfigProvider, Tooltip, Popover, Popconfirm, TypographyText, Slider } from 'antd-svelte';
  import OverlayLifecycleContent from './OverlayLifecycleContent.svelte';
  import type { OverlayLifecycleCase as Sample } from './overlay-lifecycle-presets';

  let { sample, changed = false, mounted = true, sliderMode = 'off' }: {
    sample: Sample;
    changed?: boolean;
    mounted?: boolean;
    sliderMode?: 'off' | 'single' | 'range' | 'pinned';
  } = $props();
  let open = $state(untrack(() => sample.open));
  let events = $state<boolean[]>([]);
  let containerCalls = $state(0);
  let asyncConfirm = $state(false);
  let resolveConfirm: (() => void) | undefined;
  let options = $derived({
    ...sample.options,
    ...(changed ? sample.patch : {}),
    open,
    defaultOpen: sample.defaultOpen,
    trigger: [] as const,
    onOpenChange: (value: boolean) => {
      events.push(value);
      open = value;
    },
    classNames: ({ props }: { props: { destroyOnHidden?: boolean } }) => ({
      root: `lifecycle-destroy-${props.destroyOnHidden}`
    }),
    getPopupContainer: sample.container ? () => {
      untrack(() => containerCalls++);
      return document.body;
    } : undefined
  });
</script>

{#snippet content()}<OverlayLifecycleContent />{/snippet}
{#snippet anchor()}<button type="button" data-lifecycle-anchor="">Lifecycle anchor</button>{/snippet}

<button type="button" onclick={() => open = true}>Open lifecycle popup</button>
<button type="button" onclick={() => open = false}>Close lifecycle popup</button>
<label><input type="checkbox" bind:checked={asyncConfirm} /> Async lifecycle confirm</label>
<button type="button" onclick={() => resolveConfirm?.()}>Resolve lifecycle confirm</button>
<ConfigProvider theme={{ token: { motion: false } }} tooltip={{}} popover={{}} popconfirm={{}}>
  <div style="margin:80px 180px" id="lifecycle-case">
    {#if mounted}
      {#if sliderMode !== 'off'}
        <Slider {...sliderMode === 'single'
          ? { range: false, defaultValue: 50 }
          : { range: true, defaultValue: [25, 75] as [number, number] }}
          tooltip={{ ...sample.options, ...(changed ? sample.patch : {}),
            open: sliderMode === 'pinned' ? open : undefined,
            formatter: value => `Value ${value}` }} />
      {:else if sample.component === 'tooltip'}
        <Tooltip {...options} title={content}>{@render anchor()}</Tooltip>
      {:else if sample.component === 'popover'}
        <Popover {...options} title="Lifecycle title" {content}>{@render anchor()}</Popover>
      {:else if sample.component === 'popconfirm'}
        <Popconfirm {...options} title="Lifecycle title" description={content}
          okText="Confirm lifetime" cancelText="Cancel lifetime"
          onConfirm={asyncConfirm ? () => new Promise<void>(resolve => resolveConfirm = resolve)
            : undefined}>
          {@render anchor()}
        </Popconfirm>
      {:else}
        <TypographyText data-lifecycle-anchor="" children="A long text that exceeds its width"
          style="display:block;width:80px" ellipsis={{ tooltip: { ...options, title: content } }} />
      {/if}
    {/if}
  </div>
</ConfigProvider>
<output aria-label="Lifecycle events">{JSON.stringify(events)}</output>
<output aria-label="Lifecycle container calls">{containerCalls}</output>
