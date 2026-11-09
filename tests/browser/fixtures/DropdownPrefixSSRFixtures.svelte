<script lang="ts">
  import { Button, ConfigProvider, Dropdown } from 'antd-svelte';

  let { getPopupContainer }: { getPopupContainer?: () => HTMLElement } = $props();
</script>

<ConfigProvider prefixCls="suite" theme={{ cssVar: {} }}>
  <Dropdown menu={{ items: [{ key: 'normal', label: 'Normal' }] }} {getPopupContainer}>
    <Button>First</Button>
  </Dropdown>
  <ConfigProvider prefixCls="inner">
    <Dropdown prefixCls="commands" defaultOpen menu={{ items: [{ key: 'rich', label }] }} {getPopupContainer}>
      <Button>Second</Button>
    </Dropdown>
  </ConfigProvider>
</ConfigProvider>

{#snippet label()}<strong>Rich label</strong>{/snippet}
