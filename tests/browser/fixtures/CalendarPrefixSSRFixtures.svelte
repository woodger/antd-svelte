<script lang="ts">
  import dayjs from 'dayjs';
  import { Calendar, ConfigProvider } from 'antd-svelte';

  const value = dayjs('2024-09-15T12:34:56.789Z');
</script>

<ConfigProvider prefixCls="suite" theme={{ cssVar: {} }}>
  <Calendar {value} fullscreen={false} />
  <ConfigProvider prefixCls="inner">
    <Calendar prefixCls="dates" {value} mode="year" fullscreen={false} />
  </ConfigProvider>
</ConfigProvider>
