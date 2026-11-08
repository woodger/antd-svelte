<script lang="ts">
  import { BorderBeam } from 'antd-svelte';

  export interface BeamGlobalSample {
    id: string;
    prefix?: string;
    childPrefix?: string;
    variablePrefix?: string;
    rtl?: boolean;
    local?: string;
    count?: number;
    color?: string;
    duration?: number;
    lineWidth?: number;
    size?: number;
    outset?: number;
    style?: Record<string, string | number>;
  }
  let { scope, sample, local = true }: {
    scope: string;
    sample: BeamGlobalSample;
    local?: boolean;
  } = $props();
  let target = $state<HTMLDivElement>();
  let style = $derived(Object.entries(sample.style ?? {})
    .map(([name, value]) => `${name}:${value}`).join(';'));
</script>

<div data-beam-global-scope={scope}>
  <div bind:this={target} data-beam-global-target
    style="position:relative;box-sizing:border-box;width:300px;height:100px;border-style:solid;border-width:1px 2px 3px 4px;border-radius:12px">
    <input aria-label={`${scope} widget draft`} value="initial draft" />
  </div>
  <BorderBeam {target} prefixCls={local ? sample.local : undefined}
    count={sample.count ?? 2} color={sample.color} duration={sample.duration}
    lineWidth={sample.lineWidth} size={sample.size} outset={sample.outset} {style} />
</div>
