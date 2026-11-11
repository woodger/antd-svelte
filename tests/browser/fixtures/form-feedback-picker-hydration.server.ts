import { render } from 'svelte/server';
import FormFeedbackPickerCase from './FormFeedbackPickerCase.svelte';
import { feedbackPickerSamples } from './form-feedback-picker-cases';
export function renderFormFeedbackPicker(picker: string) {
  return render(FormFeedbackPickerCase, { props: {
    sample: feedbackPickerSamples.find(sample => sample.id === `${picker}-live`)!
  }, idPrefix: 'form-feedback-picker-hydration' });
}
