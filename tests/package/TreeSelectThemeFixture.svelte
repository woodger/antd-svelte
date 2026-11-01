<script lang="ts">
  import { ConfigProvider, TreeSelect } from 'antd-svelte';
  import { treeSelectThemePresets } from '../browser/fixtures/tree-select-theme-presets';

  let { preset = 'default', native = false }: { preset?: string; native?: boolean; } = $props();
  const treeData = [{ value: 'p', title: 'Parent', children: [{ value: 'a', title: 'Alpha' }] }];
</script>

<ConfigProvider theme={native ? { compact: true } : {
  ...treeSelectThemePresets[preset],
  cssVar: { ...treeSelectThemePresets[preset].cssVar, key: 'tree-select-ssr' }
}}>
  <TreeSelect {treeData} defaultValue="a" name="project" aria-label="SSR tree"
    style="width:240px" defaultOpen treeDefaultExpandAll />
  <TreeSelect {treeData} defaultValue={['a']} name="teams" multiple aria-label="SSR multiple tree" />
</ConfigProvider>
