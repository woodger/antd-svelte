import type { Snippet } from 'svelte';
import type StepIcon from './StepIcon.svelte';
import type { StepsStatus } from './steps.types';
import type {
  NormalizedStepsDataItem,
  StepsDataItem,
  StepsSemanticSlots
} from './steps-data.engine';
export type { StepsDataItem, StepsDataContent, StepsItemSlots, StepsSemanticSlots } from './steps-data.engine';
export type StepsType = 'default' | 'dot' | 'inline' | 'navigation' | 'panel';
export interface StepsIconInfo {
  index: number;
  active: boolean;
  item: StepsDataItem & { status: StepsStatus; };
  components: { Icon: typeof StepIcon; };
}
export type StepsIconRender = Snippet<[Snippet, StepsIconInfo]>;
/** Внутренние параметры отображения одного элемента Steps. */
export interface StepItemViewProps {
  prefixCls?: string;
  item: NormalizedStepsDataItem;
  index: number;
  status: StepsStatus;
  active: boolean;
  blocked: boolean;
  nextStatus?: StepsStatus;
  rootId: string;
  statusText?: string;
  composed?: boolean;
  classes: StepsSemanticSlots;
  slots: StepsSemanticSlots;
  dot?: boolean;
  panel?: boolean;
  inline?: boolean;
  percent?: number;
  iconRender?: StepsIconRender;
  ellipsis?: boolean;
  sourceKey?: string | number;
  onChoose?: (event: MouseEvent) => void;
  waveDisabled?: boolean;
  waveColorSource?: 'color' | null;
}
