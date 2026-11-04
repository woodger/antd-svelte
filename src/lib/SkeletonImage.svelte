<script lang="ts">
  import SkeletonElement from './SkeletonElement.svelte';
  import type { SkeletonImageProps } from './skeleton.types';

  let props: SkeletonImageProps = $props();
</script>

<SkeletonElement kind="image" {...props} />
