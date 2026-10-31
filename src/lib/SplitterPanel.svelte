<script lang="ts">
  import { splitterPanelHidden, type SplitterPanel } from './splitter.engine';
  import type { SplitterSize } from './splitter.types';

  let { panel, size, class: className, style, motion, destroyOnHidden }: {
    panel: SplitterPanel;
    size?: SplitterSize;
    class?: string;
    style: string;
    motion: boolean;
    destroyOnHidden: boolean;
  } = $props();

  let hidden = $derived(splitterPanelHidden(size));
  let basis = $derived(size === undefined ? 'auto' : typeof size === 'number' ? `${size}px` : size);
</script>

<div
  class={[
    'ant-splitter-panel',
    hidden && 'ant-splitter-panel-hidden',
    motion && 'ant-splitter-panel-transition',
    className,
    panel.class
  ]}
  style={[style, panel.style, `flex-basis:${basis}`, `flex-grow:${size === undefined ? 1 : 0}`].filter(Boolean).join(';')}
>
  {#if !(destroyOnHidden && hidden)}
    {#if typeof panel.children === 'function'}{@render panel.children()}{:else if typeof panel.children !== 'boolean'}{panel.children ?? ''}{/if}
  {/if}
</div>
