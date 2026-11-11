import { render } from 'svelte/server';
import FormFeedbackAutoCompleteCase from './FormFeedbackAutoCompleteCase.svelte';
import { feedbackAutoCompleteSamples } from './form-feedback-autocomplete-cases';
export function renderFormFeedbackAutoComplete(id = 'live-feedback') {
  return render(FormFeedbackAutoCompleteCase, {
    props: { sample: feedbackAutoCompleteSamples.find(sample => sample.id === id)! },
    idPrefix: 'form-feedback-autocomplete-hydration'
  });
}
