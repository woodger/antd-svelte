<script lang="ts">
  import { Breadcrumb, ConfigProvider, type BreadcrumbItem, type ThemeConfig } from 'antd-svelte';
  import { breadcrumbThemePresets } from './breadcrumb-theme-presets';

  let preset = $state('default');
  let enabled = $state(true);
  let mounted = $state(true);
  let hashed = $state(true);
  let compact = $state(false);
  let rtl = $state(false);
  let parentAliases = $state(false);
  let overrideStyles = $state(false);
  let arrowKind = $state('default');
  let richTitle = $state(false);
  let menuAtEnd = $state(false);
  let narrow = $state(false);
  let color = $state('');
  let events = $state<string[]>([]);
  let items = $derived<BreadcrumbItem[]>([
    {
      key: 'home',
      href: '#breadcrumb-theme-home',
      title: iconTitle,
      onClick: () => { events = [...events, 'home']; }
    },
    {
      key: 'section',
      href: '#breadcrumb-theme-section',
      title: richTitle ? menuTitle : 'Section',
      onClick: () => { events = [...events, 'section']; },
      menu: {
        items: [
          { key: 'one', label: 'Menu One', path: '/one' },
          { key: 'disabled', label: 'Disabled', disabled: true }
        ],
        onClick: info => { events = [...events, `menu:${info.key}`]; }
      },
      dropdownProps: { trigger: 'click', open: true, 'aria-label': 'Themed Breadcrumb sections' }
    },
    ...menuAtEnd ? [] : [{ key: 'current', title: 'Current' }]
  ]);
  let arrowContent = $derived(arrowKind === 'svg' ? customArrowSvg
    : arrowKind === 'anticon' ? customArrowIcon : arrowKind === 'text' ? '*' : undefined);
  let config = $derived<ThemeConfig>({
    ...breadcrumbThemePresets[preset],
    cssVar: { ...breadcrumbThemePresets[preset].cssVar, key: 'breadcrumb-source-scope' },
    hashed,
    components: color ? {
      ...breadcrumbThemePresets[preset].components,
      Breadcrumb: { ...breadcrumbThemePresets[preset].components?.Breadcrumb, linkColor: color }
    } : breadcrumbThemePresets[preset].components
  });
</script>

<style>
  label { display: block; }
  .stage { padding: 300px 20px; width: 400px; }
</style>

{#snippet sampleSvg()}<svg width="1em" height="1em" viewBox="0 0 16 16" aria-hidden="true"><path d="M1 1L15 15" stroke="currentColor" /></svg>{/snippet}
{#snippet iconTitle()}<span class="anticon" aria-hidden="true">{@render sampleSvg()}</span><span>Home</span>{/snippet}
{#snippet bareTitle()}{@render sampleSvg()}<span>Bare</span>{/snippet}
{#snippet menuTitle()}<span class="anticon" aria-hidden="true">{@render sampleSvg()}</span><span data-menu-label>Section</span>{/snippet}
{#snippet customArrowSvg()}<svg data-arrow-reference width="1em" height="1em" viewBox="0 0 16 16" aria-hidden="true"><path d="M1 1L15 15" stroke="currentColor" /></svg>{/snippet}
{#snippet customArrowIcon()}<span class="anticon" data-arrow-reference aria-hidden="true">{@render sampleSvg()}</span>{/snippet}
<section id="breadcrumb-theme-fixture">
  <h2>Source Breadcrumb tokens</h2>
  <label>Breadcrumb token preset <select bind:value={preset} aria-label="Breadcrumb token preset">
    {#each Object.keys(breadcrumbThemePresets) as name}<option value={name}>{name}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={enabled} /> Apply source Breadcrumb tokens</label>
  <label><input type="checkbox" bind:checked={mounted} /> Mount themed Breadcrumb</label>
  <label><input type="checkbox" bind:checked={hashed} /> Hash themed Breadcrumb</label>
  <label><input type="checkbox" bind:checked={compact} /> Native compact Breadcrumb</label>
  <label><input type="checkbox" bind:checked={rtl} /> RTL themed Breadcrumb</label>
  <label><input type="checkbox" bind:checked={parentAliases} /> Parent Breadcrumb aliases</label>
  <label><input type="checkbox" bind:checked={overrideStyles} /> Override Breadcrumb token styles</label>
  <label><input type="checkbox" bind:checked={richTitle} /> Rich Breadcrumb menu title</label>
  <label><input type="checkbox" bind:checked={menuAtEnd} /> Breadcrumb menu at end</label>
  <label><input type="checkbox" bind:checked={narrow} /> Narrow themed Breadcrumb</label>
  <label>Breadcrumb arrow content <select bind:value={arrowKind} aria-label="Breadcrumb arrow content">
    <option value="default">default</option><option value="svg">svg</option>
    <option value="anticon">anticon</option><option value="text">text</option>
  </select></label>
  <label>Breadcrumb link color <input bind:value={color} /></label>
  {#if mounted}
    <ConfigProvider theme={enabled ? config : { compact }} direction={rtl ? 'rtl' : 'ltr'}>
      <div class="stage" style={parentAliases ? '--ant-font-size:30px;--ant-color-text:red' : undefined}
        style:width={narrow ? '160px' : undefined} style:padding-block={narrow ? '20px' : undefined}>
        <Breadcrumb {items} dropdownIcon={arrowContent} class="breadcrumb-token-main" aria-label="Themed Breadcrumb"
          styles={overrideStyles ? {
            root: '--ant-breadcrumb-separator-margin:21px',
            item: 'color:#00aa11'
          } : undefined}
          style={overrideStyles ? '--ant-breadcrumb-separator-margin:27px' : undefined} />
        <Breadcrumb class="breadcrumb-token-bare" items={[
          { href: '#bare', title: bareTitle }, { title: 'End' }
        ]} />
      </div>
    </ConfigProvider>
  {/if}
  <output aria-label="Breadcrumb theme events">{JSON.stringify(events)}</output>
  <div id="breadcrumb-theme-home">Home destination</div>
  <div id="breadcrumb-theme-section">Section destination</div>
  <div id="breadcrumb-theme-section/one">Menu destination</div>
</section>
