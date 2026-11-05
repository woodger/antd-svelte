<script lang="ts">
  import { Tooltip } from 'antd-svelte';
  import reference from './ant-design-tooltip-content-reference.json';

  let { sample }: { sample: typeof reference.caches[number] } = $props();
  let step = $state(0);
  let frame = $derived(sample.frames[step]);
  let nodes = $state<(string | number | boolean)[][]>([['A', 0, false]]);
  let events = $state<boolean[]>([]);
  let color = $derived(frame.label === 'A' ? '#112233'
    : frame.label === 'B' ? '#334455' : '#556677');

  $effect.pre(() => { nodes[0][0] = frame.label; });
</script>

<button type="button" disabled={step === sample.frames.length - 1}
  onclick={() => step++}>Next cache step</button>
<output aria-label="Cache step">{frame.step}</output>
<output aria-label="Cache events">{JSON.stringify(events)}</output>
<Tooltip title={sample.array ? nodes : frame.label} open={frame.open}
  fresh={frame.fresh ?? sample.fresh}
  destroyOnHidden={sample.destroy} trigger={[]} onOpenChange={value => events.push(value)}
  classNames={{ container: `cache-${frame.label}` }} styles={{ container: `color:${color}` }}>
  <button type="button">Cache trigger</button>
</Tooltip>
