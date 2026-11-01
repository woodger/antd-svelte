<script lang="ts">
  import { Button, Card, Input, theme, type AliasToken } from 'antd-svelte';

  let { id }: { id: string; } = $props();
  const current = theme.useToken();
  // Source GlobalToken объявляет ComponentToken; runtime record также содержит alias overrides.
  const inputTokens = $derived(current.token.Input as Partial<AliasToken> | undefined);
</script>

<article {id}>
  <h3>{id}</h3>
  <Button type="primary" id={`${id}-button`}>{id} primary button</Button>
  <Input aria-label={`${id} input`} />
  <Card id={`${id}-card`}>Themed card</Card>
  <output aria-label={`${id} primary`}>{current.token.colorPrimary}</output>
  <output aria-label={`${id} hover`}>{current.token.colorPrimaryHover}</output>
  <output aria-label={`${id} font`}>{current.token.fontSize}</output>
  <output aria-label={`${id} height`}>{current.token.controlHeight}</output>
  <output aria-label={`${id} hash`}>{current.hashId}</output>
  <output aria-label={`${id} css primary`}>{current.cssVar.colorPrimary}</output>
  <output aria-label={`${id} component primary`}>{inputTokens?.colorPrimary}</output>
  <pre aria-label={`${id} full tokens`}>{JSON.stringify(current.token)}</pre>
</article>

<style>
  article { margin-block: 12px; padding: 12px; border: 1px solid var(--ant-color-border); }
  output { display: block; }
  pre { max-height: 50px; overflow: auto; white-space: pre-wrap; }
</style>
