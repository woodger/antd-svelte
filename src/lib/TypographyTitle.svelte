<script lang="ts">
  import type { TypographyTitleProps } from './typography.types';
  import TypographyBlock from './TypographyBlock.svelte';
  let { nativeElement = $bindable(), level = 1, ...props }: TypographyTitleProps = $props();
  const headings = { 1: 'h1', 2: 'h2', 3: 'h3', 4: 'h4', 5: 'h5' } as const;
  let component = $derived([1, 2, 3, 4, 5].includes(level) ? headings[level] : 'h1');
</script>

<TypographyBlock {...props} {component} bind:nativeElement />
