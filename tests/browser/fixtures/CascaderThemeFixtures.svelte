<script lang="ts">
  import { referenceSizeLabel } from './reference-size';
  import {
    Cascader,
    CascaderPanel,
    ConfigProvider,
    type CascaderPath,
    type ThemeConfig
  } from 'antd-svelte';
  import { cascaderThemePresets } from './cascader-theme-presets';

  let preset = $state('default');
  let enabled = $state(true);
  let mounted = $state(true);
  let hashed = $state(true);
  let compact = $state(false);
  let parentAliases = $state(false);
  let color = $state('');
  let popupPadding = $state('');
  let responsiveWidth = $state(200);
  let value = $state<CascaderPath>(['p', 'a']);
  let search = $state('');
  let changes = $state(0);
  let searches = $state(0);
  let focusEvents = $state(0);
  let openings = $state<boolean[]>([]);
  const sizes = ['medium', 'small', 'large'] as const;
  const options = [
    {
      value: 'p',
      label: 'Parent',
      children: [
        { value: 'a', label: 'Alpha' },
        { value: 'b', label: 'Beta' },
        { value: 'd', label: 'Blocked', disabled: true }
      ]
    },
    { value: 'g', label: 'Gamma' },
    { value: 'disabled', label: 'Disabled', disabled: true },
    { value: 'z', label: 'Checked' }
  ];
  let config = $derived<ThemeConfig>({
    ...cascaderThemePresets[preset],
    cssVar: { ...cascaderThemePresets[preset].cssVar, key: 'cascader-source-scope' },
    hashed,
    components: color ? {
      ...cascaderThemePresets[preset].components,
      Cascader: { ...cascaderThemePresets[preset].components?.Cascader, optionSelectedBg: color }
    } : cascaderThemePresets[preset].components
  });
</script>

<style>
  .samples { display:grid;grid-template-columns:repeat(3,320px);align-items:start;gap:20px;margin-block:24px; }
</style>

<section id="cascader-theme-fixture">
  <h2>Source Cascader tokens</h2>
  <label>Cascader token preset <select bind:value={preset} aria-label="Cascader token preset">
    {#each Object.keys(cascaderThemePresets) as name}<option value={name}>{name}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={enabled} /> Apply source Cascader tokens</label>
  <label><input type="checkbox" bind:checked={mounted} /> Mount themed Cascader</label>
  <label><input type="checkbox" bind:checked={hashed} /> Hash themed Cascader</label>
  <label><input type="checkbox" bind:checked={compact} /> Native compact Cascader</label>
  <label><input type="checkbox" bind:checked={parentAliases} /> Parent Cascader aliases</label>
  <label>Cascader color override <input bind:value={color} /></label>
  <label>Cascader popup variable override <input bind:value={popupPadding} /></label>
  <label>Cascader responsive width <input type="number" bind:value={responsiveWidth} /></label>
  {#if mounted}
    <ConfigProvider theme={enabled ? config : { compact }}>
      <div class="samples" style={parentAliases ? '--ant-font-size:30px;--ant-color-text:red' : undefined}>
        {#each sizes as size}
          <Cascader {size} {options} defaultValue={['p', 'a']} class={`cascader-token-single-${referenceSizeLabel(size)}`}
            aria-label={`Themed single path ${size}`} />
        {/each}
        {#each sizes as size}
          <Cascader {size} {options} defaultValue={[[ 'p', 'a' ]]} multiple
            class={`cascader-token-multiple-${referenceSizeLabel(size)}`} aria-label={`Themed multiple path ${size}`} />
        {/each}
        <Cascader {options} defaultValue={[[ 'p', 'a' ]]} multiple disabled
          class="cascader-token-disabled" aria-label="Themed disabled path" />
        <Cascader {options} {value} class="cascader-token-popup" aria-label="Themed path popup"
          style="width:240px" onChange={next => {
            value = next ?? [];
            changes++;
          }}
          onfocus={() => focusEvents++}
          onOpenChange={next => { openings = [...openings, next]; }}
          styles={{ popup: { root: popupPadding
            ? `--ant-cascader-option-padding:${popupPadding}` : undefined } }}
          showSearch={{
            searchValue: search,
            filter: () => true,
            onSearch: next => {
              search = next;
              searches++;
            }
          }} />
        <Cascader {options} defaultValue={[[ 'p', 'a' ], ['z']]} multiple
          class="cascader-token-checks" aria-label="Themed path checks" style="width:240px" />
        <Cascader {options} showSearch={{ searchValue: 'Alp' }}
          class="cascader-token-search" aria-label="Themed path search" style="width:240px" />
        <Cascader options={[]} notFoundContent="No results" class="cascader-token-empty"
          aria-label="Themed path empty" style="width:240px" />
        <CascaderPanel {options} defaultValue={['p', 'a']} class="cascader-token-panel"
          aria-label="Themed path panel" />
        <CascaderPanel {options} defaultValue={[[ 'p', 'a' ], ['z']]} multiple
          class="cascader-token-panel-checks" aria-label="Themed path panel checks" />
        <CascaderPanel options={[]} notFoundContent="No results" class="cascader-token-panel-empty"
          aria-label="Themed path panel empty" />
        <Cascader {options} defaultValue={[[ 'p', 'a' ], ['g'], ['z']]} multiple
          maxTagCount="responsive" class="cascader-token-responsive"
          aria-label="Themed responsive path" style={`width:${responsiveWidth}px`} />
      </div>
    </ConfigProvider>
  {/if}
  <output aria-label="Cascader theme value">{JSON.stringify(value)}</output>
  <output aria-label="Cascader theme changes">{changes}</output>
  <output aria-label="Cascader theme searches">{searches}</output>
  <output aria-label="Cascader theme focus events">{focusEvents}</output>
  <output aria-label="Cascader theme openings">{JSON.stringify(openings)}</output>
</section>
