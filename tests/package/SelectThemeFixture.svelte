<script lang="ts">
  import { ConfigProvider, Select } from 'antd-svelte';
  import { selectThemePresets } from '../browser/fixtures/select-theme-presets';

  let { preset = 'default', native = false }: { preset?: string; native?: boolean; } = $props();
  const options = [{ value: 'b', label: 'Beta' }];
</script>

<ConfigProvider theme={native ? { compact: true } : {
  ...selectThemePresets[preset],
  cssVar: { ...selectThemePresets[preset].cssVar, key: 'select-ssr' }
}}>
  <Select {options} value="b" name="project" aria-label="SSR themed Select" style="width:240px" />
  <Select {options} mode="multiple" value={['b']} name="teams" aria-label="SSR multiple Select" />
  <Select {options} mode="multiple" value={['b']} disabled aria-label="SSR disabled Select" />
</ConfigProvider>
