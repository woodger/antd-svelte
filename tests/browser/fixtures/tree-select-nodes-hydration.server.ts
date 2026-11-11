import { render } from 'svelte/server';
import TreeSelectNodesFixtures from './TreeSelectNodesFixtures.svelte';

export function renderDeclaredTreeSelect() {
  return render(TreeSelectNodesFixtures, { idPrefix: 'declared-tree-select' });
}
