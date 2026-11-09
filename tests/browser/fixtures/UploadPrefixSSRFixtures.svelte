<script lang="ts">
  import { Button, ConfigProvider, Upload, UploadDragger } from 'antd-svelte';

  const files = [{ uid: 'one', name: 'note.txt', status: 'done' as const }];
</script>

<ConfigProvider prefixCls="suite" theme={{ cssVar: {} }}>
  <Upload defaultFileList={files}><Button>Upload</Button></Upload>
  <ConfigProvider prefixCls="inner">
    <UploadDragger prefixCls="files" defaultFileList={files}>Drop files</UploadDragger>
  </ConfigProvider>
</ConfigProvider>
