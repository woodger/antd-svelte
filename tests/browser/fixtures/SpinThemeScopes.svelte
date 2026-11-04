<script lang="ts">
  import { ConfigProvider, Spin } from 'antd-svelte';

  let { tokenSize = 30 }: { tokenSize?: number; } = $props();
</script>

<ConfigProvider theme={{ cssVar: { key: 'spin-parent-scope' }, components: {
  Spin: { dotSize: tokenSize, dotSizeSM: 18, dotSizeLG: 42, contentHeight: 260 }
} }}>
  <Spin data-spin-scope="parent" />
  <ConfigProvider theme={{ cssVar: { key: 'spin-child-scope' }, components: {
    Spin: { dotSize: 9 }
  } }}><Spin data-spin-scope="child" size="small" /><Spin data-spin-scope="child-default" /></ConfigProvider>
  <ConfigProvider theme={{ inherit: false, cssVar: { key: 'spin-reset-scope' } }}>
    <Spin data-spin-scope="reset" />
  </ConfigProvider>
  <Spin data-spin-scope="priority" style="--ant-spin-dot-size:38px"
    styles={{ root: '--ant-spin-dot-size:36px' }} />
</ConfigProvider>
<ConfigProvider theme={{ cssVar: { key: 'spin-neighbor-scope' }, components: {
  Spin: { dotSize: 24 }
} }}><Spin data-spin-scope="neighbor" /></ConfigProvider>
<Spin data-spin-scope="outside" />
