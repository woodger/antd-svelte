// @rc-component/tree 1.4.0 и Ant Design 6.6.8; MIT, vendor/LICENSE.rc-tree и LICENSE.ant-design.
import type { TreeKey } from './tree.types';
import type { TreeMotionConfig, TreeMotionEvent, TreeMotionName } from './tree-motion.types';

/** Единственный изменившийся expanded key; несколько изменений обновляются без motion. */
export function findTreeMotionKey(previous: readonly TreeKey[], next: readonly TreeKey[]) {
  if (Math.abs(previous.length - next.length) !== 1) return null;
  const show = previous.length < next.length;
  const smaller = new Set(show ? previous : next);
  const difference = (show ? next : previous).filter(key => !smaller.has(key));
  return difference.length === 1 ? { key: difference[0], show } : null;
}

/** Диапазон между раскрываемой веткой и следующим видимым sibling; virtual удерживает окно. */
export function getTreeMotionRange<Row extends { key: TreeKey; }>(
  shorter: readonly Row[],
  longer: readonly Row[],
  key: TreeKey,
  virtual: boolean | undefined,
  height: number | undefined,
  itemHeight: number
) {
  const start = longer.findIndex(row => row.key === key);
  const sibling = shorter[shorter.findIndex(row => row.key === key) + 1];
  const end = sibling ? longer.findIndex(row => row.key === sibling.key) : longer.length;
  const range = longer.slice(start + 1, end);
  return virtual === false || !height ? range : range.slice(0, Math.ceil(height / itemHeight) + 1);
}

function endHeight(_: HTMLDivElement, event: TreeMotionEvent) {
  return 'deadline' in event && event.deadline === true
    || 'propertyName' in event && event.propertyName === 'height';
}
const collapsed = () => 'height:0px;opacity:0';
const real = (node: HTMLDivElement) => `height:${node.scrollHeight}px;opacity:1`;

/** Ant wrapper подставляет collapse object только для null/undefined, сохраняя custom object. */
export function getTreeMotionConfig(
  custom: TreeMotionConfig | false | null | undefined,
  prefix: string
): TreeMotionConfig | false {
  return custom ?? {
    motionName: `${prefix}-motion-collapse`, motionAppear: false, motionDeadline: 500,
    onAppearStart: collapsed, onEnterStart: collapsed,
    onAppearActive: real, onEnterActive: real,
    onLeaveStart: node => `height:${node.offsetHeight}px`, onLeaveActive: collapsed,
    onAppearEnd: endHeight, onEnterEnd: endHeight, onLeaveEnd: endHeight
  };
}

export function getTreeMotionClassName(
  name: TreeMotionName | undefined,
  status: 'appear' | 'enter' | 'leave',
  step: 'prepare' | 'start' | 'active'
) {
  if (!name) return undefined;
  if (typeof name === 'string') return `${name}-${status} ${name}-${status}-${step} ${name}`;
  const suffix = `${status}${step[0].toUpperCase()}${step.slice(1)}` as keyof typeof name;
  return [name[status], name[suffix]].filter(Boolean).join(' ') || undefined;
}
