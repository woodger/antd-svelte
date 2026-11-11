import 'antd-svelte/styles.css';
import { hydrate, tick, unmount } from 'svelte';
import FormFeedbackPickerCase from './FormFeedbackPickerCase.svelte';
import { feedbackPickerSamples } from './form-feedback-picker-cases';
declare global {
  interface Window {
    formFeedbackPickerHydration?: { inputs: Element[]; icon: Element | null; dispose(): Promise<void>; };
  }
}
const target = document.getElementById('root')!;
const picker = new URLSearchParams(location.search).get('feedbackPicker');
const inputs = [...target.querySelectorAll('[data-feedback-picker-control] input')];
const icon = target.querySelector('[data-custom-feedback]');
const instance = hydrate(FormFeedbackPickerCase, { target, recover: false,
  props: { sample: feedbackPickerSamples.find(sample => sample.id === `${picker}-live`)! } });
await tick();
window.formFeedbackPickerHydration = { inputs, icon, dispose: () => unmount(instance) };
