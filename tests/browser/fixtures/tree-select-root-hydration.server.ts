import { render } from 'svelte/server';
import TreeSelectRootCase from './TreeSelectRootCase.svelte';
import { treeSelectRootSamples } from './tree-select-root-cases';

export function renderTreeSelectRoot(id: string) {
  return render(TreeSelectRootCase, {
    props: { sample: treeSelectRootSamples.find(sample => sample.id === id)! },
    idPrefix: 'root-hydration'
  });
}
