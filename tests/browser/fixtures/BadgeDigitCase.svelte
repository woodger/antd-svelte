<script lang="ts">
  import { untrack } from 'svelte';
  import { Badge, ConfigProvider } from 'antd-svelte';
  import type { BadgeContext } from 'antd-svelte';
  import type { BadgeDigitCase } from './badge-digit-motion-presets';

  let { sample, motion = false }: { sample: BadgeDigitCase; motion?: boolean; } = $props();
  let count = $state(untrack(() => sample.initial));
  let mounted = $state(true);
  let step = $state(0);
  let ended = $state(0);
  let surface = $state<HTMLDivElement>();

  function next() {
    const action = sample.steps[step++];
    if (action?.kind === 'value') count = action.value;
    if (action?.kind === 'unmount') mounted = false;
    if (action?.kind === 'end') finish();
  }

  function finish() {
    surface?.querySelectorAll('.ant-scroll-number-only').forEach(node => {
      node.dispatchEvent(new TransitionEvent('transitionend', {
        bubbles: true, propertyName: 'transform'
      }));
    });
  }
</script>

{#snippet target(context: BadgeContext)}<button type="button" aria-label="Digit owner"
  aria-describedby={context.descriptionId} style="width:48px;height:48px;border:0;padding:0">T</button>{/snippet}

<button type="button" onclick={next} disabled={step >= sample.steps.length}>Next digit step</button>
<button type="button" onclick={finish}>Finish digit transition</button>
<button type="button" onclick={() => mounted = false}>Unmount digit badge</button>
<output aria-label="Digit transition events">{ended}</output>
<ConfigProvider direction={sample.direction} theme={{
  token: { motion, motionDurationSlow: motion ? '0.3s' : '0s' },
  components: sample.badge ? { Badge: sample.badge } : undefined
}}>
  <div id="digit-motion-surface" bind:this={surface} ontransitionend={() => ended++}>
    {#if mounted}<Badge {count} overflowCount={sample.overflowCount ?? 9999}
      showZero size={sample.size} children={target} />{/if}
  </div>
</ConfigProvider>
