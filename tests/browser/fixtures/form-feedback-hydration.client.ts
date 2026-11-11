import 'antd-svelte/styles.css';
import { hydrate, tick, unmount } from 'svelte';
import FormFeedbackCase from './FormFeedbackCase.svelte';
import { feedbackSamples } from './form-feedback-cases';
declare global {
  interface Window {
    formFeedbackHydration?: { input: Element | null; icon: Element | null; dispose(): Promise<void>; };
  }
}
const target = document.getElementById('root')!;
const input = target.querySelector('[aria-label="Feedback selection"]');
const icon = target.querySelector('[data-custom-feedback]');
const instance = hydrate(FormFeedbackCase, { target, recover: false,
  props: { sample: feedbackSamples.find(sample => sample.id === 'live-feedback')! } });
await tick();
window.formFeedbackHydration = { input, icon, dispose: () => unmount(instance) };
