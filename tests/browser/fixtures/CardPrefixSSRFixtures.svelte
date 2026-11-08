<script lang="ts">
  import { ConfigProvider, Card, CardGrid, CardMeta } from 'antd-svelte';
  import CardPrefixScope from './CardPrefixScope.svelte';
</script>

<ConfigProvider prefixCls="suite" theme={{ cssVar: {} }}>
  <CardPrefixScope scope="normal" sample={{ id: 'server' }} />
  <ConfigProvider prefixCls="inner">
    <CardPrefixScope scope="nested" sample={{ id: 'server', local: 'panel', grid: true }} />
    <Card prefixCls="panel" containGrid>
      <CardGrid prefixCls=""><CardMeta prefixCls="" title="Global child" /></CardGrid>
    </Card>
  </ConfigProvider>
</ConfigProvider>
