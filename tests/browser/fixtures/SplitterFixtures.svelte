<script lang="ts">
  import { ConfigProvider, Splitter, type SplitterPanelProps } from 'antd-svelte';

  type Event = { event: string; sizes?: number[]; collapsed?: boolean[]; index?: number; };
  let preset = $state('half');
  let generation = $state(0);
  let mode = $state('local');
  let sizes = $state([300, 300]);
  let constraints = $state('none');
  let orientation = $state<'horizontal' | 'vertical'>('horizontal');
  let lazy = $state(false);
  let collapse = $state('always');
  let motion = $state(false);
  let destroy = $state(false);
  let retainFirst = $state(false);
  let resizable = $state(true);
  let icons = $state('default');
  let dark = $state(false);
  let styled = $state(false);
  let nested = $state(false);
  let mounted = $state(true);
  let hidden = $state(false);
  let extent = $state(600);
  let alternateDefaults = $state(false);
  let nativeElement = $state<HTMLDivElement>();
  let events = $state<Event[]>([]);
  let items = $derived.by((): SplitterPanelProps[] => {
    const defaults = preset === 'three' ? [100, 200, undefined]
      : preset === 'overlap' ? [300, 0, 300]
        : preset === 'uneven' ? [200, undefined]
          : preset === 'hidden' ? [0, undefined] : ['50%', '50%'];
    const content = [first, second, third];

    return defaults.map((defaultSize, index) => ({
      children: content[index],
      defaultSize: alternateDefaults ? 999 : defaultSize,
      size: mode === 'local' || mode === 'first' && index > 0 ? undefined : sizes[index],
      min: constraints === 'limited' ? index === 0 ? 120 : 60
        : constraints === 'changed' ? index === 0 ? 200 : 360 : undefined,
      max: constraints === 'limited' ? index === 0 ? '70%' : '80%'
        : constraints === 'changed' ? index === 0 ? 240 : 400 : undefined,
      resizable: index === 0 ? resizable : true,
      collapsible: collapse === 'off' ? false : {
        start: true,
        end: collapse !== 'directional',
        showCollapsibleIcon: collapse === 'always' ? true : collapse === 'hidden' ? false : 'auto'
      },
      destroyOnHidden: index === 0 && retainFirst ? false : undefined,
      class: `splitter-item-${index}`,
      style: styled ? 'outline-offset:3px;flex-basis:99px;flex-grow:99' : undefined
    }));
  });

  function choosePreset(value: string) {
    preset = value;
    sizes = value === 'three' ? [100, 200, 300]
      : value === 'overlap' ? [300, 0, 300]
        : value === 'uneven' ? [200, 400] : value === 'hidden' ? [0, 600] : [300, 300];
    events = [];
    generation++;
  }

  function record(event: string, value: number[]) {
    events.push({ event, sizes: [...value] });

    if (mode === 'controlled' || mode === 'first')
      sizes = [...value];
  }
</script>

<style>
  .controls { display: flex; flex-wrap: wrap; gap: 8px; margin-block: 12px; }
  .holder { max-width: 100%; margin-block: 16px; }
  .content { padding: 8px; }
  .content input { box-sizing: border-box; max-width: 100%; }
  output { display: block; overflow-wrap: anywhere; }
</style>

