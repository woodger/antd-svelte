<script lang="ts">
  import type { TypographyLinkProps } from './typography.types';
  import TypographyBlock from './TypographyBlock.svelte';
  let { nativeElement = $bindable(), ellipsis, rel, target, ...props }: TypographyLinkProps = $props();
  let link = $derived({
    ...props,
    component: 'a' as const,
    ellipsis: Boolean(ellipsis),
    target,
    rel: rel === undefined && target === '_blank' ? 'noopener noreferrer' : rel
  });
</script>

<TypographyBlock {...link} bind:nativeElement />
