<script lang="ts">
  import {
    ConfigProvider,
    Pagination,
    type PaginationProps,
    type ThemeConfig
  } from 'antd-svelte';
  import { paginationThemePresets } from './pagination-theme-presets';
  import reference from './ant-design-pagination-metrics.json';
  import { currentReferenceSize } from './reference-size';

  let preset = $state('default');
  let enabled = $state(true);
  let mounted = $state(true);
  let hashed = $state(true);
  let compact = $state(false);
  let rtl = $state(false);
  let parentAliases = $state(false);
  let overrideStyles = $state(false);
  let narrow = $state(false);
  let itemSize = $state<number | undefined>();
  let events = $state<string[]>([]);
  let current = $state(6);
  let pageSize = $state(10);
  let config = $derived<ThemeConfig>({
    ...paginationThemePresets[preset],
    cssVar: { ...paginationThemePresets[preset].cssVar, key: 'pagination-source-scope' },
    hashed,
    components: itemSize !== undefined ? {
      ...paginationThemePresets[preset].components,
      Pagination: { ...paginationThemePresets[preset].components?.Pagination, itemSize }
    } : paginationThemePresets[preset].components
  });
  let variants = $derived(reference.variants.filter((_, index) => index < 6
    || ['default', 'own-tokens', 'wireframe', 'custom-prefix'].includes(preset)).map(variant => ({
      ...variant, props: { ...variant.props,
        size: currentReferenceSize(variant.props && 'size' in variant.props ? variant.props.size : undefined) }
    })) as {
    name: string;
    inputVariant?: 'filled' | 'borderless' | 'underlined';
    props?: Partial<PaginationProps>;
  }[]);
</script>

<style>
  label { display: block; }
  .stage { width: 1100px; }
  .row { margin-bottom: 20px; }
</style>

<section id="pagination-theme-fixture">
  <h2>Source Pagination tokens</h2>
  <label>Pagination token preset <select bind:value={preset} aria-label="Pagination token preset">
    {#each Object.keys(paginationThemePresets) as name}<option value={name}>{name}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={enabled} /> Apply source Pagination tokens</label>
  <label><input type="checkbox" bind:checked={mounted} /> Mount themed Pagination</label>
  <label><input type="checkbox" bind:checked={hashed} /> Hash themed Pagination</label>
  <label><input type="checkbox" bind:checked={compact} /> Native compact Pagination</label>
  <label><input type="checkbox" bind:checked={rtl} /> RTL themed Pagination</label>
  <label><input type="checkbox" bind:checked={parentAliases} /> Parent Pagination aliases</label>
  <label><input type="checkbox" bind:checked={overrideStyles} /> Override Pagination token styles</label>
  <label><input type="checkbox" bind:checked={narrow} /> Narrow themed Pagination</label>
  <label>Pagination item size <input type="number" bind:value={itemSize} /></label>
  {#if mounted}
    {#each variants as variant (variant.name)}
      <ConfigProvider theme={enabled ? config : { compact }} direction={rtl ? 'rtl' : 'ltr'}
        input={{ variant: variant.inputVariant ?? 'outlined' }}>
        <div class="stage row" style={parentAliases
          ? '--ant-font-size:30px;--ant-color-text:red' : undefined}
          style:width={narrow ? '200px' : undefined}>
          <Pagination class={`pagination-token-${variant.name}`}
            aria-label={`Themed ${variant.name} Pagination`} total={200}
            showSizeChanger showQuickJumper current={6} {...variant.props}
            styles={overrideStyles ? { root: '--ant-pagination-item-size:41px' } : undefined}
            style={overrideStyles ? '--ant-pagination-item-size:47px' : undefined} />
        </div>
      </ConfigProvider>
    {/each}
    <ConfigProvider theme={enabled ? config : { compact }} direction={rtl ? 'rtl' : 'ltr'}>
      <div class="stage" style:width={narrow ? '200px' : undefined}>
        <Pagination class="pagination-token-interactive" aria-label="Interactive themed Pagination"
          total={200} bind:current bind:pageSize showSizeChanger showQuickJumper
          onChange={(page, size) => { events = [...events, `change:${page}:${size}`]; }}
          onShowSizeChange={(page, size) => { events = [...events, `size:${page}:${size}`]; }} />
        <Pagination class="pagination-token-editable" aria-label="Editable themed Pagination"
          total={200} bind:current simple showSizeChanger={false}
          onChange={(page, size) => { events = [...events, `simple:${page}:${size}`]; }} />
      </div>
    </ConfigProvider>
  {/if}
  <output aria-label="Pagination theme events">{JSON.stringify(events)}</output>
</section>
