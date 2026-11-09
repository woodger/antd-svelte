<script lang="ts">
  import { untrack } from 'svelte';
  import { useConfig } from './config-context';
  import { useComponentTheme } from './theme-component.svelte';
  import { useDesignTokenContext } from './theme-context.svelte';
  import { generateColor, isBrightColor } from './color-picker.engine';
  import { toggleCollapseKey } from './collapse.engine';
  import { colorPickerRuRU } from './color-picker.locale';
  import type { AggregationColor } from './color';
  import type { ColorPickerPreset } from './color-picker.types';
  import CollapsePanel from './CollapsePanel.svelte';
  import Icon from './Icon.svelte';
  import { getCollapsePrefixCss } from './collapse-prefix.engine';
  import ThemeScopeStyle from './ThemeScopeStyle.svelte';

  let { prefixCls, presets, value, onChange }: {
    prefixCls: string;
    presets: readonly ColorPickerPreset[];
    value: AggregationColor;
    onChange: (value: AggregationColor) => void;
  } = $props();
  const config = useConfig();
  const collapseTheme = useComponentTheme('Collapse');
  const designTheme = useDesignTokenContext();
  const id = $props.id();
  let collapsePrefix = $derived(config.getPrefixCls('collapse'));
  let collapseCss = $derived(getCollapsePrefixCss(collapsePrefix));
  let opened = $state(untrack(() => presets.flatMap((preset, index) =>
    preset.defaultOpen === false ? [] : [`panel-${preset.key ?? index}`])));
  let locale = $derived({ ...colorPickerRuRU, ...config.locale.colorPicker });
  let background = $derived(designTheme.enabled ? designTheme.state.token.colorBgElevated
    : config.theme.mode === 'dark' ? '#1f1f1f' : '#fff');
</script>

<style>
  .preset-heading { margin: 0; font: inherit; flex: 1; }
  .preset-trigger { display: flex; width: 100%; padding: 0; border: 0; background: transparent; color: inherit; font: inherit; text-align: start; cursor: pointer; }
  .preset-trigger:focus-visible, .preset-color:focus-visible { outline: 2px solid var(--ant-color-primary); outline-offset: 2px; }
  .preset-color { padding: 0; border: 0; background-color: transparent; }
  @media (prefers-reduced-motion: reduce) { .preset-arrow { transition: none; } }
</style>

{#if collapseCss}<ThemeScopeStyle css={collapseCss} scope={`collapse-prefix:${collapsePrefix}`} />{/if}<div class={`${prefixCls}-presets`}>
  <div class={[collapsePrefix, 'ant-collapse-css-var', `${collapsePrefix}-ghost`,
    `${collapsePrefix}-icon-placement-start`,
    collapseTheme.className, config.direction === 'rtl' && `${collapsePrefix}-rtl`]}
    data-ant-collapse-prefix={collapseCss ? collapsePrefix : undefined}
    style={collapseTheme.style}>
    {#each presets as preset, index (preset.key ?? index)}
      {@const key = `panel-${preset.key ?? index}`}
      {@const open = opened.includes(key)}
      {@const headerId = `color-preset-${id}-${index}-header`}
      <div class={[`${collapsePrefix}-item`, open && `${collapsePrefix}-item-active`]}>
        <div class={`${collapsePrefix}-header`}>
          <h3 class="preset-heading">
            <button type="button" class="preset-trigger" id={headerId}
              aria-expanded={open} aria-controls={`color-preset-${id}-${index}-panel`}
              onclick={event => {
                if (!event.defaultPrevented) opened = toggleCollapseKey(opened, key, false);
              }}>
              <span class={`${collapsePrefix}-expand-icon`} aria-hidden="true">
                <span class={[`${collapsePrefix}-arrow`, 'preset-arrow']}
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
                  isBrightColor(color, background)
                    && `${prefixCls}-presets-color-bright`]}
                onclick={() => onChange(color)}>
                <span class={`${prefixCls}-color-block-inner`}
                  style={`display:block;background:${color.toCssString()}`}></span>
              </button>
            {:else}<span class={`${prefixCls}-presets-empty`}>{locale.presetEmpty}</span>{/each}
          </div>
        {/snippet}
        <CollapsePanel id={`color-preset-${id}-${index}-panel`} labelledBy={headerId}
          itemKey={key} {open} region={presets.length <= 6} prefix={collapsePrefix} children={content} />
      </div>
    {/each}
  </div>
</div>
