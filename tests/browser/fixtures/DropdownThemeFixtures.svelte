<script lang="ts">
  import { ConfigProvider, Dropdown, type DropdownPlacement, type ThemeConfig } from 'antd-svelte';
  import { dropdownThemePresets } from './dropdown-theme-presets';

  let preset = $state('default');
  let enabled = $state(true);
  let mounted = $state(true);
  let hashed = $state(true);
  let compact = $state(false);
  let open = $state(true);
  let arrow = $state(true);
  let placement = $state<DropdownPlacement>('bottomLeft');
  let background = $state('');
  let parentAliases = $state(false);
  let events = $state<string[]>([]);
  let changes = $state<boolean[]>([]);
  let clicks = $state(0);
  let config = $derived<ThemeConfig>({
    ...dropdownThemePresets[preset],
    cssVar: { ...dropdownThemePresets[preset].cssVar, key: 'dropdown-source-scope' },
    hashed,
    components: background ? {
      ...dropdownThemePresets[preset].components,
      Dropdown: { ...dropdownThemePresets[preset].components?.Dropdown, colorBgElevated: background }
    } : dropdownThemePresets[preset].components
  });
</script>

<style>
  label { display: block; }
  .stage { padding: 240px 20px; }
</style>

{#snippet icon()}★{/snippet}
<section id="dropdown-theme-fixture">
  <h2>Source Dropdown tokens</h2>
  <label>Dropdown token preset <select bind:value={preset} aria-label="Dropdown token preset">
    {#each Object.keys(dropdownThemePresets) as name}<option value={name}>{name}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={enabled} /> Apply source Dropdown tokens</label>
  <label><input type="checkbox" bind:checked={mounted} /> Mount themed Dropdown</label>
  <label><input type="checkbox" bind:checked={hashed} /> Hash themed Dropdown</label>
  <label><input type="checkbox" bind:checked={compact} /> Native compact Dropdown</label>
  <label><input type="checkbox" bind:checked={open} /> Open themed Dropdown</label>
  <label><input type="checkbox" bind:checked={arrow} /> Themed Dropdown arrow</label>
  <label><input type="checkbox" bind:checked={parentAliases} /> Parent Dropdown aliases</label>
  <label>Dropdown background <input bind:value={background} /></label>
  <label>Themed Dropdown placement <select bind:value={placement} aria-label="Themed Dropdown placement">
    {#each ['top', 'topLeft', 'topRight', 'bottom', 'bottomLeft', 'bottomRight'] as name}
      <option value={name}>{name}</option>
    {/each}
  </select></label>
  {#if mounted}
    <ConfigProvider theme={enabled ? config : { compact }}>
      <div class="stage" style={parentAliases ? '--ant-font-size:30px;--ant-color-text:red' : undefined}>
        <Dropdown bind:open {arrow} {placement} autoAdjustOverflow={false} trigger="click"
          aria-label="Themed Dropdown commands" onOpenChange={next => { changes = [...changes, next]; }}
          menu={{
            items: [
              { key: 'normal', label: 'Normal', icon },
              { key: 'disabled', label: 'Disabled', disabled: true },
              { key: 'divider', type: 'divider' },
              { key: 'danger', label: 'Danger', danger: true },
              { key: 'link', label: 'Native link', href: '#dropdown-theme-destination' }
            ],
            onClick: info => { events = [...events, info.key]; }
          }}>
          <button type="button" style="width:240px;height:32px;font:inherit;padding:0"
            onclick={() => { clicks++; }}>Open themed Dropdown</button>
        </Dropdown>
      </div>
    </ConfigProvider>
  {/if}
  <output aria-label="Dropdown theme events">{JSON.stringify(events)}</output>
  <output aria-label="Dropdown theme changes">{JSON.stringify(changes)}</output>
  <output aria-label="Dropdown theme clicks">{clicks}</output>
  <div id="dropdown-theme-destination">Link destination</div>
</section>
