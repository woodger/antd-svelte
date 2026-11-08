import type { SelectTokenSeparators } from 'antd-svelte';
import type { SelectTagsSample } from './select-tags-cases';

export interface SelectTokenSample extends SelectTagsSample {
  text: string;
  separators?: readonly string[];
  splitter?: string;
  paste?: boolean;
  compose?: boolean;
}

export function getSelectTokenSeparators(sample: SelectTokenSample): SelectTokenSeparators {
  if (sample.separators) return sample.separators;
  if (sample.splitter === 'csv') return text => text.split(',');
  if (sample.splitter === 'spaces') return text => text.split(/\s+/);
  if (sample.splitter === 'empty') return () => [];
  return text => [text];
}
