import { render } from 'svelte/server';
import TreeSelectInputCase from './TreeSelectInputCase.svelte';
import { treeSelectInputSamples } from './tree-select-input-cases';

export function renderTreeSelectInput() {
  const sample = treeSelectInputSamples.find(sample => sample.id === 'live-own-props')!;
  return render(TreeSelectInputCase, { props: { sample }, idPrefix: 'tree-select-input-hydration' });
}
