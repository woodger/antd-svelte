export type FeedbackStatus = '' | 'success' | 'error' | 'warning' | 'validating';
export type FeedbackMode = 'custom' | 'false' | 'null' | 'zero' | 'true' | 'empty-array' | 'array' | 'empty-map';
export type FeedbackAction = 'focus' | 'open' | 'outside' | 'choose-beta' | 'search' | 'hover'
  | 'error' | 'success' | 'empty-status' | 'auto-status' | 'toggle-feedback' | 'update-icon'
  | 'hide-icon' | 'show-icon' | 'validate' | 'resolve' | 'reject' | 'errors' | 'warnings'
  | 'validated' | 'reset' | 'change-prefix' | 'clear';
export interface FeedbackSample {
  id: string;
  status?: FeedbackStatus;
  feedback?: boolean;
  mode?: FeedbackMode;
  formIcons?: boolean;
  noStyle?: 'inherit' | 'false' | 'own';
  innerStatus?: FeedbackStatus;
  hidden?: boolean;
  nestedForm?: boolean;
  otp?: boolean;
  nameless?: boolean;
  treeStatus?: 'error' | 'warning';
  suffix?: 'null' | 'custom' | 'rendered';
  multiple?: boolean;
  loading?: boolean;
  disabled?: boolean;
  async?: boolean;
  initialTouched?: boolean;
  popup?: boolean;
  rootPrefix?: string;
  formPrefix?: string;
  itemPrefix?: string;
  treePrefix?: string;
  rtl?: boolean;
  theme?: 'dark' | 'compact';
  size?: 'small' | 'large';
  actions?: readonly FeedbackAction[];
}
export const feedbackSamples: readonly FeedbackSample[] = [
  ...(['success', 'error', 'warning', 'validating', ''] as const).map(status => ({ id: 'status-' + (status || 'empty'), status })),
  { id: 'pristine' },
  { id: 'feedback-false', status: 'error', feedback: false },
  ...(['custom', 'false', 'null', 'zero', 'true', 'empty-array', 'array', 'empty-map'] as const)
    .map(mode => ({ id: 'icon-' + mode, status: 'warning' as const, mode })),
  { id: 'form-icons', status: 'error', formIcons: true },
  { id: 'local-over-form', status: 'success', mode: 'custom', formIcons: true },
  { id: 'local-empty-over-form', status: 'warning', mode: 'empty-map', formIcons: true },
  { id: 'local-status', status: 'warning', treeStatus: 'error' },
  { id: 'suffix-null', status: 'error', suffix: 'null' },
  { id: 'suffix-custom', status: 'success', suffix: 'custom', mode: 'custom' },
  { id: 'suffix-rendered', status: 'warning', suffix: 'rendered', mode: 'custom' },
  { id: 'loading', status: 'error', loading: true },
  { id: 'multiple', status: 'success', multiple: true },
  { id: 'disabled', status: 'error', disabled: true },
  { id: 'no-style-inherit', status: 'error', noStyle: 'inherit' },
  { id: 'no-style-inner-status', status: 'error', noStyle: 'inherit', innerStatus: 'warning' },
  { id: 'no-style-false', status: 'warning', noStyle: 'false' },
  { id: 'no-style-own', status: 'warning', noStyle: 'own', innerStatus: 'success' },
  { id: 'hidden-no-style', status: 'error', noStyle: 'inherit', hidden: true },
  { id: 'nested-form', status: 'error', nestedForm: true },
  { id: 'otp-isolation', status: 'error', otp: true },
  { id: 'nameless', status: 'success', nameless: true },
  { id: 'prefixes', status: 'error', rootPrefix: 'brand', formPrefix: 'local-form', itemPrefix: 'field', treePrefix: 'choice' },
  { id: 'no-style-prefix', status: 'error', noStyle: 'inherit', itemPrefix: 'parent', formPrefix: 'sheet' },
  { id: 'dark-rtl', status: 'warning', theme: 'dark', rtl: true },
  { id: 'compact-small', status: 'error', theme: 'compact', size: 'small' },
  { id: 'large-clear', status: 'success', size: 'large', actions: ['hover', 'clear'] },
  { id: 'live-feedback', status: 'warning', mode: 'custom', initialTouched: true, actions: ['focus', 'error', 'update-icon', 'hide-icon',
    'show-icon', 'success', 'toggle-feedback', 'toggle-feedback', 'empty-status', 'auto-status', 'outside'] },
  { id: 'live-metadata', mode: 'custom', actions: ['errors', 'warnings', 'validated', 'reset'] },
  { id: 'async-success', async: true, mode: 'custom', actions: ['validate', 'resolve', 'reset'] },
  { id: 'async-error', async: true, mode: 'custom', actions: ['validate', 'reject', 'reset'] },
  { id: 'surface', status: 'error', actions: ['focus', 'open', 'search', 'outside'] },
  { id: 'live-prefix', status: 'success', actions: ['focus', 'change-prefix', 'outside'] },
  { id: 'popup-isolation', status: 'error', mode: 'custom', popup: true, actions: ['open'] }
];

export function feedbackCaption(mode: string, revision: number, status: FeedbackStatus) {
  return `${mode} ${revision} ${status}`;
}
