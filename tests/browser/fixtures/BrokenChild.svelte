<script lang="ts">
  let { fail = true, effectFailure = false }: {
    fail?: boolean;
    effectFailure?: boolean;
  } = $props();
  let initialValue = $derived.by(() => {
    if (fail) throw new Error('Boundary failure');

    return 'Retained draft';
  });

  $effect(() => {
    if (effectFailure) throw new Error('Boundary effect failure');
  });
</script>

<input aria-label="Healthy boundary draft" defaultValue={initialValue} />
