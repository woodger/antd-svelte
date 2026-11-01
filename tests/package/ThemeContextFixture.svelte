<script lang="ts">
  import { ConfigProvider, theme } from 'antd-svelte';
  import ThemeContextConsumer from './ThemeContextConsumer.svelte';

  let { kind = 'source' }: { kind?: string; } = $props();
</script>

{#if kind === 'default'}
  <ThemeContextConsumer />
{:else if kind === 'native'}
  <ConfigProvider theme={{ mode: 'dark', primary: 'purple', compact: true }}>
    <ThemeContextConsumer />
  </ConfigProvider>
{:else}
  <ConfigProvider theme={{ algorithm: [theme.darkAlgorithm, theme.compactAlgorithm],
    token: { colorPrimary: '#1677ff', fontSize: 15 }, hashed: false,
    cssVar: { prefix: 'source', key: 'source-scope' },
    components: { Input: { colorPrimary: '#00B96B', algorithm: true } } }}>
    {#if kind === 'reset'}
      <ConfigProvider theme={{ inherit: false }}><ThemeContextConsumer /></ConfigProvider>
    {:else if kind === 'inherited'}
      <ConfigProvider><ThemeContextConsumer /></ConfigProvider>
    {:else}
      <ThemeContextConsumer />
    {/if}
  </ConfigProvider>
{/if}
