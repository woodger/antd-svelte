<script lang="ts">
  import Alert from './Alert.svelte';
  import RenderContent from './RenderContent.svelte';
  import type { AlertErrorBoundaryProps } from './alert-error-boundary.types';

  let {
    title, message, description: customDescription, children, id
  }: AlertErrorBoundaryProps = $props();
  let failure = $state<{ message: string; stack?: string; }>();

  function handleError(error: unknown) {
    const stack = error && typeof error === 'object' && 'stack' in error
      && typeof error.stack === 'string' ? error.stack : undefined;

    failure = { message: String(error), stack };
  }
</script>

<!-- Fallback снаружи boundary: его ошибка идёт к родителю, SSR children продолжают выбрасывать. -->
<svelte:boundary onerror={handleError}>
  <RenderContent value={children} />
</svelte:boundary>
{#if failure}
  <Alert {id} type="error" title={title ?? message ?? failure.message}>
    {#snippet description()}<pre style="font-size:0.9em;overflow-x:auto"><RenderContent
      value={customDescription ?? failure?.stack ?? null} /></pre>{/snippet}
  </Alert>
{/if}
