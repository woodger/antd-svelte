<script lang="ts">
  let { values }: { values: { user: { name: string } } } = $props();
</script>

<output aria-label="Cached values name">{values.user.name}</output>
