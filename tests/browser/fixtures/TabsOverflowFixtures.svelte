<script lang="ts">
  import type { Snippet } from 'svelte';
  import {
    ConfigProvider,
    Select,
    Tabs,
    type ComponentSize,
    type TabsItem,
    type TabsMorePlacement,
    type TabsMoreProps,
    type TabsMoreRenderInfo,
    type TabsPlacement,
    type TabsType
  } from 'antd-svelte';

  let type = $state<TabsType>('line');
  let placement = $state<TabsPlacement>('top');
  let size = $state<ComponentSize>('middle');
  let width = $state(360);
  let rtl = $state(false);
  let dark = $state(false);
  let compact = $state(false);
  let mounted = $state(true);
  let count = $state(10);
  let gutter = $state<number | undefined>();
  let hideAdd = $state(false);
  let trigger = $state('hover');
  let popupPlacement = $state<TabsMorePlacement>('bottomLeft');
  let icon = $state('default');
  let rootIcon = $state(false);
  let custom = $state(false);
  let controlled = $state(false);
  let acceptVisibility = $state(true);
  let controlledVisible = $state(false);
  let acceptEdits = $state(false);
  let cancelSelection = $state(false);
  let ownerFocus = $state(false);
  let portal = $state(false);
  let styled = $state(false);
  let localized = $state(false);
  let autoFocus = $state(false);
  let nested = $state(false);
  let outerKey = $state('inner');
  let current = $state<string | undefined>('');
  let removed = $state<string[]>([]);
  let changes = $state<string[]>([]);
  let clicks = $state<{ key: string; type: string; mouse: boolean; }[]>([]);
  let edits = $state<{ action: 'add' | 'remove'; key?: string; }[]>([]);
  let visibility = $state<boolean[]>([]);
  let submissions = $state(0);
  let overlayClicks = $state(0);
  let popupFocuses = $state(0);
  let items = $derived(Array.from({ length: count }, (_, index): TabsItem => ({
    key: index === 0 ? '' : String(index),
    label: `Tab ${index + 1}`,
    disabled: index === 1,
    closable: index === 2 ? false : undefined,
    children: index === 0 ? draft : undefined
  })).filter(item => !removed.includes(item.key)));
  let more = $derived.by(() => {
    const props: TabsMoreProps = {
      trigger: trigger === 'none' ? [] : trigger as 'hover' | 'click' | 'focus' | 'contextMenu',
      placement: popupPlacement,
      autoFocus
    };
    props.onOverlayClick = () => overlayClicks++;
    if (icon !== 'default') props.icon = icon === 'null' ? null : icon === 'false' ? false
      : icon === 'true' ? true : icon === 'zero' ? 0 : icon === 'empty' ? ''
        : icon === 'undefined' ? undefined : 'More tabs';
    if (custom) props.popupRender = customPopup;
    if (controlled) {
      props.visible = controlledVisible;
      props.onVisibleChange = next => {
        visibility = [...visibility, next];
        if (acceptVisibility) controlledVisible = next;
      };
    }
    if (portal) props.getPopupContainer = () => document.getElementById('tabs-more-container')!;
    if (styled) {
      props.overlayClassName = 'tabs-more-custom';
      props.overlayStyle = 'background:rgb(1,2,3);--ant-color-text:rgb(20,40,60)';
    }
    return props;
  });

  function edit(target: MouseEvent | KeyboardEvent | string, action: 'add' | 'remove') {
    edits = [...edits, { action, ...typeof target === 'string' ? { key: target } : {} }];
    if (acceptEdits && action === 'remove' && typeof target === 'string')
      removed = [...removed, target];
    if (ownerFocus) document.getElementById('tabs-more-outside')?.focus();
  }
</script>

<style>
  label { display: block; }
  .stage { max-width: 100%; }
</style>

