<script lang="ts">
  import type { TreeSelectInputContext } from 'antd-svelte';
  let { context, revision, release }: {
    context: TreeSelectInputContext<HTMLInputElement>;
    revision: number;
    release: (id: string, cleanup: () => void) => void;
  } = $props();
  let registerInput = $derived(context.register);
  function register(node: HTMLInputElement) {
    const cleanup = registerInput(node);
    return () => release(node.id, cleanup);
  }
</script>
<input {...context.attributes} id={`input-lifecycle-${revision}`} {@attach register} />
