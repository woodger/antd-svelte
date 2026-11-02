<script lang="ts">
  import { ConfigProvider, Pagination } from 'antd-svelte';
  import { paginationThemePresets } from '../browser/fixtures/pagination-theme-presets';

  let { preset = 'default', native = false, semantic = false }: {
    preset?: string;
    native?: boolean;
    semantic?: boolean;
  } = $props();
  const browserOnly = () => { throw new Error('browser only'); };
</script>

<ConfigProvider theme={native ? { compact: true } : {
  ...paginationThemePresets[preset],
  cssVar: { ...paginationThemePresets[preset].cssVar, key: 'pagination-ssr' }
}}>
  <Pagination current={6} total={200} showSizeChanger showQuickJumper
    onChange={browserOnly} onShowSizeChange={browserOnly}
    styles={semantic ? { root: '--ant-pagination-item-size:41px' } : undefined}
    style={semantic ? '--ant-pagination-item-size:47px' : undefined} />
  <Pagination current={6} total={200} simple showSizeChanger={false} />
</ConfigProvider>
