<script lang="ts">
  import SkeletonElement from './SkeletonElement.svelte';
  import type { SkeletonNodeProps } from './skeleton.types';

  let props: SkeletonNodeProps = $props();
</script>

<SkeletonElement kind="node" {...props} />
