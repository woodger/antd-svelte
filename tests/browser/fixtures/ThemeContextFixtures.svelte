<script lang="ts">
  import { ColorPicker, ConfigProvider, theme, type ThemeConfig } from 'antd-svelte';
  import ThemeContextConsumer from './ThemeContextConsumer.svelte';

  let enabled = $state(true);
  let algorithm = $state('default');
  let primary = $state('#189cff');
  let fontSize = $state(15);
  let height = $state(40);
  let inherited = $state(true);
  let hashed = $state(true);
  let customPrefix = $state(false);
  let prefix = $state('custom');
  let componentAlgorithm = $state(true);
  let nativeCompact = $state(true);
  const algorithms = {
    default: theme.defaultAlgorithm,
    dark: theme.darkAlgorithm,
    compact: theme.compactAlgorithm,
    'dark-compact': [theme.darkAlgorithm, theme.compactAlgorithm]
  };
  let config = $derived<ThemeConfig>({
    algorithm: algorithms[algorithm as keyof typeof algorithms],
    token: { colorPrimary: primary, fontSize, controlHeight: height, borderRadius: 8 },
    hashed,
    cssVar: { prefix: customPrefix ? prefix : 'ant', key: 'context-root' },
    components: { Input: { colorPrimary: '#00B96B', algorithm: componentAlgorithm } }
  });
</script>

<section id="theme-context-fixture">
  <h2>ConfigProvider source tokens</h2>
  <label><input type="checkbox" bind:checked={enabled} /> Source context enabled</label>
  <label>Context algorithm <select bind:value={algorithm} aria-label="Context algorithm">
    <option value="default">Default</option>
    <option value="dark">Dark</option>
    <option value="compact">Compact</option>
    <option value="dark-compact">Dark compact</option>
  </select></label>
  <label>Context primary <input bind:value={primary} /></label>
  <label>Context font <input type="number" bind:value={fontSize} /></label>
  <label>Context height <input type="number" bind:value={height} /></label>
  <label><input type="checkbox" bind:checked={inherited} /> Child inherits source tokens</label>
  <label><input type="checkbox" bind:checked={hashed} /> Context hash enabled</label>
  <label><input type="checkbox" bind:checked={customPrefix} /> Custom CSS prefix</label>
  <label>CSS prefix value <input bind:value={prefix} /></label>
  <label><input type="checkbox" bind:checked={componentAlgorithm} /> Component algorithm enabled</label>
  <label><input type="checkbox" bind:checked={nativeCompact} /> Native compact enabled</label>

  <ConfigProvider theme={enabled ? config : undefined} class="source-context-provider">
    <ThemeContextConsumer id="context-root-consumer" />
    <ColorPicker aria-label="Context color picker" defaultValue="#123456" />
    <ConfigProvider><ThemeContextConsumer id="context-inherited" /></ConfigProvider>
    <ConfigProvider theme={{ token: { colorPrimary: '#f5222d' } }}>
      <ThemeContextConsumer id="context-child" />
    </ConfigProvider>
    <ConfigProvider theme={{ inherit: inherited, token: { fontSize: 18 } }}>
      <ThemeContextConsumer id="context-reset" />
    </ConfigProvider>
    <ConfigProvider theme={{ token: { colorPrimary: '#123456' } }}
      style="--ant-color-primary:#abcdef">
      <ThemeContextConsumer id="context-inline" />
    </ConfigProvider>
  </ConfigProvider>
  <ConfigProvider theme={{ mode: 'dark', primary: 'purple', compact: nativeCompact }}>
    <ThemeContextConsumer id="context-native" />
  </ConfigProvider>
  <ThemeContextConsumer id="context-outside" />
</section>
