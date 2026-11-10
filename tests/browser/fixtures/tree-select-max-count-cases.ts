import type {
  TreeSelectStrategy, TreeSelectValue, TreeSelectRawValue, TreeExpandAction
} from 'antd-svelte';

export type TreeSelectMaxCountAction =
  | { kind: 'open' | 'limit' | 'data' | 'clear'; }
  | { kind: 'choose' | 'title'; value: TreeSelectRawValue; }
  | { kind: 'remove'; label: string; }
  | { kind: 'key' | 'search'; value: string; };

export interface TreeSelectMaxCountSample {
  id: string;
  data: readonly Record<string, unknown>[];
  nextData?: readonly Record<string, unknown>[];
  value?: TreeSelectValue;
  maxCount?: number;
  nextMaxCount?: number;
  multiple?: boolean;
  checkable?: boolean;
  strict?: boolean;
  labeled?: boolean;
  strategy?: TreeSelectStrategy;
  expandAction?: TreeExpandAction;
  aliases?: boolean;
  simple?: boolean;
  rtl?: boolean;
  search?: string;
  controlled?: 'hold' | 'accept';
  actions: readonly TreeSelectMaxCountAction[];
}
