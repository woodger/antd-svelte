<script lang="ts">
  import {
    ConfigProvider,
    Modal,
    Drawer,
    Tour,
    type TourProps,
    type TourStepProps,
    type TourPlacement
  } from 'antd-svelte';

  let open = $state<boolean | undefined>(false);
  let current = $state<number | undefined>(0);
  let controlledOpen = $state(true);
  let controlledCurrent = $state(false);
  let defaultOpen = $state(false);
  let defaultCurrent = $state(0);
  let accept = $state(true);
  let mounted = $state(true);
  let count = $state(3);
  let mode = $state('target');
  let placement = $state<TourPlacement>('bottom');
  let pointAtCenter = $state(false);
  let arrow = $state(true);
  let mask = $state(true);
  let disabledInteraction = $state(false);
  let closable = $state(true);
  let keyboard = $state(true);
  let primary = $state(false);
  let dark = $state(false);
  let compact = $state(false);
  let semantic = $state(false);
  let stepSemantic = $state(false);
  let stepCallbacks = $state(false);
  let custom = $state(false);
  let customPanel = $state(false);
  let fallbackPanel = $state(false);
  let duplicate = $state(false);
  let customIcon = $state(false);
  let cover = $state(false);
  let zero = $state(false);
  let locale = $state(false);
  let localeAlias = $state(false);
  let container = $state('body');
  let gapX = $state(6);
  let gapY = $state(6);
  let radius = $state(2);
  let rootScroll = $state('default');
  let stepScroll = $state('default');
  let events = $state<string[]>([]);
  let hits = $state(0);
  let first = $state<HTMLButtonElement>();
  let second = $state<HTMLButtonElement>();
  let third = $state<HTMLButtonElement>();
  let customContainer = $state<HTMLDivElement>();
  let modalOpen = $state(false);
  let modalTour = $state(false);
  let modalTarget = $state<HTMLButtonElement>();
  let drawerOpen = $state(false);
  let drawerTour = $state(false);
  let drawerTarget = $state<HTMLButtonElement>();

  function record(value: string) {
    events = [...events, value];
  }

  function scroll(value: string): boolean | ScrollIntoViewOptions | undefined {
    return value === 'default' ? undefined : value === 'false' ? false : { block: 'end' };
  }

  const placements: TourPlacement[] = [
    'center', 'top', 'bottom', 'left', 'right', 'topLeft', 'topRight', 'bottomLeft',
    'bottomRight', 'leftTop', 'leftBottom', 'rightTop', 'rightBottom'
  ];
  const customParent = () => customContainer!;
  let steps = $derived<TourStepProps[]>(Array.from({ length: count }, (_, index) => ({
    title: zero ? 0 : `Tour step ${index + 1}`,
    description,
    target: mode === 'center' ? null : () => [first, second, third][index],
    cover: cover ? image : undefined,
    scrollIntoViewOptions: scroll(stepScroll),
    nextButtonProps: {
      children: custom ? index === count - 1 ? 'Complete custom' : 'Forward custom' : undefined,
      onClick: event => record(`next:${event.ctrlKey}:${event.currentTarget.tagName}`),
      class: custom ? 'custom-next' : undefined,
      style: custom ? 'background:rgb(69,69,255)' : undefined
    },
    prevButtonProps: { onClick: () => record('previous') },
    ...(stepSemantic ? {
      classNames: { title: 'step-title', section: 'step-section' },
      styles: { title: 'color:rgb(80,0,80)' }
    } : {}),
    ...(stepCallbacks ? {
      onClose: () => record('step-close'),
      onFinish: () => record('step-finish')
    } : {}),
    ...(customPanel ? { renderPanel: panel } : {}),
    ...(fallbackPanel ? { renderPanel: undefined } : {})
  })));
  let options = $derived<TourProps>({
    steps,
    open: controlledOpen ? open : undefined,
    current: controlledCurrent ? current : undefined,
    defaultOpen,
    defaultCurrent,
    onClose: index => {
      record(`close:${index}`);
      if (accept) open = false;
    },
    onChange: index => {
      record(`change:${index}`);
      if (accept) current = index;
    },
    onFinish: () => record('finish'),
    onPopupAlign: (_node, align) => {
      if (align.points?.length) record(`align:${align.points.join('/')}`);
    },
    placement,
    arrow: arrow ? pointAtCenter ? { pointAtCenter: true } : true : false,
    mask,
    closable,
    closeIcon: customIcon ? icon : undefined,
    keyboard,
    disabledInteraction,
    type: primary ? 'primary' : 'default',
    gap: { offset: [gapX, gapY], radius },
    getPopupContainer: container === 'inline' ? false : container === 'custom' ? customParent : undefined,
    scrollIntoViewOptions: scroll(rootScroll),
    indicatorsRender: custom ? indicators : undefined,
    actionsRender: custom ? actions : undefined,
    classNames: semantic ? { root: 'local-root', title: 'local-title', mask: 'local-mask' } : undefined,
    styles: semantic ? { root: 'color:rgb(0,0,90)', mask: 'color:rgb(0,80,0)',
      title: 'font-size:20px' } : undefined,
    style: semantic ? 'color:rgb(90,0,0)' : undefined,
    rootClassName: 'tour-root-class',
    class: 'tour-local-class'
  });
