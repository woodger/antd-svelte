import { feedbackSamples, type FeedbackSample } from './form-feedback-cases.ts';

export type FeedbackControl = 'input' | 'textarea' | 'number' | 'select' | 'password' | 'search';
export interface FeedbackControlSample extends FeedbackSample {
  control: FeedbackControl;
  clear?: boolean;
  counter?: boolean;
  affixes?: boolean;
  boundary?: 'calendar' | 'color' | 'mentions' | 'pagination';
}
const shared = ['status-success', 'status-error', 'status-warning', 'status-validating',
  'status-empty', 'pristine', 'feedback-false', 'icon-custom', 'icon-false', 'icon-null',
  'icon-true', 'icon-empty-array', 'form-icons', 'local-empty-over-form', 'local-status',
  'no-style-inherit', 'no-style-inner-status', 'no-style-false', 'no-style-own', 'nested-form',
  'otp-isolation', 'prefixes', 'dark-rtl', 'compact-small', 'live-feedback', 'live-metadata',
  'async-success', 'async-error', 'live-prefix'];
export const feedbackControlSamples: readonly FeedbackControlSample[] = [
  ...(['input', 'textarea', 'number', 'select'] as const).flatMap(control => [
    ...feedbackSamples.filter(sample => shared.includes(sample.id)).map(sample => ({
      ...sample, control, id: `${control}-${sample.id}`
    })),
    { id: `${control}-affixes`, control, status: 'error' as const, affixes: true, clear: true,
      counter: true, actions: control === 'number' ? ['focus', 'error'] as const : ['focus', 'clear'] as const }
  ]),
  ...(['password', 'search'] as const).flatMap(control => [
    { id: `${control}-error`, control, status: 'error' as const, clear: true, counter: true },
    { id: `${control}-live`, control, status: 'warning' as const, mode: 'custom' as const,
      actions: ['focus', 'error', 'update-icon', 'hide-icon', 'show-icon', 'toggle-feedback', 'toggle-feedback'] as const }
  ]),
  { id: 'select-calendar', control: 'select', status: 'error', boundary: 'calendar', nameless: true },
  { id: 'input-color-panel', control: 'input', status: 'error', boundary: 'color', nameless: true },
  { id: 'input-mentions-popup', control: 'input', status: 'error', boundary: 'mentions', nameless: true },
  { id: 'select-pagination', control: 'select', status: 'error', boundary: 'pagination', nameless: true }
];
