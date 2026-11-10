import { render } from 'svelte/server';
import TreeSelectSurfaceScope from './TreeSelectSurfaceScope.svelte';
import { treeSelectSurfaceSamples } from './tree-select-surface-cases';

export function renderTreeSelectPopup() {
  const sample = { ...treeSelectSurfaceSamples.find(entry => entry.id === 'popup-wrap')!, defaultOpen: true };
  return render(TreeSelectSurfaceScope, { props: { sample }, idPrefix: 'tree-select-popup' });
}
