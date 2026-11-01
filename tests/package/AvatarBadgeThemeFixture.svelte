<script lang="ts">
  import { Avatar, AvatarGroup, Badge, ConfigProvider, type ThemeConfig } from 'antd-svelte';

  let { native = false, missing = false, prefix = 'ant', numeric = false, aliases = false }: {
    native?: boolean; missing?: boolean; prefix?: string; numeric?: boolean; aliases?: boolean;
  } = $props();
  let config = $derived<ThemeConfig>({
    cssVar: { key: 'avatar-badge-ssr', prefix },
    components: {
      Avatar: {
        ...(aliases ? { fontSize: 24, colorBgElevated: '#ffaaaa', colorText: '#003344' } : {}),
        containerSize: missing ? undefined : 48,
        textFontSize: missing ? undefined : 21,
        groupBorderColor: missing ? undefined : '#123456', groupSpace: 9, groupOverlapping: -12
      },
      Badge: {
        indicatorHeight: missing ? undefined : 28, dotSize: missing ? undefined : 9,
        textFontWeight: numeric ? 650 : '600', indicatorZIndex: numeric ? 7 : '9',
        colorBorderBg: '#fedcba'
      }
    }
  });
</script>

<ConfigProvider theme={native ? { compact: true, mode: 'dark' } : config}>
  <Avatar id="ssr-avatar" alt="Source avatar">A</Avatar>
  <AvatarGroup id="ssr-avatar-group" items={[
    { key: 'one', label: 'One', text: 'A' }, { key: 'two', label: 'Two', text: 'B' }
  ]} max={{ count: 1 }} />
  <Badge id="ssr-badge" count={7}>
    <Avatar id="ssr-badge-avatar" alt="Badge child">A</Avatar>
  </Badge>
</ConfigProvider>
