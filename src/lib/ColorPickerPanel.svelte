<script lang="ts">
  import { provideFormField } from './form-context';
  import { provideCompact } from './space-compact-context';
  import type { ColorPickerPanelProps } from './color-picker.types';
  import ColorPickerPicker from './ColorPickerPicker.svelte';
  import ColorPickerPresets from './ColorPickerPresets.svelte';
  import Divider from './Divider.svelte';

  let { activeIndex = $bindable(0), dragging = $bindable(false), ...props }:
    ColorPickerPanelProps = $props();
  provideFormField(undefined);
  provideCompact(null);
</script>

{#snippet Picker()}
  <ColorPickerPicker {...props} bind:activeIndex bind:dragging />
{/snippet}

{#snippet Presets()}
  {#if Array.isArray(props.props.presets)}
    <ColorPickerPresets prefixCls={props.prefixCls} presets={props.props.presets}
      value={props.value} onChange={props.onChange} />
  {/if}
{/snippet}

{#snippet panel()}
  <div class={`${props.prefixCls}-inner-content`}>
    {@render Picker()}
    {#if Array.isArray(props.props.presets)}<Divider />{/if}
    {@render Presets()}
  </div>
{/snippet}

<div class={`${props.prefixCls}-inner`}>
  {#if props.props.panelRender}{@render props.props.panelRender(panel, { components: { Picker, Presets } })}
  {:else}{@render panel()}{/if}
</div>
