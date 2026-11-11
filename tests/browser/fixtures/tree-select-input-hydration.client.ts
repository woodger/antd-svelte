import 'antd-svelte/styles.css';
import { hydrate, tick, unmount } from 'svelte';
import TreeSelectInputCase from './TreeSelectInputCase.svelte';
import { treeSelectInputSamples } from './tree-select-input-cases';

declare global {
  interface Window {
    treeSelectInputHydration?: {
      editor: HTMLInputElement;
      root: HTMLElement;
      dispose: () => Promise<void>;
    };
  }
}
const target = document.getElementById('root')!;
const editor = target.querySelector<HTMLInputElement>('[data-tree-select-input-case] input')!;
const root = editor.closest<HTMLElement>('.ant-select')!;
const sample = treeSelectInputSamples.find(sample => sample.id === 'live-own-props')!;
const instance = hydrate(TreeSelectInputCase, { target, props: { sample }, recover: false });
await tick();
window.treeSelectInputHydration = { editor, root, dispose: () => unmount(instance) };
