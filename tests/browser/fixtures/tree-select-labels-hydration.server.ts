import { render } from 'svelte/server';
import TreeSelectLabelsScope from './TreeSelectLabelsScope.svelte';
import { treeLabelSamples } from './tree-select-label-cases';

export function renderTreeLabels() {
  return render(TreeSelectLabelsScope, {
    props: { sample: treeLabelSamples[0], interactive: true, probeIntro: true },
    idPrefix: 'tree-label-hydration'
  });
}
