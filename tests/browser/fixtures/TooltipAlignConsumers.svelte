<script lang="ts">
  import { Slider, TypographyText, type TooltipAlignConfig } from 'antd-svelte';

  let { mode }: { mode: string } = $props();
  let shifted = $state(false);
  let payload = $state('');
  let align = $derived<TooltipAlignConfig>(shifted ? { offset: [24, 18] } : {});
  const placements = { top: { points: ['bc', 'tc'], offset: [0, -12], dynamicInset: true } };

  function record(_node: HTMLElement, value: TooltipAlignConfig) {
    payload = JSON.stringify(value);
  }
</script>

<div id="alignment-consumers" style="margin:180px;width:400px">
  <button type="button" onclick={() => shifted = true}>Shift consumer alignment</button>
  <output aria-label="Consumer alignment payload" style="display:block;height:80px;overflow:hidden">
    {payload}
  </output>
  {#if mode === 'typography'}
    <TypographyText style="display:block;width:80px" tabindex={0}
      ellipsis={{ tooltip: { title: 'Consumer value', align, builtinPlacements: placements,
        onPopupAlign: record, mouseEnterDelay: 0, mouseLeaveDelay: 0 } }}>
      A long text that exceeds its width
    </TypographyText>
  {:else}
    <Slider {...mode === 'single' ? { range: false, defaultValue: 25 }
      : { range: true, defaultValue: [25, 75] as [number, number] }}
      tooltip={{ open: mode === 'pinned' ? true : undefined, formatter: () => 'Consumer value',
        align, builtinPlacements: placements, onPopupAlign: record }} />
  {/if}
</div>
