<script lang="ts">
  import { Avatar, AvatarGroup, Badge, ConfigProvider, theme, type ThemeConfig } from 'antd-svelte';

  const presets: Record<string, ThemeConfig> = {
    default: {},
    dark: { algorithm: theme.darkAlgorithm },
    compact: { algorithm: theme.compactAlgorithm },
    'dark-compact': { algorithm: [theme.darkAlgorithm, theme.compactAlgorithm] },
    'custom-global': { token: {
      fontSize: 18, controlHeight: 44, lineWidth: 2, colorBgContainer: '#192837',
      colorBorderBg: '#abcdef', colorTextPlaceholder: '#456789'
    } },
    'own-avatar': { components: { Avatar: {
      containerSize: 48, containerSizeSM: 30, containerSizeLG: 60,
      textFontSize: 21, textFontSizeSM: 16, textFontSizeLG: 25,
      iconFontSize: 27, iconFontSizeSM: 19, iconFontSizeLG: 33,
      groupOverlapping: -12, groupSpace: 9, groupBorderColor: '#123456'
    } } },
    'own-badge': { components: { Badge: {
      indicatorZIndex: '9', indicatorHeight: 28, indicatorHeightSM: 19, dotSize: 9,
      textFontSize: 15, textFontSizeSM: 13, textFontWeight: '600', statusSize: 10,
      paddingInline: 11, colorBorderBg: '#fedcba', colorError: '#a011cc'
    } } },
    'numeric-badge-values': { components: { Badge: { indicatorZIndex: 7, textFontWeight: 650 } } },
    'component-algorithms': { components: {
      Avatar: { fontSize: 19, controlHeight: 46, colorPrimary: '#00b96b', algorithm: true },
      Badge: { fontSize: 17, colorError: '#a011cc', algorithm: theme.darkAlgorithm }
    } },
    'zero-component-values': { components: {
      Avatar: { containerSize: 0, containerSizeSM: 0, containerSizeLG: 0,
        textFontSize: 0, iconFontSize: 0, groupOverlapping: 0, groupSpace: 0 },
      Badge: { indicatorHeight: 0, indicatorHeightSM: 0, dotSize: 0,
        statusSize: 0, paddingInline: 0, textFontSize: 0, textFontSizeSM: 0 }
    } },
    'undefined-component-values': { components: {
      Avatar: { containerSize: undefined, textFontSize: undefined, groupBorderColor: undefined },
      Badge: { indicatorHeight: undefined, dotSize: undefined }
    } },
    'avatar-aliases': { components: { Avatar: {
      fontSize: 24, lineWidth: 2, colorBgElevated: '#ffaaaa', colorText: '#003344'
    } } },
    'custom-prefix': { cssVar: { prefix: 'Display2' }, components: {
      Avatar: { containerSize: 47, groupBorderColor: '#face00' },
      Badge: { indicatorHeight: 27, dotSize: 8 }
    } }
  };
  const members = [
    { key: 'one', label: 'One', text: 'A' },
    { key: 'two', label: 'Two', text: 'A' },
    { key: 'three', label: 'Three', text: 'A' }
  ];
  let preset = $state('default');
  let enabled = $state(true);
  let mounted = $state(true);
  let hashed = $state(true);
  let inherited = $state(true);
  let config = $derived<ThemeConfig>({
    ...presets[preset], cssVar: { ...presets[preset].cssVar, key: 'avatar-badge-source-scope' }, hashed
  });
</script>

{#snippet icon()}<span>*</span>{/snippet}

<section id="avatar-badge-theme-fixture">
  <h2>Source Avatar and Badge tokens</h2>
  <label>Avatar Badge token preset <select bind:value={preset} aria-label="Avatar Badge token preset">
    {#each Object.keys(presets) as name}<option value={name}>{name}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={enabled} /> Apply source Avatar Badge tokens</label>
  <label><input type="checkbox" bind:checked={mounted} /> Mount themed avatars and badges</label>
  <label><input type="checkbox" bind:checked={hashed} /> Hash themed avatars and badges</label>
  <label><input type="checkbox" bind:checked={inherited} /> Inherit child Avatar Badge tokens</label>
  {#if mounted}
    <ConfigProvider theme={enabled ? config : undefined}>
      <!-- Родитель повторяет body 16px в эталоне UMD для проверки наследуемых undefined. -->
      <div style="font-size:16px;line-height:normal">
        <Avatar id="themed-avatar" alt="Themed avatar">A</Avatar>
        <Avatar id="themed-small-avatar" size="small">A</Avatar>
        <Avatar id="themed-large-avatar" size="large">A</Avatar>
        <Avatar id="themed-square-avatar" shape="square">A</Avatar>
        <Avatar id="themed-icon-avatar" {icon} />
        <Avatar id="themed-numeric-avatar" size={51}>A</Avatar>
        <AvatarGroup id="themed-avatar-group" items={members} />
        <Badge id="themed-badge" count={7}>Badge</Badge>
        <Badge id="themed-small-badge" count={7} size="small">Badge</Badge>
        <Badge id="themed-dot-badge" dot>Dot</Badge>
        <Badge id="themed-status-badge" status="success" text="Success" />
        <Badge id="themed-multi-badge" count={1000}>Multi</Badge>
      </div>
      <AvatarGroup id="themed-overflow-group" items={members}
        max={{ count: 1, popover: { trigger: 'click' } }} />
      <Badge id="badge-avatar-composition" count={7}>
        <Avatar id="badge-child-avatar" alt="Badge child">A</Avatar>
      </Badge>
      <Avatar id="avatar-style-priority" size={51}
        style="width:53px;--ant-avatar-text-font-size:23px">A</Avatar>
      <Badge id="badge-style-priority" count={7}
        style="--ant-badge-indicator-height:31px">Style</Badge>
      <Avatar id="avatar-fitting-text" alt="Long avatar text">WIDE AVATAR TEXT</Avatar>
      <ConfigProvider theme={{ inherit: inherited }}>
        <Avatar id="nested-themed-avatar">A</Avatar>
        <Badge id="nested-themed-badge" count={7}>Nested</Badge>
      </ConfigProvider>
    </ConfigProvider>
  {/if}
  <Avatar id="outside-themed-avatar">A</Avatar>
  <Badge id="outside-themed-badge" count={7}>Outside</Badge>
</section>
