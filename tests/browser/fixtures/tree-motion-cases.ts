export type TreeMotionAction = { kind: 'toggle'; key: string; }
  | { kind: 'frame'; milliseconds?: number; }
  | { kind: 'end'; property: string; }
  | { kind: 'keys'; keys: string[]; }
  | { kind: 'resolve'; };

export interface TreeMotionSample {
  id: string;
  directory?: boolean;
  initial?: string[];
  controlled?: 'hold' | 'accept';
  motion?: 'off' | 'empty' | 'custom' | 'object' | 'prepare' | 'no-appear' | 'no-leave';
  globalMotion?: boolean;
  prefix?: string;
  localPrefix?: string;
  rtl?: boolean;
  compact?: boolean;
  titleHeight?: number;
  duration?: number;
  height?: number;
  virtual?: boolean;
  children?: number;
  lazy?: boolean;
  draggable?: boolean;
  actions?: readonly TreeMotionAction[];
}

export const treeMotionActions: readonly TreeMotionAction[] = [
  { kind: 'toggle', key: 'a' }, { kind: 'frame' },
  { kind: 'end', property: 'opacity' }, { kind: 'end', property: 'height' },
  { kind: 'toggle', key: 'a' }, { kind: 'frame' },
  { kind: 'end', property: 'height' }
];

export const nativeTreeMotionSamples: readonly TreeMotionSample[] = [
  { id: 'native-lazy', lazy: true },
  { id: 'native-drag', draggable: true, motion: 'custom', initial: ['a'] }
];

export const treeMotionSamples: readonly TreeMotionSample[] = [
  { id: 'default' },
  { id: 'initial-expanded', initial: ['a'], actions: [
    { kind: 'toggle', key: 'a' }, { kind: 'frame' }, { kind: 'end', property: 'height' }
  ] },
  { id: 'disabled', motion: 'off' },
  { id: 'empty-config', motion: 'empty' },
  { id: 'theme-motion-off', globalMotion: false },
  { id: 'directory', directory: true },
  { id: 'controlled-hold', controlled: 'hold' },
  { id: 'controlled-accept', controlled: 'accept' },
  { id: 'custom-name', motion: 'custom' },
  { id: 'object-name', motion: 'object' },
  { id: 'appear-overridden', motion: 'no-appear' },
  { id: 'leave-disabled', motion: 'no-leave' },
  { id: 'prepare', motion: 'prepare', actions: [
    { kind: 'toggle', key: 'a' }, { kind: 'frame' }, { kind: 'resolve' },
    { kind: 'frame' }, { kind: 'end', property: 'height' },
    { kind: 'toggle', key: 'a' }, { kind: 'frame' }, { kind: 'resolve' },
    { kind: 'frame' }, { kind: 'end', property: 'height' }
  ] },
  { id: 'prepare-motion-off', motion: 'prepare', globalMotion: false, actions: [
    { kind: 'toggle', key: 'a' }, { kind: 'frame' }, { kind: 'resolve' }, { kind: 'frame' }
  ] },
  { id: 'global-prefix', prefix: 'design' },
  { id: 'local-prefix', prefix: 'design', localPrefix: 'local-tree' },
  { id: 'rtl', rtl: true },
  { id: 'compact', compact: true },
  { id: 'title-height', titleHeight: 32 },
  { id: 'duration', duration: 0.5 },
  { id: 'virtual', height: 84, children: 40 },
  { id: 'virtual-disabled', height: 84, children: 12, virtual: false },
  { id: 'multiple-key-change', controlled: 'accept', actions: [
    { kind: 'keys', keys: ['a', 'a2'] }, { kind: 'frame' }
  ] }
];

export function treeMotionData(count?: number) {
  return [
    { key: 'a', title: 'Alpha', children: count
      ? Array.from({ length: count }, (_, index) => ({ key: `a${index}`, title: `Child ${index}` }))
      : [
        { key: 'a1', title: 'Alpha one' },
        { key: 'a2', title: 'Alpha two', children: [{ key: 'a21', title: 'Alpha nested' }] }
      ] },
    { key: 'b', title: 'Beta' }, { key: 'c', title: 'Gamma' }
  ];
}
