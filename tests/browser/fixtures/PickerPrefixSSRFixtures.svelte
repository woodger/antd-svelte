<script lang="ts">
  import dayjs from 'dayjs';
  import { ConfigProvider, DatePicker, RangePicker, TimePicker, TimeRangePicker } from 'antd-svelte';

  const value = dayjs('2024-09-15T12:34:56.789Z');
  const range: [typeof value, typeof value] = [value, value.add(1, 'hour')];
</script>

<ConfigProvider prefixCls="suite" theme={{ cssVar: {} }}>
  <DatePicker {value} defaultOpen />
  <RangePicker value={range} />
  <ConfigProvider prefixCls="inner">
    <TimePicker prefixCls="times" {value} />
    <TimeRangePicker prefixCls="times" value={range} />
  </ConfigProvider>
</ConfigProvider>
