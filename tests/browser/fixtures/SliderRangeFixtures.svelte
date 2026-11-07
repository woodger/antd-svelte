<script lang="ts">
  import { Slider, ConfigProvider, type SliderRef, type SliderRangeConfig } from 'antd-svelte';
  let value = $state<number[] | null>([20, 80]);
  let ref = $state<SliderRef>();
  let mounted = $state(true);
  let editable = $state(false);
  let draggable = $state(false);
  let cross = $state(true);
  let push = $state(0);
  let vertical = $state(false);
  let reverse = $state(false);
  let marks = $state(false);
  let dots = $state(false);
  let markOnly = $state(false);
  let disableMiddle = $state(false);
  let tooltip = $state(false);
  let keyboard = $state(true);
  let cancelKeys = $state(false);
  let cancelPointer = $state(false);
  let dark = $state(false);
  let compact = $state(false);
  let primary = $state<'blue' | 'green' | 'purple'>('blue');
  let submissions = $state(0);
  let data = $state('');
  let events = $state<string[]>([]);
  let range = $derived<true | SliderRangeConfig>(editable
    ? { editable: true, minCount: 2, maxCount: 5 }
    : draggable ? { draggableTrack: true } : true);
  function record(name: string, next: number[]) {
    events = [...events, `${name}:${next.join(',')}`];
  }
</script>

<style>
  section { padding: 24px; }
  .controls { display: flex; flex-wrap: wrap; gap: 8px 16px; max-width: 700px; }
  label { display: block; }
  .frame { margin: 40px 24px; max-width: 100%; }
  output { display: block; min-height: 24px; }
</style>

<section id="slider-range-fixture" aria-label="Slider range fixture">
  <h2>Slider range</h2>
  <div class="controls">
    <label><input type="checkbox" bind:checked={mounted} /> Mount range</label>
    <label><input type="checkbox" bind:checked={editable} /> Editable range</label>
    <label><input type="checkbox" bind:checked={draggable} /> Draggable range track</label>
    <label><input type="checkbox" bind:checked={cross} /> Allow range cross</label>
    <label><input type="checkbox" bind:checked={vertical} /> Vertical range</label>
    <label><input type="checkbox" bind:checked={reverse} /> Reverse range</label>
    <label><input type="checkbox" bind:checked={marks} /> Range marks</label>
    <label><input type="checkbox" bind:checked={dots} /> Range dots</label>
    <label><input type="checkbox" bind:checked={markOnly} /> Mark-only range</label>
    <label><input type="checkbox" bind:checked={disableMiddle} /> Disable range middle</label>
    <label><input type="checkbox" bind:checked={tooltip} /> Range tooltips</label>
    <label><input type="checkbox" bind:checked={keyboard} /> Range keyboard</label>
    <label><input type="checkbox" bind:checked={cancelKeys} /> Cancel range keys</label>
    <label><input type="checkbox" bind:checked={cancelPointer} /> Cancel range pointer</label>
    <label><input type="checkbox" bind:checked={dark} /> Dark range</label>
    <label><input type="checkbox" bind:checked={compact} /> Compact range</label>
    <label>Range primary <select bind:value={primary}><option>blue</option><option>green</option><option>purple</option></select></label>
    <label>Range push gap <input type="number" bind:value={push} /></label>
  </div>
  <div>
    <button type="button" onclick={() => { value = [20, 50, 80]; }}>Use three range points</button>
    <button type="button" onclick={() => { value = []; }}>Clear range points</button>
    <button type="button" onclick={() => { value = [20, 80]; }}>Reset range owner</button>
    <button type="button" onclick={() => { events = []; }}>Clear range events</button>
    <button type="button" onclick={() => ref?.focus()}>Focus range ref</button>
    <button type="button" onclick={() => ref?.blur()}>Blur range ref</button>
  </div>
  <ConfigProvider theme={{ mode: dark ? 'dark' : 'light', compact, primary }}
    slider={{ class: 'configured-range', style: 'color:rgb(80,0,0)',
    classNames: { rail: 'configured-range-rail' } }}>
    <form id="range-form" onsubmit={event => {
      event.preventDefault();
      submissions++;
    }}>
      <div class="frame">
        {#if mounted}
          <Slider {range} bind:value bind:ref id="range-input" name="interval" step={markOnly ? null : 5}
            style={vertical ? 'height:240px;width:12px' : 'width:400px;max-width:calc(100% - 20px)'}
            orientation={vertical ? 'vertical' : 'horizontal'} {reverse} allowCross={cross}
            pushable={push || false} disabled={disableMiddle ? [false, true, false] : undefined}
            marks={marks ? { 0: 'Cold', 25: { label: 'Warm', style: 'color:red' }, 100: 'Hot' } : undefined}
            {dots} tooltip={tooltip ? { open: true, formatter: point => `${point}%` } : false}
            {keyboard} onkeydown={event => { if (cancelKeys) event.preventDefault(); }}
            onpointerdown={event => { if (cancelPointer) event.preventDefault(); }}
            ariaLabelForHandle={['Range start', 'Range middle', 'Range end']}
            onBeforeChange={next => record('before', next)} onChange={next => record('change', next)}
            onChangeComplete={next => record('complete', next)} />
        {/if}
      </div>
      <button type="submit">Submit range form</button>
      <button type="reset">Reset range form</button>
      <button type="button" onclick={event => {
        const form = event.currentTarget.form!;
        data = new FormData(form).getAll('interval').join(',');
      }}>Read range form</button>
    </form>
  </ConfigProvider>
  <output aria-label="Range value">{JSON.stringify(value)}</output>
  <output aria-label="Range events">{events.join('|')}</output>
  <output aria-label="Range submissions">{submissions}</output>
  <output aria-label="Range data">{data}</output>
</section>
