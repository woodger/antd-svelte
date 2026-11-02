<script lang="ts">
  import {
    Menu,
    ConfigProvider,
    type MenuItemType,
    type MenuMode,
    type MenuTheme,
    type ThemeConfig
  } from 'antd-svelte';
  import { menuThemePresets } from './menu-theme-presets';

  let preset = $state('default');
  let enabled = $state(true);
  let mounted = $state(true);
  let hashed = $state(true);
  let compact = $state(false);
  let color = $state('');
  let parentAliases = $state(false);
  let mode = $state<MenuMode>('vertical');
  let appearance = $state<MenuTheme>('light');
  let selected = $state(['selected', 'leaf']);
  let opened = $state<string[]>([]);
  let events = $state<string[]>([]);
  let rootOverride = $state(false);
  const modes = ['inline', 'vertical', 'horizontal', 'collapsed'] as const;
  const appearances = ['light', 'dark'] as const;
  const items: MenuItemType[] = [
    { key: 'selected', label: 'Selected', class: 'sample-selected' },
    { key: 'normal', label: 'Normal', class: 'sample-normal', icon },
    { key: 'disabled', label: 'Disabled', disabled: true, class: 'sample-disabled' },
    { key: 'danger', label: 'Danger', danger: true, class: 'sample-danger' },
    {
      key: 'parent',
      label: 'Parent',
      class: 'sample-parent',
      children: [
        { key: 'leaf', label: 'Leaf', class: 'sample-leaf' },
        {
          type: 'group',
          key: 'group',
          label: 'Group',
          children: [{ key: 'group-leaf', label: 'Grouped' }]
        },
        { type: 'divider', key: 'divider', dashed: true },
        { key: 'child', label: 'Child', class: 'sample-child' }
      ]
    }
  ];
  let config = $derived<ThemeConfig>({
    ...menuThemePresets[preset],
    cssVar: { ...menuThemePresets[preset].cssVar, key: 'menu-source-scope' },
    hashed,
    components: color ? {
      ...menuThemePresets[preset].components,
      Menu: { ...menuThemePresets[preset].components?.Menu, itemSelectedBg: color }
    } : menuThemePresets[preset].components
  });
</script>

<style>
  .samples { margin-block:24px; }
  .sample-row { width:320px; }
  .wide { width:1100px; }
</style>

{#snippet icon()}★{/snippet}
<section id="menu-theme-fixture">
  <h2>Source Menu tokens</h2>
  <label>Menu token preset <select bind:value={preset} aria-label="Menu token preset">
    {#each Object.keys(menuThemePresets) as name}<option value={name}>{name}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={enabled} /> Apply source Menu tokens</label>
  <label><input type="checkbox" bind:checked={mounted} /> Mount themed Menu</label>
  <label><input type="checkbox" bind:checked={hashed} /> Hash themed Menu</label>
  <label><input type="checkbox" bind:checked={compact} /> Native compact Menu</label>
  <label><input type="checkbox" bind:checked={parentAliases} /> Parent Menu aliases</label>
  <label><input type="checkbox" bind:checked={rootOverride} /> Override Menu root variables</label>
  <label>Menu selected background <input bind:value={color} /></label>
  <label>Themed Menu mode <select bind:value={mode} aria-label="Themed Menu mode">
    <option value="vertical">vertical</option><option value="inline">inline</option>
    <option value="horizontal">horizontal</option>
  </select></label>
  <label>Themed Menu appearance <select bind:value={appearance} aria-label="Themed Menu appearance">
    <option value="light">light</option><option value="dark">dark</option>
  </select></label>
  <button type="button" onclick={() => { opened = ['parent']; }}>Open themed Menu popup</button>
  {#if mounted}
    <ConfigProvider theme={enabled ? config : { compact }}>
      <div class="samples" style={parentAliases ? '--ant-font-size:30px;--ant-color-text:red' : undefined}>
        {#each modes as mode}
          {#each appearances as appearance}
            <div class={['sample-row', mode === 'horizontal' && 'wide']}>
              <Menu {items} theme={appearance} mode={mode === 'collapsed' ? 'inline' : mode}
                inlineCollapsed={mode === 'collapsed'} selectedKeys={['selected', 'leaf']} multiple
                openKeys={mode === 'inline' ? ['parent'] : []} forceSubMenuRender
                triggerSubMenuAction="click" class={`menu-token-${mode}-${appearance}`}
                aria-label={`Themed ${mode} ${appearance}`} />
            </div>
          {/each}
        {/each}
        <Menu {items} {mode} theme={appearance} selectedKeys={selected} openKeys={opened} multiple
          class="menu-token-main" aria-label="Controlled themed Menu" triggerSubMenuAction="click"
          style={rootOverride ? 'width:260px;--ant-menu-item-selected-bg:#ffddee' : 'width:260px'}
          onOpenChange={next => { opened = next; }}
          onSelect={info => {
            selected = info.selectedKeys;
            events = [...events, `select:${info.key}`];
          }}
          onDeselect={info => {
            selected = info.selectedKeys;
            events = [...events, `deselect:${info.key}`];
          }} />
      </div>
    </ConfigProvider>
  {/if}
  <output aria-label="Menu theme selected">{JSON.stringify(selected)}</output>
  <output aria-label="Menu theme opened">{JSON.stringify(opened)}</output>
  <output aria-label="Menu theme events">{JSON.stringify(events)}</output>
</section>
