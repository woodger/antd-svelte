<script lang="ts">
  import { ConfigProvider, Image, ImagePreviewGroup } from 'antd-svelte';
</script>

<ConfigProvider prefixCls="suite" theme={{ cssVar: {} }}>
  <Image src="first.svg" alt="First image" preview={{ open: true }} />
  <ConfigProvider prefixCls="inner">
    <ImagePreviewGroup previewPrefixCls="gallery" preview={{ open: true }}>
      <Image prefixCls="photo" src="second.svg" alt="Second image" />
    </ImagePreviewGroup>
  </ConfigProvider>
</ConfigProvider>
