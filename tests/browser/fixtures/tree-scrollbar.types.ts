import type { TreeSelectProps } from 'antd-svelte';
export const treeScrollbarModes: TreeSelectProps['showScrollBar'][] = [undefined, true, false, 'optional'];
// @ts-expect-error Only boolean and the inherited optional literal are accepted.
export const invalidTreeScrollbarMode: TreeSelectProps['showScrollBar'] = 'always';
