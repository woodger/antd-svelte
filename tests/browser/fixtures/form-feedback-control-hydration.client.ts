import 'antd-svelte/styles.css';
import { hydrate, tick, unmount } from 'svelte';
import FormFeedbackControlCase from './FormFeedbackControlCase.svelte';
import { feedbackControlSamples } from './form-feedback-control-cases';
declare global {
  interface Window {
    formFeedbackControlHydration?: { input: Element | null; icon: Element | null; dispose(): Promise<void>; };
  }
}
const target = document.getElementById('root')!;
const control = new URLSearchParams(location.search).get('feedbackKind');
const input = target.querySelector('[aria-label="Feedback field"]');
const icon = target.querySelector('[data-custom-feedback]');
const instance = hydrate(FormFeedbackControlCase, { target, recover: false,
  props: { sample: feedbackControlSamples.find(sample => sample.id === `${control}-live-feedback`)! } });
await tick();
window.formFeedbackControlHydration = { input, icon, dispose: () => unmount(instance) };
