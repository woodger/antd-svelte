import type { FeedbackAction, FeedbackSample } from './form-feedback-cases';

export type FeedbackPicker = 'date' | 'range' | 'time' | 'time-range';
export type FeedbackPickerAction = FeedbackAction | 'suffix-default' | 'suffix-null' | 'suffix-false'
  | 'suffix-empty' | 'suffix-custom' | 'suffix-zero';
export interface FeedbackPickerSample extends Omit<FeedbackSample, 'suffix' | 'actions'> {
  picker: FeedbackPicker;
  suffix?: boolean | null | '' | 0 | 'text' | 'custom';
  configSuffix?: boolean | null | '' | 0 | 'text' | 'custom';
  actions?: readonly FeedbackPickerAction[];
}
const live: readonly FeedbackAction[] = ['focus', 'error', 'update-icon', 'hide-icon', 'show-icon',
  'toggle-feedback', 'toggle-feedback', 'success', 'outside'];
export const feedbackPickerSamples: readonly FeedbackPickerSample[] = [
  ...(['date', 'range', 'time', 'time-range'] as const).flatMap(picker => [
    { id: `${picker}-error`, picker, status: 'error' as const },
    { id: `${picker}-local-status`, picker, status: 'success' as const, treeStatus: 'warning' as const },
    { id: `${picker}-no-style`, picker, status: 'error' as const, noStyle: 'inherit' as const, innerStatus: 'warning' as const },
    { id: `${picker}-nested-form`, picker, status: 'error' as const, nestedForm: true },
    { id: `${picker}-otp`, picker, status: 'error' as const, otp: true },
    { id: `${picker}-prefixes`, picker, status: 'warning' as const, rootPrefix: 'brand',
      treePrefix: 'choice', itemPrefix: 'field', formPrefix: 'sheet', rtl: true },
    { id: `${picker}-live`, picker, status: 'warning' as const, mode: 'custom' as const, actions: live },
    { id: `${picker}-async`, picker, async: true, mode: 'custom' as const,
      actions: ['validate', 'resolve', 'reset'] as const }
  ]),
  ...(['time', 'time-range'] as const).flatMap(picker => [
    ...([true, false, null, '', 'custom'] as const).map((suffix, index) => ({
      id: `${picker}-suffix-${index}`, picker, suffix, status: 'error' as const
    })),
    { id: `${picker}-config-suffix`, picker, configSuffix: 'custom' as const, status: 'success' as const },
    { id: `${picker}-local-over-config`, picker, configSuffix: 'custom' as const,
      suffix: true, status: 'success' as const }
  ]),
  ...(['date', 'range'] as const).flatMap(picker => [
    ...([true, false, null, '', 0, 'text', 'custom'] as const).map((suffix, index) => ({
      id: `${picker}-suffix-${index}`, picker, suffix, status: 'error' as const
    })),
    { id: `${picker}-config-suffix`, picker, configSuffix: 'custom' as const, status: 'success' as const },
    { id: `${picker}-local-over-config`, picker, configSuffix: 'custom' as const,
      suffix: true, status: 'success' as const },
    { id: `${picker}-suffix-live`, picker, status: 'warning' as const, mode: 'custom' as const,
      actions: ['focus', 'suffix-null', 'suffix-custom', 'suffix-zero', 'suffix-default',
        'suffix-false', 'suffix-empty', 'suffix-default', 'outside'] as const }
  ])
];
