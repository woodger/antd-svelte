<script lang="ts">
  // Соседние if/markup boundaries вызывающей стороны не разделяют whitespace: head не создаёт DOM root.
  let { css, scope }: { css: string; scope: string; } = $props();
</script>

<svelte:head>
  <svelte:element this={'style'} data-ant-svelte-theme={scope}>{css}</svelte:element>
</svelte:head>
