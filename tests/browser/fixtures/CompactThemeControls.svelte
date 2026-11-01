<script lang="ts">
  import { Button, Input, InputNumber, Select, theme } from 'antd-svelte';

  let { id }: { id: string; } = $props();
  const current = theme.useToken();
  const names = [
    'fontSize', 'fontSizeSM', 'fontSizeLG', 'lineHeight', 'lineHeightSM', 'lineHeightLG',
    'fontHeight', 'fontHeightSM', 'fontHeightLG', 'controlHeight', 'controlHeightSM',
    'controlHeightLG'
  ] as const;
  let tokens = $derived(Object.fromEntries(names.map(name => [name, current.token[name]])));
</script>

<style>
  .controls { display: flex; align-items: flex-start; flex-wrap: wrap; gap: 16px; }
  .controls > div { width: 180px; }
</style>

<div {id} class="controls" data-tokens={JSON.stringify(tokens)}>
  <div><Input id={`${id}-input`} aria-label={`${id} input`} defaultValue="Example" /></div>
  <div><Select id={`${id}-select`} aria-label={`${id} select`} defaultValue="a"
    options={[{ value: 'a', label: 'Example' }]} /></div>
  <div><InputNumber id={`${id}-number`} aria-label={`${id} number`} defaultValue={48} /></div>
  <div><Button id={`${id}-button`} type="primary">Example</Button></div>
</div>
