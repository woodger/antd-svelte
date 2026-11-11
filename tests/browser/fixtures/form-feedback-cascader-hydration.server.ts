import { render } from 'svelte/server';
import FormFeedbackCascaderCase from './FormFeedbackCascaderCase.svelte';
import { feedbackCascaderSamples } from './form-feedback-cascader-cases';
export function renderFormFeedbackCascader() {
  return render(FormFeedbackCascaderCase, { props: {
    sample: feedbackCascaderSamples.find(sample => sample.id === 'live-feedback')!
  }, idPrefix: 'form-feedback-cascader-hydration' });
}
