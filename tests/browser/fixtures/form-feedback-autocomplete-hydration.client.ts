import 'antd-svelte/styles.css';
import { hydrate, tick, unmount } from 'svelte';
import FormFeedbackAutoCompleteCase from './FormFeedbackAutoCompleteCase.svelte';
import { feedbackAutoCompleteSamples } from './form-feedback-autocomplete-cases';
declare global {
  interface Window {
    formFeedbackAutoCompleteHydration?: { input: Element | null; icons: Element[]; dispose(): Promise<void>; };
  }
}
const target = document.getElementById('root')!;
const id = new URLSearchParams(location.search).get('feedbackSample') ?? 'live-feedback';
const input = target.querySelector('[aria-label="Feedback completion"]');
const icons = [...target.querySelectorAll('[data-custom-feedback]')];
const instance = hydrate(FormFeedbackAutoCompleteCase, { target, recover: false,
  props: { sample: feedbackAutoCompleteSamples.find(sample => sample.id === id)! } });
await tick();
window.formFeedbackAutoCompleteHydration = { input, icons, dispose: () => unmount(instance) };
