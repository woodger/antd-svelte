import { hydrate, tick } from 'svelte';
import 'antd-svelte/styles.css';
import TreeSelectTagsScope from './TreeSelectTagsScope.svelte';
import { treeTagSamples } from './tree-select-tag-cases';

declare global {
  interface Window {
    treeTagsHydration?: {
      root: Element | null;
      input: HTMLInputElement | null;
      tag: Element | null;
      outside: HTMLInputElement | null;
      focusedBefore: boolean;
      ready: boolean;
    };
  }
}

const name = new URL(location.href).searchParams.get('name');
const sample = treeTagSamples.find(sample => sample.id === name);
if (!sample) throw new Error(`Unknown TreeSelect hydration case: ${name}`);
const root = document.querySelector('[data-ant-tree-choice-control]');
const input = root?.querySelector<HTMLInputElement>('[role="combobox"]') ?? null;
const tag = root?.querySelector('[data-ant-tree-choice-selection-item], [data-tree-choice-custom-tag]') ?? null;
const outside = document.querySelector<HTMLInputElement>('[aria-label="Tree tag outside draft"]');
if (outside) outside.value = 'Outside hydration draft';
outside?.setSelectionRange(2, 8);
input?.focus();
if (input) input.value = 'Hydration draft';
input?.setSelectionRange(1, 6);
window.treeTagsHydration = { root, input, tag, outside, focusedBefore: document.activeElement === input, ready: false };
hydrate(TreeSelectTagsScope, { target: document.getElementById('root')!, props: { sample } });
await tick();
window.treeTagsHydration.ready = true;
