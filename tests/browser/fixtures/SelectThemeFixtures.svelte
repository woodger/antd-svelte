<script lang="ts">
  import { referenceSizeLabel } from './reference-size';
  import { ConfigProvider, Select, type ThemeConfig } from 'antd-svelte';
  import { selectThemePresets } from './select-theme-presets';

  let preset = $state('default');
  let enabled = $state(true);
  let mounted = $state(true);
  let hashed = $state(true);
  let compact = $state(false);
  let color = $state('');
  let single = $state<string | undefined>('b');
  let multiple = $state(['b']);
  let search = $state('');
  let changes = $state(0);
  let searches = $state(0);
  let focusEvents = $state(0);
  let focusReceiver = $state(true);
  let parentAliases = $state(false);
  let localFilter = $state(false);
  const sizes = ['medium', 'small', 'large'] as const;
  const options = [
    { value: 'a', label: 'Alpha' },
    { value: 'b', label: 'Beta' },
    { value: 'c', label: 'Gamma' },
    { value: 'd', label: 'Disabled', disabled: true }
  ];
  let config = $derived<ThemeConfig>({
    ...selectThemePresets[preset],
    cssVar: { ...selectThemePresets[preset].cssVar, key: 'select-source-scope' },
    hashed,
    components: color ? {
      ...selectThemePresets[preset].components,
      Select: { ...selectThemePresets[preset].components?.Select, selectorBg: color }
    } : selectThemePresets[preset].components
  });

  function handlePopupFocus(
    this: HTMLInputElement,
    event: FocusEvent & { currentTarget: EventTarget & HTMLInputElement; }
  ) {
    focusEvents++;
    focusReceiver = this === event.currentTarget;
  }
</script>

<style>
  .samples { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; margin-block: 32px; }
</style>

<section id="select-theme-fixture">
  <h2>Source Select tokens</h2>
  <label>Select token preset <select bind:value={preset} aria-label="Select token preset">
    {#each Object.keys(selectThemePresets) as name}<option value={name}>{name}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={enabled} /> Apply source Select tokens</label>
  <label><input type="checkbox" bind:checked={mounted} /> Mount themed Select</label>
  <label><input type="checkbox" bind:checked={hashed} /> Hash themed Select</label>
  <label><input type="checkbox" bind:checked={compact} /> Native compact Select</label>
  <label><input type="checkbox" bind:checked={parentAliases} /> Parent Select aliases</label>
  <label><input type="checkbox" bind:checked={localFilter} /> Filter themed Select locally</label>
  <label>Select color override <input bind:value={color} /></label>
  {#if mounted}
    <ConfigProvider theme={enabled ? config : { compact }}>
      <form id="themed-select-form">
        <div class="samples" style={parentAliases ? '--ant-font-size:30px;--ant-color-text:#ff0000' : undefined}>
          {#each sizes as size}
            <div class={`select-token-single-${referenceSizeLabel(size)}`}>
              <Select {options} {size} bind:value={single} aria-label={`Themed single ${size}`}
                onValueChange={() => changes++} />
            </div>
          {/each}
          {#each sizes as size}
            <div class={`select-token-multiple-${referenceSizeLabel(size)}`}>
              <Select {options} {size} mode="multiple" bind:value={multiple}
                aria-label={`Themed multiple ${size}`} name={size === 'medium' ? 'teams' : undefined}
                onValueChange={() => changes++} />
            </div>
          {/each}
          <div class="select-token-disabled">
            <Select {options} mode="multiple" value={['b']} disabled aria-label="Themed disabled" />
          </div>
          <div class="select-token-popup">
            <Select {options} bind:value={single} aria-label="Themed popup" name="project"
              allowClear onValueChange={() => changes++}
              onfocus={handlePopupFocus}
              notFoundContent="No results"
              showSearch={{ searchValue: search, filterOption: localFilter, onSearch: text => {
                search = text;
                searches++;
              } }} />
          </div>
          <div class="select-token-empty">
            <Select options={[]} aria-label="Themed empty" notFoundContent="No results" />
          </div>
        </div>
      </form>
    </ConfigProvider>
  {/if}
  <output aria-label="Select value changes">{changes}</output>
  <output aria-label="Select search changes">{searches}</output>
  <output aria-label="Select search text">{search}</output>
  <output aria-label="Select focus events">{focusEvents}</output>
  <output aria-label="Select focus receiver">{String(focusReceiver)}</output>
</section>
