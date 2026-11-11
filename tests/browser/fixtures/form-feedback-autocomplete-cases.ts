import { feedbackSamples, type FeedbackSample } from './form-feedback-cases.ts';

export interface FeedbackAutoCompleteSample extends FeedbackSample {
  input?: 'native-input' | 'native-textarea' | 'input' | 'textarea';
  clear?: boolean;
  controlledOpen?: boolean;
}
const shared = ['status-success', 'status-error', 'status-warning', 'status-validating',
  'status-empty', 'pristine', 'feedback-false', 'icon-custom', 'icon-false', 'form-icons',
  'local-status', 'no-style-inherit', 'no-style-inner-status', 'no-style-false', 'no-style-own',
  'nested-form', 'otp-isolation', 'prefixes', 'dark-rtl', 'compact-small', 'live-feedback',
  'async-success', 'live-prefix'];
export const feedbackAutoCompleteSamples: readonly FeedbackAutoCompleteSample[] = [
  ...feedbackSamples.filter(sample => shared.includes(sample.id)),
  ...(['native-input', 'native-textarea', 'input', 'textarea'] as const).flatMap(input => [
    { id: `${input}-error`, input, status: 'error' as const },
    { id: `${input}-live`, input, status: 'warning' as const, mode: 'custom' as const,
      actions: ['focus', 'error', 'update-icon', 'hide-icon', 'show-icon', 'toggle-feedback', 'toggle-feedback'] as const }
  ]),
  { id: 'clear', status: 'error', clear: true, actions: ['focus', 'open', 'clear'] },
  { id: 'clear-controlled', status: 'error', clear: true, controlledOpen: true, actions: ['focus', 'open', 'clear'] },
  { id: 'surface', status: 'error', actions: ['focus', 'open', 'search', 'outside'] }
];
