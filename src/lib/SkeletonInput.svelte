<script lang="ts">
  import SkeletonElement from './SkeletonElement.svelte';
  import type { SkeletonInputProps } from './skeleton.types';

  let props: SkeletonInputProps = $props();
</script>

<SkeletonElement kind="input" {...props} />
