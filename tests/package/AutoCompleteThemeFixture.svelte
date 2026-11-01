<script lang="ts">
  import { AutoComplete, ConfigProvider } from 'antd-svelte';
  import { autoCompleteThemePresets } from '../browser/fixtures/auto-complete-theme-presets';
  import CompletionInput from '../browser/fixtures/CompletionInput.svelte';

  let { preset = 'default', native = false }: { preset?: string; native?: boolean; } = $props();
  const options = [{ value: 'b', label: 'Beta' }];
</script>

<ConfigProvider theme={native ? { compact: true } : {
  ...autoCompleteThemePresets[preset],
  cssVar: { ...autoCompleteThemePresets[preset].cssVar, key: 'completion-ssr' }
}}>
  <AutoComplete {options} value="b" name="query" aria-label="SSR themed completion"
    style="width:240px" open />
  <AutoComplete {options} value="b" name="custom" aria-label="SSR custom completion">
    {#snippet children(control)}<CompletionInput {control} />{/snippet}
  </AutoComplete>
</ConfigProvider>
