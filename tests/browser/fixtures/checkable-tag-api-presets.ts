export interface CheckableTagApiStep {
  kind: 'click' | 'key';
  key?: string;
  repeat?: boolean;
  cancelled?: boolean;
}

export interface CheckableTagApiCase {
  name: string;
  checked?: boolean;
  disabled?: boolean;
  preventKey?: boolean;
  preventClick?: boolean;
  accept?: boolean;
  removeOnChange?: boolean;
  removeOnKeyDown?: boolean;
  steps: CheckableTagApiStep[];
  events: string[];
  prevented: boolean[];
  final: { checked: boolean; mounted: boolean };
}
