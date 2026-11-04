<script lang="ts">
  import SkeletonElement from './SkeletonElement.svelte';
  import type { SkeletonButtonProps } from './skeleton.types';

  let props: SkeletonButtonProps = $props();
</script>

<SkeletonElement kind="button" {...props} />
