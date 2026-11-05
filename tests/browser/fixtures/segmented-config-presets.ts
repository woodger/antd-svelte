import type { SegmentedConfig, SegmentedSemanticSlots } from 'antd-svelte';
import reference from './ant-design-segmented-config-reference.json';

export type SegmentedConfigSample = typeof reference.cases[number];

export function segmentedConfigRecord(
  mode: string | undefined,
  side: 'context' | 'local' | 'nested' | 'sibling'
): SegmentedConfig | undefined {
  if (!mode) return undefined;
  if (mode === 'empty') return { classNames: {}, styles: {} };
  const padding = { context: 4, local: 8, nested: 12, sibling: 14 }[side]!;
  const classes: SegmentedSemanticSlots = {
    root: `segcfg-${side}-root`, item: `segcfg-${side}-item`,
    label: `segcfg-${side}-label`, icon: `segcfg-${side}-icon`
  };
  const styles: SegmentedSemanticSlots = {
    root: `padding:${padding}px;background:${side === 'local' ? '#fff7e6' : '#e6f4ff'}`,
    item: `color:${side === 'local' ? '#722ed1' : '#873800'}`,
    label: `padding-inline:${padding + 9}px`,
    icon: `font-size:${padding + 15}px`
  };
  const result: SegmentedConfig = { class: `segcfg-${side}-class`, classNames: classes, styles };
  if (mode.startsWith('function')) {
    result.classNames = ({ props }) => ({
      ...classes,
      root: `${classes.root} meta-size-${props.size ?? 'auto'} meta-shape-${props.shape} meta-count-${props.options.length}`
    });
    result.styles = ({ props }) => ({
      ...styles,
      root: `padding:${props.shape === 'round' ? padding + 1 : padding}px;background:${side === 'local' ? '#fff7e6' : '#e6f4ff'}`
    });
  }
  if (mode === 'undefined') {
    result.classNames = () => undefined;
    result.styles = () => undefined;
  }
  if (mode.endsWith('-style')) result.style = `padding:${padding + 2}px`;
  return result;
}
