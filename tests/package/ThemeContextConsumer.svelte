<script lang="ts">
  import { Button, theme, type AliasToken } from 'antd-svelte';
  const current = theme.useToken();
  const inputTokens = $derived(current.token.Input as Partial<AliasToken> | undefined);
</script>

<Button type="primary">Source context</Button>
<output data-primary={current.token.colorPrimary} data-height={current.token.controlHeight}
  data-font={current.token.fontSize} data-hash={current.hashId}
  data-css-primary={current.cssVar.colorPrimary}
  data-component-primary={inputTokens?.colorPrimary}>
  Source context tokens
</output>