{#snippet draft()}<input name="draft" aria-label="Overflow tab draft" value="Alpha draft" />{/snippet}
{#snippet customPopup(menu: Snippet, info: TabsMoreRenderInfo)}
  <section aria-label="Custom Tabs popup">
    <output aria-label="Custom hidden keys">{JSON.stringify(info.restTabs.map(item => item.key))}</output>
    {@render menu()}
    <input aria-label="Tabs custom popup draft" onfocus={() => popupFocuses++} />
    <Select aria-label="More nested Select" options={[
      { value: 'a', label: 'Alpha option' },
      { value: 'b', label: 'Beta option' }
    ]} />
    <button type="button" onclick={info.onClose}>Close custom Tabs popup</button>
  </section>
{/snippet}
{#snippet tabs()}
  <Tabs id="tabs-overflow-main" aria-label="Overflow sections" {items} {type} {size} {more}
    bind:activeKey={current} tabPlacement={placement} tabBarGutter={gutter} {hideAdd}
    moreIcon={rootIcon ? 'ROOT' : undefined} style="height:288px"
    locale={localized ? { dropdownAriaLabel: 'Hidden sections', removeAriaLabel: 'Close section' } : undefined}
    onChange={key => changes = [...changes, key]} onEdit={edit}
    onTabClick={(key, event) => {
      clicks = [...clicks, { key, type: event.type, mouse: event instanceof MouseEvent }];
      if (cancelSelection) event.preventDefault();
      if (ownerFocus) document.getElementById('tabs-more-outside')?.focus();
    }} />
{/snippet}
<section id="tabs-overflow-fixture">
  <h2>Tabs overflow</h2>
  <label>Overflow type <select aria-label="Overflow type" bind:value={type}>
    {#each ['line', 'card', 'editable-card'] as value}<option>{value}</option>{/each}
  </select></label>
  <label>Overflow placement <select aria-label="Overflow placement" bind:value={placement}>
    {#each ['top', 'bottom', 'start', 'end'] as value}<option>{value}</option>{/each}
  </select></label>
  <label>Overflow size <select aria-label="Overflow size" bind:value={size}>
    {#each ['middle', 'small', 'large'] as value}<option>{value}</option>{/each}
  </select></label>
  <label>Overflow width <input type="number" bind:value={width} /></label>
  <label>Overflow count <input type="number" bind:value={count} /></label>
  <label>Overflow gap <input type="number" step="any" bind:value={gutter} /></label>
  <label>More trigger <select aria-label="More trigger" bind:value={trigger}>
    {#each ['hover', 'click', 'focus', 'contextMenu', 'none'] as value}<option>{value}</option>{/each}
  </select></label>
  <label>More placement <select aria-label="More placement" bind:value={popupPlacement}>
    {#each ['bottomLeft', 'bottom', 'bottomRight', 'topLeft', 'top', 'topRight'] as value}<option>{value}</option>{/each}
  </select></label>
  <label>More icon <select aria-label="More icon" bind:value={icon}>
    {#each ['default', 'undefined', 'null', 'false', 'true', 'zero', 'empty', 'text'] as value}<option>{value}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={rootIcon} /> Root More icon</label>
  <label><input type="checkbox" bind:checked={rtl} /> RTL overflow</label>
  <label><input type="checkbox" bind:checked={dark} /> Dark overflow</label>
  <label><input type="checkbox" bind:checked={compact} /> Compact overflow</label>
  <label><input type="checkbox" bind:checked={mounted} /> Mount overflow</label>
  <label><input type="checkbox" bind:checked={hideAdd} /> Hide overflow add</label>
  <label><input type="checkbox" bind:checked={custom} /> Custom More popup</label>
  <label><input type="checkbox" bind:checked={controlled} /> Control More visibility</label>
  <label><input type="checkbox" bind:checked={acceptVisibility} /> Accept More visibility</label>
  <label><input type="checkbox" bind:checked={controlledVisible} /> More controlled visible</label>
  <label><input type="checkbox" bind:checked={acceptEdits} /> Accept overflow edits</label>
  <label><input type="checkbox" bind:checked={cancelSelection} /> Cancel overflow selection</label>
  <label><input type="checkbox" bind:checked={ownerFocus} /> Owner overflow focus</label>
  <label><input type="checkbox" bind:checked={portal} /> Portal More popup</label>
  <label><input type="checkbox" bind:checked={styled} /> Styled More popup</label>
  <label><input type="checkbox" bind:checked={localized} /> Localized More popup</label>
  <label><input type="checkbox" bind:checked={autoFocus} /> Autofocus More popup</label>
  <label><input type="checkbox" bind:checked={nested} /> Nested overflow Tabs</label>
  <button type="button" onclick={() => outerKey = outerKey === 'inner' ? 'other' : 'inner'}>Switch outer Tabs</button>
  <input id="tabs-more-outside" aria-label="Overflow outside" />
  <div id="tabs-more-container"></div>
  <ConfigProvider direction={rtl ? 'rtl' : 'ltr'} theme={{ mode: dark ? 'dark' : 'light', compact }}>
    <form onsubmit={event => { event.preventDefault(); submissions++; }}>
      <div class="stage" style={`width:${width}px`}>
        {#if mounted}
          {#if nested}
            <Tabs id="tabs-overflow-outer" aria-label="Outer sections" bind:activeKey={outerKey}
              items={[
                { key: 'inner', label: 'Inner tabs', children: tabs },
                { key: 'other', label: 'Other panel' }
              ]} />
          {:else}{@render tabs()}{/if}
        {/if}
      </div>
    </form>
  </ConfigProvider>
  <output aria-label="Overflow changes">{JSON.stringify(changes)}</output>
  <output aria-label="Overflow clicks">{JSON.stringify(clicks)}</output>
  <output aria-label="Overflow edits">{JSON.stringify(edits)}</output>
  <output aria-label="Overflow visibility">{JSON.stringify(visibility)}</output>
  <output aria-label="Overflow submissions">{submissions}</output>
  <output aria-label="Overflow overlay clicks">{overlayClicks}</output>
  <output aria-label="Overflow popup focuses">{popupFocuses}</output>
</section>
