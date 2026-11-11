import { feedbackSamples, type FeedbackSample } from './form-feedback-cases.ts';
export interface FeedbackCascaderSample extends FeedbackSample {
  cascaderSuffix?: 'null' | 'false' | 'custom';
  customTrigger?: boolean;
  panel?: boolean;
}
const shared = ['status-success', 'status-error', 'status-warning', 'status-validating', 'pristine',
  'feedback-false', 'icon-custom', 'icon-false', 'icon-true', 'form-icons', 'local-status',
  'no-style-inherit', 'no-style-inner-status', 'no-style-false', 'no-style-own', 'nested-form',
  'otp-isolation', 'prefixes', 'dark-rtl', 'compact-small', 'loading', 'multiple', 'disabled',
  'live-feedback', 'live-metadata', 'async-success', 'async-error', 'surface', 'live-prefix', 'popup-isolation'];
export const feedbackCascaderSamples: readonly FeedbackCascaderSample[] = [
  ...feedbackSamples.filter(sample => shared.includes(sample.id)),
  { id: 'suffix-null', status: 'error', cascaderSuffix: 'null' },
  { id: 'suffix-false', status: 'warning', cascaderSuffix: 'false' },
  { id: 'suffix-custom', status: 'success', cascaderSuffix: 'custom', mode: 'custom' },
  { id: 'custom-trigger', status: 'error', customTrigger: true },
  { id: 'standalone-panel', status: 'warning', panel: true }
];
