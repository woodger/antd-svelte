<script lang="ts">
  import SkeletonElement from './SkeletonElement.svelte';
  import type { SkeletonAvatarProps } from './skeleton.types';

  let { shape = 'circle', ...props }: SkeletonAvatarProps = $props();
</script>

<SkeletonElement kind="avatar" {shape} {...props} />
