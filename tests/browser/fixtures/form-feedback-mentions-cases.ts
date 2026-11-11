import { feedbackSamples, type FeedbackSample, type FeedbackAction } from './form-feedback-cases.ts';

export type MentionsFeedbackAction = FeedbackAction | 'type-mention' | 'choose-mention' | 'search-transfer' | 'move-transfer' | 'swap-affixes';
export interface MentionsFeedbackSample extends Omit<FeedbackSample, 'actions'> {
  component: 'mentions' | 'transfer';
  clear?: boolean;
  search?: boolean;
  toggleOnSelect?: boolean;
  actions?: readonly MentionsFeedbackAction[];
}
const shared = ['status-success', 'status-error', 'status-warning', 'status-validating',
  'pristine', 'feedback-false', 'icon-custom', 'icon-false', 'icon-null', 'form-icons',
  'local-status', 'no-style-inherit', 'no-style-inner-status', 'no-style-false', 'no-style-own',
  'nested-form', 'prefixes', 'dark-rtl', 'compact-small', 'async-success'];
export const mentionsFeedbackSamples: readonly MentionsFeedbackSample[] = [
  ...(['mentions', 'transfer'] as const).flatMap(component => feedbackSamples
    .filter(sample => shared.includes(sample.id)).map(sample => ({
      ...sample, component, id: `${component}-${sample.id}`, search: component === 'transfer'
    }))),
  { id: 'mentions-clear', component: 'mentions', status: 'error', clear: true, actions: ['focus', 'clear'] },
  { id: 'mentions-clear-toggle', component: 'mentions', status: 'error', clear: true,
    actions: ['focus', 'toggle-feedback', 'toggle-feedback', 'clear'] },
  { id: 'mentions-interaction', component: 'mentions', status: 'warning', mode: 'custom',
    actions: ['focus', 'type-mention', 'error', 'update-icon', 'choose-mention'] },
  { id: 'mentions-live', component: 'mentions', status: 'warning', mode: 'custom',
    actions: ['focus', 'error', 'update-icon', 'hide-icon', 'show-icon', 'toggle-feedback', 'toggle-feedback'] },
  { id: 'mentions-popup-toggle', component: 'mentions', status: 'warning',
    actions: ['focus', 'type-mention', 'toggle-feedback', 'toggle-feedback'] },
  { id: 'mentions-combined-affixes', component: 'mentions', status: 'warning', clear: true, feedback: false,
    actions: ['focus', 'swap-affixes', 'swap-affixes', 'clear'] },
  { id: 'mentions-select-toggle', component: 'mentions', status: 'warning', toggleOnSelect: true,
    actions: ['focus', 'type-mention', 'choose-mention'] },
  { id: 'transfer-no-search', component: 'transfer', status: 'error' },
  { id: 'transfer-interaction', component: 'transfer', status: 'warning', mode: 'custom', search: true,
    actions: ['focus', 'search-transfer', 'error', 'update-icon', 'move-transfer', 'toggle-feedback', 'toggle-feedback'] }
];
