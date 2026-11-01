<script lang="ts">
  import { untrack } from 'svelte';
  import { useConfig } from './config-context';
  import { generateColor, isBrightColor } from './color-picker.engine';
  import { toggleCollapseKey } from './collapse.engine';
  import { colorPickerRuRU } from './color-picker.locale';
  import type { AggregationColor } from './color';
  import type { ColorPickerPreset } from './color-picker.types';
  import CollapsePanel from './CollapsePanel.svelte';
  import Icon from './Icon.svelte';

  let { prefixCls, presets, value, onChange }: {
    prefixCls: string;
    presets: readonly ColorPickerPreset[];
    value: AggregationColor;
    onChange: (value: AggregationColor) => void;
  } = $props();
  const config = useConfig();
  const id = $props.id();
  let opened = $state(untrack(() => presets.flatMap((preset, index) =>
    preset.defaultOpen === false ? [] : [`panel-${preset.key ?? index}`])));
  let locale = $derived({ ...colorPickerRuRU, ...config.locale.colorPicker });
</script>

<style>
  .preset-heading { margin: 0; font: inherit; flex: 1; }
  .preset-trigger { display: flex; width: 100%; padding: 0; border: 0; background: transparent; color: inherit; font: inherit; text-align: start; cursor: pointer; }
  .preset-trigger:focus-visible, .preset-color:focus-visible { outline: 2px solid var(--ant-color-primary); outline-offset: 2px; }
  .preset-color { padding: 0; border: 0; background-color: transparent; }
  @media (prefers-reduced-motion: reduce) { .ant-collapse-arrow { transition: none; } }
</style>

<div class={`${prefixCls}-presets`}>
  <div class={['ant-collapse ant-collapse-css-var ant-collapse-ghost ant-collapse-icon-placement-start',
    config.direction === 'rtl' && 'ant-collapse-rtl']}>
    {#each presets as preset, index (preset.key ?? index)}
      {@const key = `panel-${preset.key ?? index}`}
      {@const open = opened.includes(key)}
      {@const headerId = `color-preset-${id}-${index}-header`}
      <div class={['ant-collapse-item', open && 'ant-collapse-item-active']}>
        <div class="ant-collapse-header">
          <h3 class="preset-heading">
            <button type="button" class="preset-trigger" id={headerId}
              aria-expanded={open} aria-controls={`color-preset-${id}-${index}-panel`}
              onclick={event => {
                if (!event.defaultPrevented) opened = toggleCollapseKey(opened, key, false);
              }}>
              <span class="ant-collapse-expand-icon" aria-hidden="true">
                <span class="ant-collapse-arrow"
                  style={`transform:rotate(${open ? 90 : config.direction === 'rtl' ? 180 : 0}deg)`}>
                  <Icon name="right" />
                </span>
              </span>
              <span class={`${prefixCls}-presets-label`}>
                {#if typeof preset.label === 'function'}{@render preset.label()}{:else}{preset.label}{/if}
              </span>
            </button>
          </h3>
        </div>
        {#snippet content()}
          <div class={`${prefixCls}-presets-items`}>
            {#each preset.colors as presetColor}
              {@const color = generateColor(presetColor)}
              <button type="button" aria-label={color.toCssString()}
                aria-pressed={color.toCssString() === value.toCssString()}
                class={[`${prefixCls}-color-block`, `${prefixCls}-presets-color`, 'preset-color',
                  color.toCssString() === value.toCssString() && `${prefixCls}-presets-color-checked`,
                  isBrightColor(color, config.theme.mode === 'dark' ? '#1f1f1f' : '#fff')
                    && `${prefixCls}-presets-color-bright`]}
                onclick={() => onChange(color)}>
                <span class={`${prefixCls}-color-block-inner`}
                  style={`display:block;background:${color.toCssString()}`}></span>
              </button>
            {:else}<span class={`${prefixCls}-presets-empty`}>{locale.presetEmpty}</span>{/each}
          </div>
        {/snippet}
        <CollapsePanel id={`color-preset-${id}-${index}-panel`} labelledBy={headerId}
          itemKey={key} {open} region={presets.length <= 6} children={content} />
      </div>
    {/each}
  </div>
</div>
