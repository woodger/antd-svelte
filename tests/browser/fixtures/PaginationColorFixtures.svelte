<script lang="ts">
  import {
    ConfigProvider,
    Pagination,
    theme,
    type PaginationItemInfo,
    type PaginationItemType,
    type ThemeConfig
  } from 'antd-svelte';
  import type { Snippet } from 'svelte';

  let source = $state(false);
  let dark = $state(false);
  let disabled = $state(false);
  let custom = $state(false);
  let inline = $state(false);
  let rtl = $state(false);
  let current = $state(1);
  let changes = $state<string[]>([]);
  let submissions = $state(0);
  let config = $derived<ThemeConfig>(source
    ? { cssVar: {}, algorithm: dark ? theme.darkAlgorithm : undefined }
    : { mode: dark ? 'dark' : 'light', primary: 'blue' });
  let colors = $derived(custom
    ? '--ant-pagination-item-active-color:#117733;--ant-pagination-item-active-color-hover:#338855;--ant-pagination-item-active-color-disabled:#775533'
    : undefined);
</script>

{#snippet pageControl(
  page: number,
  type: PaginationItemType,
  original: Snippet,
  info: PaginationItemInfo
)}
  {#if type === 'page'}<button type="button" class="page-button"
    style="color:#554433" disabled={info.disabled} aria-label={info.label}
    aria-current={info.active ? 'page' : undefined} onclick={info.onClick}>{page}</button>
  {:else}{@render original()}{/if}
{/snippet}

<section id="pagination-color-fixture">
  <h2>Pagination page colors</h2>
  <label><input type="checkbox" bind:checked={source} /> Source pagination colors</label>
  <label><input type="checkbox" bind:checked={dark} /> Dark pagination colors</label>
  <label><input type="checkbox" bind:checked={disabled} /> Disabled pagination colors</label>
  <label><input type="checkbox" bind:checked={custom} /> Custom active page colors</label>
  <label><input type="checkbox" bind:checked={inline} /> Inline pagination colors</label>
  <label><input type="checkbox" bind:checked={rtl} /> RTL pagination colors</label>
  <ConfigProvider theme={config} direction={rtl ? 'rtl' : 'ltr'}>
    <form onsubmit={event => {
      event.preventDefault();
      submissions++;
    }}>
      <Pagination aria-label="Pagination colors" total={50} showSizeChanger={false}
        bind:current {disabled} itemRender={inline ? pageControl : undefined}
        styles={colors ? { item: colors } : undefined}
        onChange={(page, size) => changes = [...changes, `${page}:${size}`]} />
    </form>
  </ConfigProvider>
  <button type="button">After pagination colors</button>
  <output aria-label="Pagination color current">{current}</output>
  <output aria-label="Pagination color changes">{JSON.stringify(changes)}</output>
  <output aria-label="Pagination color submissions">{submissions}</output>
</section>