{#snippet first()}<div class="content">
  <label>Splitter first draft<input aria-label="Splitter first draft" /></label>
  <button type="button" onclick={() => events.push({ event: 'action' })}>Splitter content action</button>
</div>{/snippet}
{#snippet second()}<div class="content">
  <label>Splitter second draft<input aria-label="Splitter second draft" /></label>
</div>{/snippet}
{#snippet third()}<div class="content">Splitter third content</div>{/snippet}
{#snippet handle()}<span data-icon="dragger">Drag</span>{/snippet}
{#snippet arrow()}<span data-icon="collapse">Collapse</span>{/snippet}
{#snippet legacy()}<span data-icon="legacy">Legacy</span>{/snippet}

<section id="splitter-fixture">
  <h2>Splitter</h2>
  <div class="controls">
    <label>Splitter preset<select value={preset} onchange={event => choosePreset(event.currentTarget.value)}>
      <option value="half">Splitter halves</option><option value="uneven">Splitter uneven</option>
      <option value="three">Splitter three</option><option value="overlap">Splitter overlapping bars</option>
      <option value="hidden">Splitter initial hidden</option>
    </select></label>
    <label>Splitter state<select bind:value={mode}>
      <option value="local">Splitter local</option><option value="controlled">Splitter controlled</option>
      <option value="rejected">Splitter rejected</option><option value="first">Splitter first controlled</option>
    </select></label>
    <label>Splitter limits<select bind:value={constraints}>
      <option value="none">Splitter no limits</option><option value="limited">Splitter limited</option>
      <option value="changed">Splitter changed limits</option>
    </select></label>
    <label>Splitter orientation<select bind:value={orientation}>
      <option value="horizontal">Splitter horizontal</option><option value="vertical">Splitter vertical</option>
    </select></label>
    <label>Splitter collapse visibility<select bind:value={collapse}>
      <option value="always">Splitter always visible</option><option value="auto">Splitter hover visible</option>
      <option value="hidden">Splitter always hidden</option><option value="directional">Splitter directional</option>
      <option value="off">Splitter no collapse</option>
    </select></label>
    <label>Splitter icons<select bind:value={icons}>
      <option value="default">Splitter default icons</option><option value="custom">Splitter custom icons</option>
      <option value="empty">Splitter empty icons</option><option value="legacy">Splitter legacy icons</option>
      <option value="empty-new">Splitter empty new icon object</option>
    </select></label>
    <label><input type="checkbox" bind:checked={lazy} /> Lazy Splitter</label>
    <label><input type="checkbox" bind:checked={motion} /> Animated Splitter collapse</label>
    <label><input type="checkbox" bind:checked={destroy} /> Destroy Splitter hidden content</label>
    <label><input type="checkbox" bind:checked={retainFirst} /> Retain Splitter first content</label>
    <label><input type="checkbox" bind:checked={resizable} /> Resizable Splitter</label>
    <label><input type="checkbox" bind:checked={dark} /> Dark Splitter</label>
    <label><input type="checkbox" bind:checked={styled} /> Styled Splitter</label>
    <label><input type="checkbox" bind:checked={nested} /> Replace Splitter config</label>
    <label><input type="checkbox" bind:checked={mounted} /> Mount Splitter</label>
    <label><input type="checkbox" bind:checked={hidden} /> Hide Splitter root</label>
    <label><input type="checkbox" bind:checked={alternateDefaults} /> Change Splitter defaults</label>
    <button type="button" onclick={() => { extent = extent === 600 ? 480 : 600; }}>Resize Splitter root</button>
    <button type="button" onclick={() => { events = []; }}>Clear Splitter events</button>
  </div>
  <ConfigProvider
    theme={{ mode: dark ? 'dark' : 'light', primary: 'purple' }}
    splitter={{
      class: 'splitter-context',
      style: 'outline-offset:4px',
      classNames: ({ props }) => ({
        root: `context-${props.orientation}`,
        panel: 'context-panel',
        dragger: { default: 'context-dragger', active: 'context-dragger-active' }
      }),
      styles: {
        root: 'outline-offset:2px',
        panel: 'outline-offset:1px',
        dragger: { default: 'outline-offset:2px', active: 'outline-offset:99px' }
      }
    }}
  >
    <ConfigProvider splitter={nested ? { class: 'nested-splitter-context' } : undefined}>
      <form onsubmit={event => {
        event.preventDefault();
        events.push({ event: 'submit' });
      }}>
        <div class="holder" style={`width:${extent}px;height:${extent}px;${hidden ? 'display:none' : ''}`}>
          {#if mounted}{#key generation}<Splitter
            {items}
            {orientation}
            {lazy}
            destroyOnHidden={destroy}
            collapsible={{
              motion,
              icon: icons === 'custom' ? { start: arrow, end: false }
                : icons === 'empty' ? { start: null, end: false }
                  : icons === 'empty-new' ? {} : undefined
            }}
            draggerIcon={icons === 'custom' ? handle : icons === 'empty' ? null : undefined}
            collapsibleIcon={icons === 'legacy' || icons === 'empty-new' ? { start: legacy } : undefined}
            onResizeStart={value => events.push({ event: 'start', sizes: [...value] })}
            onResize={value => record('resize', value)}
            onResizeEnd={value => record('end', value)}
            onCollapse={(collapsed, value) => events.push({ event: 'collapse', collapsed, sizes: [...value] })}
            onDraggerDoubleClick={index => events.push({ event: 'double', index })}
            class="fixture-splitter"
            rootClassName="splitter-owner"
            classNames={({ props }) => ({
              root: `local-${props.orientation}`,
              panel: 'local-panel',
              dragger: { default: 'local-dragger', active: 'local-dragger-active' }
            })}
            styles={styled ? {
              root: 'outline-offset:6px',
              panel: 'outline-offset:2px',
              dragger: { default: 'outline-offset:4px', active: 'outline-offset:88px' }
            } : undefined}
            style={`width:100%;height:100%;${styled ? 'outline-offset:8px' : ''}`}
            bind:nativeElement
          />{/key}{/if}
        </div>
      </form>
    </ConfigProvider>
  </ConfigProvider>
  <output aria-label="Splitter ref">{nativeElement?.tagName ?? 'none'}</output>
  <output aria-label="Splitter events">{JSON.stringify(events)}</output>
</section>
