import { render } from 'svelte/server';
import TreeSelectTriggerCase from './TreeSelectTriggerCase.svelte';
import { treeSelectTriggerSamples } from './tree-select-trigger-cases';

export function renderTreeSelectTrigger() {
  return render(TreeSelectTriggerCase, {
    props: { sample: treeSelectTriggerSamples.find(entry => entry.id === 'autofocus-open')! },
    idPrefix: 'trigger-hydration'
  });
}
