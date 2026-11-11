import { render } from 'svelte/server';
import FormFeedbackCase from './FormFeedbackCase.svelte';
import { feedbackSamples } from './form-feedback-cases';
export function renderFormFeedback() {
  return render(FormFeedbackCase, { props: { sample: feedbackSamples.find(sample => sample.id === 'live-feedback')! },
    idPrefix: 'form-feedback-hydration' });
}
