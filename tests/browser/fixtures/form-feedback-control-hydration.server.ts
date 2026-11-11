import { render } from 'svelte/server';
import FormFeedbackControlCase from './FormFeedbackControlCase.svelte';
import { feedbackControlSamples } from './form-feedback-control-cases';
export function renderFormFeedbackControl(control: string) {
  return render(FormFeedbackControlCase, {
    props: { sample: feedbackControlSamples.find(sample => sample.id === `${control}-live-feedback`)! },
    idPrefix: 'form-feedback-control-hydration'
  });
}
