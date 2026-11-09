<script lang="ts">
  import { ConfigProvider, Table } from 'antd-svelte';
  const rows = [{ key: 'one', name: 'One' }];
  const columns = [{ key: 'name', title: 'Name', dataIndex: 'name' as const }];
</script>

<ConfigProvider prefixCls="suite" theme={{ cssVar: {}, token: { motion: false },
  components: { Table: { headerBg: '#fffbe6' } } }}>
  <Table dataSource={rows} {columns} rowKey="key" rowSelection pagination={false} />
  <Table dataSource={rows} {columns} rowKey="key" rowSelection pagination={false}
    prefixCls="grid" dropdownPrefixCls="filters" />
  <ConfigProvider prefixCls="inner">
    <Table dataSource={rows} {columns} rowKey="key" rowSelection pagination={false}
      prefixCls="grid" />
  </ConfigProvider>
</ConfigProvider>
