import 'antd-svelte/styles.css';
import { hydrate, tick, unmount } from 'svelte';
import FormFeedbackCascaderCase from './FormFeedbackCascaderCase.svelte';
import { feedbackCascaderSamples } from './form-feedback-cascader-cases';
declare global {
  interface Window {
    formFeedbackCascaderHydration?: { inputs: Element[]; icon: Element | null; dispose(): Promise<void>; };
  }
}
const target = document.getElementById('root')!;
const inputs = [...target.querySelectorAll('[data-feedback-control] input[role="combobox"]')];
const icon = target.querySelector('[data-custom-feedback]');
const instance = hydrate(FormFeedbackCascaderCase, { target, recover: false,
  props: { sample: feedbackCascaderSamples.find(sample => sample.id === 'live-feedback')! } });
await tick();
window.formFeedbackCascaderHydration = { inputs, icon, dispose: () => unmount(instance) };
