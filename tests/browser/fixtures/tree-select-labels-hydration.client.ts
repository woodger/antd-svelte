import { hydrate, tick, unmount } from 'svelte';
import 'antd-svelte/styles.css';
import TreeSelectLabelsScope from './TreeSelectLabelsScope.svelte';
import { treeLabelSamples } from './tree-select-label-cases';

declare global {
  interface Window {
    treeLabelHydration?: {
      control: Element | null;
      editor: Element | null;
      field: HTMLInputElement;
      outside: HTMLInputElement;
      ready: boolean;
      dispose: () => Promise<void>;
    };
  }
}

const target = document.getElementById('root')!;
const control = target.querySelector('[data-tree-label-control] [data-ant-tree-choice-control]');
const editor = target.querySelector('[data-tree-label-control] [data-ant-tree-choice-input]');
const field = target.querySelector<HTMLInputElement>('[aria-label="header label draft 0"]')!;
const outside = target.querySelector<HTMLInputElement>('[aria-label="Outside renderer draft"]')!;
outside.value = 'Outside draft before hydration';
outside.setSelectionRange(1, 6);
field.value = 'Rich label draft before hydration';
field.focus();
field.setSelectionRange(2, 7);
const owner = hydrate(TreeSelectLabelsScope, { target, recover: false, intro: false,
  props: { sample: treeLabelSamples[0], interactive: true, probeIntro: true } });
window.treeLabelHydration = { control, editor, field, outside, ready: false, dispose: () => unmount(owner) };
await tick();
window.treeLabelHydration.ready = true;
