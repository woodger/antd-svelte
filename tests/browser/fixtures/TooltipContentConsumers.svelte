<script lang="ts">
  import { Slider, TypographyText } from 'antd-svelte';

  let mode = $state('single');
  let fresh = $state(false);
  let title = $state('A');
</script>

<select aria-label="Tooltip content consumer" bind:value={mode}>
  <option value="single">Single Slider</option>
  <option value="range">Range Slider</option>
  <option value="typography">Typography</option>
</select>
<label><input type="checkbox" bind:checked={fresh} /> Fresh consumer content</label>
<button type="button">Leave consumer</button>
<button type="button" onclick={() => title = 'B'}>Update consumer title</button>
<div class="tooltip-content-consumer">
  {#if mode === 'typography'}
    <TypographyText style="display:block;width:80px" tabindex={0}
      ellipsis={{ tooltip: { title, fresh, mouseEnterDelay: 0, mouseLeaveDelay: 0 } }}>
      A long text that exceeds the width
    </TypographyText>
  {:else}
    <Slider {...mode === 'single'
      ? { range: false, defaultValue: 25 }
      : { range: true, defaultValue: [25, 75] as [number, number] }}
      tooltip={{ fresh, formatter: () => title }} />
  {/if}
</div>
