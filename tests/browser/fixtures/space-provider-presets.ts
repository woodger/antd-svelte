import type { SpaceConfig } from 'antd-svelte';

export function sourceSpaceConfig(mode?: string): SpaceConfig | undefined {
  if (!mode) return undefined;
  const dynamic = mode === 'functions';
  const empty = mode === 'empty-functions';

  return {
    size: mode === 'zero' ? 0 : [15, 'large'],
    class: 'context-space',
    style: 'column-gap:41px;padding:4px;background:#fff7e6',
    classNames: empty ? () => undefined : dynamic ? ({ props }) => ({
      root: `ctx-${props.orientation}-${props.align ?? 'unset'}-${
        Array.isArray(props.size) ? props.size.join('-') : props.size
      }`,
      item: 'context-item',
      separator: 'context-separator'
    }) : { root: 'context-root', item: 'context-item', separator: 'context-separator' },
    styles: empty ? () => undefined : dynamic ? ({ props }) => ({
      root: `row-gap:${props.orientation === 'vertical' ? 13 : 17}px`,
      item: 'color:#531dab;padding:3px',
      separator: 'color:#c41d7f'
    }) : {
      root: 'row-gap:19px;column-gap:23px',
      item: 'color:#531dab;padding:2px',
      separator: 'color:#c41d7f'
    }
  };
}
