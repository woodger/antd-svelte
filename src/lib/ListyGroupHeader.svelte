<script lang="ts" generics="T, K extends ListyKey">
  import type { Attachment } from 'svelte/attachments';
  import type { ListyHeader } from './listy.engine';
  import type { ListyGroup, ListyKey } from './listy.types';

  let {
    row,
    title,
    prefixCls,
    sticky = false,
    fixed = false,
    top,
    class: className,
    style,
    attach
  }: {
    row: ListyHeader<T, K>;
    title: ListyGroup<T, K>['title'];
    prefixCls: string;
    sticky?: boolean;
    fixed?: boolean;
    top?: number;
    class?: string;
    style?: string;
    attach?: Attachment<HTMLDivElement>;
  } = $props();
</script>

<div {@attach attach} class={[
  `${prefixCls}-group-header`,
  sticky && `${prefixCls}-group-header-sticky`,
  fixed && `${prefixCls}-group-header-fixed`,
  className
]} style={[style, top !== undefined && `top:${top}px`].filter(Boolean).join(';')}>
  {@render title(row.groupKey, row.items)}
</div>
