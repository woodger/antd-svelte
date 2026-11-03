<script lang="ts">
  import BadgeDigit from './BadgeDigit.svelte';

  let { count, prefixCls = 'ant-scroll-number' }: {
    count: string | number | boolean | undefined;
    prefixCls?: string;
  } = $props();
  let digits = $derived(Boolean(count) && Number(count) % 1 === 0);
</script>

<bdi>{#if digits}{#each [...String(count)] as value, index (String(count).length - index)}<BadgeDigit
  {value} count={Number(count)} {prefixCls} />{/each}{:else}{typeof count === 'boolean' ? '' : count ?? ''}{/if}</bdi>
