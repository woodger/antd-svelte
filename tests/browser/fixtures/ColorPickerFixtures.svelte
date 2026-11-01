<script lang="ts">
  import type { Snippet } from 'svelte';
  import { ColorPicker, ConfigProvider, type Color, type ColorValue, type ColorFormat,
    type ColorPickerPlacement, type ComponentSize, InputNumber } from 'antd-svelte';
  let value = $state<ColorValue>('#1677ff');
  let controlled = $state(true);
  let controlOpen = $state(false);
  let openOwner = $state(false);
  let freezeOpen = $state(false);
  let freeze = $state(false);
  let completeOnly = $state(false);
  let mounted = $state(true);
  let clear = $state(true);
  let disabledAlpha = $state(false);
  let disabledFormat = $state(false);
  let showPresets = $state(true);
  let destroy = $state(false);
  let hover = $state(false);
  let custom = $state(false);
  let panel = $state(false);
  let repeat = $state(false);
  let presetsClosed = $state(false);
  let portal = $state(false);
  let dark = $state(false);
  let compact = $state(false);
  let size = $state<ComponentSize>('middle');
  let placement = $state<ColorPickerPlacement>('bottomLeft');
  let centeredArrow = $state(false);
  let noArrow = $state(false);
  let format = $state<ColorFormat | undefined>();
  let target = $state<HTMLDivElement>();
  let events = $state<string[]>([]);
  let css = $state('');
  let number = $state<number | null>(50);
  let submits = $state(0);
  function change(color: Color, text: string) {
    events = [...events, `change:${text}`];
    css = text;
    if (!freeze && !completeOnly) value = color;
  }
  function complete(color: Color) {
    events = [...events, `complete:${color.toCssString()}`];
    if (completeOnly && !freeze) value = color;
  }
</script>

<style>
  section { padding: 20px; }
  .controls { display: flex; flex-wrap: wrap; gap: 8px 16px; }
  label { display: block; }
  .frame { margin-top: 30px; }
  output { display: block; min-height: 24px; overflow-wrap: anywhere; }
</style>

