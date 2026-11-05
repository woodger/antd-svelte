<script lang="ts">
  let count = $state(0);
</script>

<!-- Между controls нет текстового узла: fixture повторяет JSX эталона. -->
<div data-lifecycle-payload=""><input aria-label="Lifecycle draft" value="Draft" /><button type="button" aria-label="Lifecycle count" onclick={() => count++}>{count}</button></div>