</script>

{#snippet description()}
  <span>Tour description</span><label>Tour editable<input value="Draft" /></label>
{/snippet}
{#snippet image()}
  <img alt="Tour cover" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='20'%3E%3Crect width='80' height='20' fill='%231677ff'/%3E%3C/svg%3E" />
{/snippet}
{#snippet icon()}<b>Exit</b>{/snippet}
{#snippet indicators(index: number, total: number)}<b class="custom-indicators">{index + 1}/{total}</b>{/snippet}
{#snippet actions(original: import('svelte').Snippet, info: { current: number; total: number; })}
  <button type="button" onclick={() => {
    open = false;
    record('skip');
  }}>Skip {info.current + 1}</button>{@render original()}
{/snippet}
{#snippet panel(info: import('antd-svelte').TourPanelInfo, index: number)}
  <div class="custom-panel">Custom panel {index + 1}<button type="button" onclick={info.onNext}>Custom next</button></div>
{/snippet}

<style>
  .controls { display: flex; flex-wrap: wrap; gap: 4px 16px; }
  .scene { position: relative; width: 1100px; height: 560px; background: var(--ant-color-bg-layout); }
  .first { position: absolute; left: 400px; top: 120px; }
  .second { position: absolute; left: 100px; top: 260px; }
  .third { position: absolute; right: 16px; bottom: 28px; }
  .portal-container { position: relative; }
  .events { display: block; height: 24px; overflow: auto; white-space: nowrap; }
</style>

<section id="tour-fixture">
  <div class="controls">
    <label><input type="checkbox" bind:checked={controlledOpen} /> Tour controlled open</label>
    <label><input type="checkbox" bind:checked={controlledCurrent} /> Tour controlled current</label>
    <label><input type="checkbox" bind:checked={defaultOpen} /> Tour default open</label>
    <label><input type="checkbox" bind:checked={accept} /> Accept Tour changes</label>
    <label><input type="checkbox" bind:checked={mounted} /> Mount Tour</label>
    <label><input type="checkbox" bind:checked={pointAtCenter} /> Tour arrow center</label>
    <label><input type="checkbox" bind:checked={arrow} /> Tour arrow</label>
    <label><input type="checkbox" bind:checked={mask} /> Tour mask</label>
    <label><input type="checkbox" bind:checked={disabledInteraction} /> Tour disabled interaction</label>
    <label><input type="checkbox" bind:checked={closable} /> Tour closable</label>
    <label><input type="checkbox" bind:checked={keyboard} /> Tour keyboard</label>
    <label><input type="checkbox" bind:checked={primary} /> Tour primary</label>
    <label><input type="checkbox" bind:checked={dark} /> Tour dark</label>
    <label><input type="checkbox" bind:checked={compact} /> Tour compact</label>
    <label><input type="checkbox" bind:checked={semantic} /> Tour semantic</label>
    <label><input type="checkbox" bind:checked={stepSemantic} /> Tour step semantic</label>
    <label><input type="checkbox" bind:checked={stepCallbacks} /> Tour step callbacks</label>
    <label><input type="checkbox" bind:checked={custom} /> Tour custom renderers</label>
    <label><input type="checkbox" bind:checked={customPanel} /> Tour custom panel</label>
    <label><input type="checkbox" bind:checked={fallbackPanel} /> Tour fallback panel</label>
    <label><input type="checkbox" bind:checked={duplicate} /> Tour duplicate</label>
    <label><input type="checkbox" bind:checked={customIcon} /> Tour custom close icon</label>
    <label><input type="checkbox" bind:checked={cover} /> Tour cover</label>
    <label><input type="checkbox" bind:checked={zero} /> Tour zero title</label>
    <label><input type="checkbox" bind:checked={locale} /> Tour custom locale</label>
    <label><input type="checkbox" bind:checked={localeAlias} /> Tour source locale alias</label>
    <label>Tour placement<select bind:value={placement}>{#each placements as item}<option>{item}</option>{/each}</select></label>
    <label>Tour target<select bind:value={mode}><option>target</option><option>center</option></select></label>
    <label>Tour container<select bind:value={container}><option>body</option><option>inline</option><option>custom</option></select></label>
    <label>Tour root scroll<select bind:value={rootScroll}><option>default</option><option>false</option><option>end</option></select></label>
    <label>Tour step scroll<select bind:value={stepScroll}><option>default</option><option>false</option><option>end</option></select></label>
    <label>Tour count<input type="number" bind:value={count} /></label>
    <label>Tour default current<input type="number" bind:value={defaultCurrent} /></label>
    <label>Tour gap X<input type="number" bind:value={gapX} /></label>
    <label>Tour gap Y<input type="number" bind:value={gapY} /></label>
    <label>Tour radius<input type="number" bind:value={radius} /></label>
  </div>
  <button type="button" onclick={() => { open = true; }}>Open Tour owner</button>
  <button type="button" onclick={() => { open = false; }}>Close Tour owner</button>
  <button type="button" onclick={() => { open = undefined; }}>Release Tour owner open</button>
  <button type="button" onclick={() => { current = 2; }}>Set Tour owner current</button>
  <button type="button" onclick={() => { current = undefined; }}>Release Tour owner current</button>
  <button type="button" onclick={() => { events = []; }}>Clear Tour events</button>
  <output class="events" aria-label="Tour events">{events.join('|')}</output>
  <output aria-label="Tour target hits">{hits}</output>
  <ConfigProvider theme={{ mode: dark ? 'dark' : 'light', compact }}
    locale={{ tour: locale ? { Next: 'Continue', Previous: 'Back', Finish: 'Done' } : undefined,
      Tour: localeAlias ? { Next: 'Source next' } : undefined }}
    tour={semantic ? {
      class: 'provider-tour', style: 'color:pink',
      classNames: ({ props }) => ({ root: props.type === 'primary' ? 'provider-primary' : 'provider-default',
        title: 'provider-title', mask: 'provider-mask' }),
      styles: { root: 'color:red', mask: 'color:orange', title: 'font-size:18px' }
    } : undefined}>
    <div class="scene">
      <button bind:this={first} class="first" type="button" onclick={() => { hits++; }}>Tour first target</button>
      <button bind:this={second} class="second" type="button" onclick={() => { hits++; }}>Tour second target</button>
      <button bind:this={third} class="third" type="button" onclick={() => { hits++; }}>Tour third target</button>
      <div class="portal-container" bind:this={customContainer}></div>
      {#if mounted}<Tour {...options} />{/if}
      {#if duplicate}
        <Tour open={open} onClose={() => {
          duplicate = false;
          record('duplicate-close');
        }} steps={[{ title: 'Duplicate Tour', target: () => first }]} />
      {/if}
    </div>
  </ConfigProvider>
  <button type="button" onclick={() => { modalOpen = true; }}>Open Tour modal</button>
  <Modal bind:open={modalOpen} title="Tour modal">
    <button type="button" bind:this={modalTarget} onclick={() => { modalTour = true; }}>Start modal Tour</button>
    <Tour open={modalTour} onClose={() => { modalTour = false; }}
      steps={[{ title: 'Modal tour title', description: 'Modal tour description', target: () => modalTarget }]} />
  </Modal>
  <button type="button" onclick={() => { drawerOpen = true; }}>Open Tour drawer</button>
  <Drawer bind:open={drawerOpen} title="Tour drawer">
    <button type="button" bind:this={drawerTarget} onclick={() => { drawerTour = true; }}>
      Start drawer Tour
    </button>
    <Tour open={drawerTour} onClose={() => { drawerTour = false; }}
      steps={[{ title: 'Drawer tour title', target: () => drawerTarget }]} />
  </Drawer>
</section>
