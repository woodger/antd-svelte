<script lang="ts">
  import { ConfigProvider, Popconfirm, Popover, Tooltip } from 'antd-svelte';
  import { overlayThemePresets } from '../browser/fixtures/overlay-theme-presets';

  let { preset = 'default', native = false }: { preset?: string; native?: boolean; } = $props();
</script>

{#snippet description()}
  Confirm description
  <Popover title="Nested title" content="Nested content"><button type="button">Nested trigger</button></Popover>
{/snippet}

<ConfigProvider theme={native ? { compact: true } : {
  ...overlayThemePresets[preset],
  cssVar: { ...overlayThemePresets[preset].cssVar, key: 'overlay-ssr' }
}}>
  <Tooltip title="Tooltip reference" defaultOpen><button type="button">Tooltip trigger</button></Tooltip>
  <Popover title="Popover title" content="Popover content" defaultOpen popupClass="ssr-popover">
    <button type="button">Popover trigger</button>
  </Popover>
  <Popconfirm title="Confirm title" {description} defaultOpen>
    <button type="button">Confirm trigger</button>
  </Popconfirm>
</ConfigProvider>