<section id="color-picker-fixture">
  <h2>ColorPicker</h2>
  <div class="controls">
    <label><input type="checkbox" bind:checked={mounted} /> Mount color</label>
    <label><input type="checkbox" bind:checked={controlled} /> Controlled color</label>
    <label><input type="checkbox" bind:checked={controlOpen} /> Controlled color popup</label>
    <label><input type="checkbox" bind:checked={openOwner} /> Color popup owner</label>
    <label><input type="checkbox" bind:checked={freezeOpen} /> Freeze color popup</label>
    <label><input type="checkbox" bind:checked={freeze} /> Freeze color owner</label>
    <label><input type="checkbox" bind:checked={completeOnly} /> Complete color only</label>
    <label><input type="checkbox" bind:checked={clear} /> Allow clear color</label>
    <label><input type="checkbox" bind:checked={disabledAlpha} /> Disable color alpha</label>
    <label><input type="checkbox" bind:checked={disabledFormat} /> Disable color format</label>
    <label><input type="checkbox" bind:checked={showPresets} /> Color presets</label>
    <label><input type="checkbox" bind:checked={destroy} /> Destroy color popup</label>
    <label><input type="checkbox" bind:checked={hover} /> Hover color trigger</label>
    <label><input type="checkbox" bind:checked={custom} /> Custom color trigger</label>
    <label><input type="checkbox" bind:checked={panel} /> Custom color panel</label>
    <label><input type="checkbox" bind:checked={repeat} /> Repeat color pickers</label>
    <label><input type="checkbox" bind:checked={presetsClosed} /> Collapsed color defaults</label>
    <label><input type="checkbox" bind:checked={portal} /> Color portal</label>
    <label><input type="checkbox" bind:checked={dark} /> Dark color</label>
    <label><input type="checkbox" bind:checked={compact} /> Compact color</label>
    <label><input type="checkbox" bind:checked={centeredArrow} /> Center color arrow</label>
    <label><input type="checkbox" bind:checked={noArrow} /> Hide color arrow</label>
    <label>Color size <select bind:value={size}><option>small</option><option>middle</option><option>large</option></select></label>
    <label>Color placement <select bind:value={placement}>
      {#each ['top','bottom','left','right','topLeft','topRight','bottomLeft','bottomRight',
        'leftTop','leftBottom','rightTop','rightBottom'] as point}
        <option value={point}>{point}</option>
      {/each}
    </select></label>
    <label>Fixed color format <select bind:value={format}><option value={undefined}>Auto</option>
      <option>hex</option><option>hsb</option><option>rgb</option></select></label>
  </div>
  <button type="button" onclick={() => { events = []; }}>Clear color events</button>
  <button type="button" onclick={() => { value = '#1677ff'; }}>Reset color owner</button>
  <button type="button" onclick={() => { value = null; }}>Clear color owner</button>
  <button type="button" onclick={() => {
    value = [{ percent: 0, color: '#f00' }, { percent: 100, color: '#00f' }];
  }}>Set gradient owner</button>
  <button type="button" onclick={() => { value = '#ff000080'; }}>Set alpha owner</button>
  <ConfigProvider theme={{ mode: dark ? 'dark' : 'light', compact }}
    colorPicker={{ class: 'configured-color', classNames: { body: 'configured-color-body' } }}>
    <form class="frame" onsubmit={event => { event.preventDefault(); submits++; }}>
      {#if mounted}
        <ColorPicker value={controlled ? value : undefined} defaultValue="#1677ff"
          open={controlOpen ? openOwner : undefined}
          mode={['single', 'gradient']} showText allowClear={clear} {disabledAlpha} {disabledFormat}
          {format} {size} {placement} trigger={hover ? 'hover' : 'click'}
          arrow={noArrow ? false : centeredArrow ? { pointAtCenter: true } : true}
          destroyOnHidden={destroy} children={custom ? customTrigger : undefined}
          panelRender={panel ? customPanel : undefined}
          getPopupContainer={portal ? () => target! : undefined}
          presets={showPresets ? [{ key: 'colors', label: 'Colors', defaultOpen: !presetsClosed,
            colors: ['#f00', '#0f0', '#fff'] },
            { key: 'gradients', label: 'Gradients', defaultOpen: false,
              colors: [[{ percent: 0, color: '#000' }, { percent: 100, color: '#fff' }]] },
            { key: 'empty', label: 'Empty colors', colors: [] }] : undefined}
          onChange={change} onChangeComplete={complete} onClear={() => { events = [...events, 'clear']; }}
          onOpenChange={open => {
            events = [...events, `open:${open}`];
            if (!freezeOpen) openOwner = open;
          }}
          onFormatChange={format => { events = [...events, `format:${format}`]; }} />
      {/if}
      <InputNumber bind:value={number} name="formatted-number" min={0} max={100}
        aria-label="Formatted number" formatter={value => `${value ?? ''}%`}
        parser={text => Number(text?.replace('%', ''))} />
      <button type="submit">Submit color form</button>
    </form>
    <div bind:this={target} id="color-portal"></div>
  </ConfigProvider>
  <output aria-label="Color events">{events.join('|')}</output>
  <output aria-label="Color css">{css}</output>
  <output aria-label="Color submissions">{submits}</output>
  <output aria-label="Color owner">{typeof value === 'object' && value && 'toCssString' in value
    ? value.toCssString() : JSON.stringify(value)}</output>
  <output aria-label="Formatted number value">{number}</output>
</section>

{#snippet customTrigger()}<button type="button">Custom color button</button>{/snippet}
{#snippet customPanel(original: Snippet, extra: { components: { Picker: Snippet; Presets: Snippet; }; })}
  <div class="custom-color-panel"><p>Custom picker panel</p>
    {#if repeat}
      <div style="width:234px">{@render extra.components.Picker()}</div>
      <div style="width:234px">{@render extra.components.Picker()}</div>
    {:else}{@render extra.components.Picker()}{@render extra.components.Presets()}{/if}
  </div>
{/snippet}
