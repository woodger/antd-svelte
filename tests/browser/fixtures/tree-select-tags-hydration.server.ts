import { render } from 'svelte/server';
import TreeSelectTagsScope from './TreeSelectTagsScope.svelte';
import { treeTagSamples } from './tree-select-tag-cases';

export function renderTreeTags(name: string) {
  const sample = treeTagSamples.find(sample => sample.id === name);
  if (!sample) throw new Error(`Unknown TreeSelect hydration case: ${name}`);
  return render(TreeSelectTagsScope, { props: { sample }, idPrefix: 'tree-tags-browser-' });
}
