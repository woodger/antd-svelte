import { render } from 'svelte/server';
import TreeSelectVirtualFixtures from './TreeSelectVirtualFixtures.svelte';

export function renderVirtualTreeSelect() {
  return render(TreeSelectVirtualFixtures, { idPrefix: 'virtual-tree-select' });
}
