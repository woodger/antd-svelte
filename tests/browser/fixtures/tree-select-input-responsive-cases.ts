export interface TreeSelectInputResponsiveSample {
  id: 'input' | 'textarea' | 'wrapped-dom-ref' | 'composite-ref' | 'fragment';
  tag: 'input' | 'textarea';
  prefix?: boolean;
}
export interface TreeSelectInputResponsiveAction {
  type: 'resize' | 'fill' | 'clear' | 'prefix-resize';
  width?: number;
  text?: string;
}
export const treeSelectInputResponsiveSamples: readonly TreeSelectInputResponsiveSample[] = [
  { id: 'input', tag: 'input' },
  { id: 'textarea', tag: 'textarea' },
  { id: 'wrapped-dom-ref', tag: 'input', prefix: true },
  { id: 'composite-ref', tag: 'input', prefix: true },
  { id: 'fragment', tag: 'input', prefix: true }
];
export function treeSelectInputResponsiveActions(sample: TreeSelectInputResponsiveSample): TreeSelectInputResponsiveAction[] {
  return [
    { type: 'resize', width: 200 }, { type: 'fill', text: 'BetaWWW12345' }, { type: 'clear' },
    { type: 'resize', width: 160 }, { type: 'resize', width: 260 },
    ...(sample.prefix ? [{ type: 'prefix-resize' as const, width: 96 }] : [])
  ];
}
