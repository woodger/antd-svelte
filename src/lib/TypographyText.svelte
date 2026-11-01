<script lang="ts">
  import { typographyTextEllipsis } from './typography.engine';
  import type { TypographyTextProps } from './typography.types';
  import TypographyBlock from './TypographyBlock.svelte';
  let { nativeElement = $bindable(), ellipsis, ...props }: TypographyTextProps = $props();
</script>

<TypographyBlock {...props} component="span" ellipsis={typographyTextEllipsis(ellipsis)} bind:nativeElement />
