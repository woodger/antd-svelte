<script lang="ts" module>
  import type { AlertErrorBoundaryProps } from 'antd-svelte';

  export interface AlertBoundarySample {
    name: string;
    props: AlertErrorBoundaryProps;
    healthy?: boolean;
    effect?: boolean;
    rich?: boolean;
    theme?: boolean;
  }
</script>

<script lang="ts">
  import { Alert, ConfigProvider } from 'antd-svelte';
  import type { AlertConfig } from 'antd-svelte';
  import BrokenChild from './BrokenChild.svelte';

  let {
    sample, mounted = true, configured = false, nested = false, badFallback = false
  }: {
    sample: AlertBoundarySample;
    mounted?: boolean;
    configured?: boolean;
    nested?: boolean;
    badFallback?: boolean;
  } = $props();
  const config: AlertConfig = {
    class: 'boundary-alert', styles: { root: 'padding-top:7px', description: 'color:#123456' }
  };
  let boundaryProps = $derived<AlertErrorBoundaryProps>({
    ...sample.props,
    ...(sample.rich ? { title: richTitle, description: richDescription } : {}),
    ...(badFallback ? { description: brokenDescription } : {})
  });
</script>

{#snippet richTitle()}<strong>Rich boundary title</strong>{/snippet}
{#snippet richDescription()}<em>Rich boundary description</em>{/snippet}
{#snippet brokenDescription()}<BrokenChild />{/snippet}
{#snippet content()}<BrokenChild fail={!sample.healthy && !sample.effect}
  effectFailure={sample.effect} />{/snippet}
{#snippet boundary()}<Alert.ErrorBoundary {...boundaryProps} children={content} />{/snippet}

<ConfigProvider theme={{ cssVar: { key: 'boundary-source' },
  components: { Alert: sample.theme ? { fontSize: 17, fontSizeLG: 21 } : {} } }}
  alert={configured ? config : undefined}>
  <div data-boundary-frame style="width:600px;max-width:100%">
    {#if mounted}
      {#if nested}<Alert.ErrorBoundary title="Outer boundary" description="Outer fallback">
        {@render boundary()}
      </Alert.ErrorBoundary>
      {:else}{@render boundary()}{/if}
    {/if}
  </div>
</ConfigProvider>
