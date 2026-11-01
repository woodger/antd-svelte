<script lang="ts">
  import type { TypographyParagraphProps } from './typography.types';
  import TypographyBlock from './TypographyBlock.svelte';
  let { nativeElement = $bindable(), ...props }: TypographyParagraphProps = $props();
</script>

<TypographyBlock {...props} component="div" bind:nativeElement />
