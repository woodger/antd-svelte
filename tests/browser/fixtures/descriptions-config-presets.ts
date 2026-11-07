import type { DescriptionsConfig } from 'antd-svelte';

export function descriptionsConfigProfile(
  name: string | undefined,
  local = false
): DescriptionsConfig {
  if (!name || name === 'empty') return {};
  const prefix = local ? 'local' : 'context';
  const keys = ['root', 'header', 'title', 'extra', 'label', 'content'];
  const classes = Object.fromEntries(keys.map(key => [key, `${prefix}-descriptions-${key}`]));
  const style = `color:${local ? '#873800' : '#722ed1'};padding-top:${local ? 25 : 15}px;`
    + `margin-top:${local ? 7 : 5}px`;
  const styles = Object.fromEntries(keys.map(key => [key, style]));
  const result: DescriptionsConfig = {
    class: `${prefix}-descriptions-plain`, classNames: classes, styles
  };

  if (name === 'functions') {
    result.classNames = ({ props }) => ({ ...classes,
      root: `${classes.root}-${props.column}-${props.size}-${props.items?.length ?? 0}` });
    result.styles = ({ props }) => ({ ...styles,
      root: `${styles.root};opacity:${props.column === 3 ? 0.65 : 0.8}` });
  }
  if (name === 'priority') {
    result.styles = { root: local ? 'background-color:#008000;margin-top:3px'
      : 'background-color:#ff0000;margin-top:1px;padding-top:1px' };
    result.style = local ? 'background-color:#ffff00'
      : 'background-color:#0000ff;margin-top:2px;padding-top:2px';
  }
  if (name === 'variables') {
    result.styles = undefined;
    result.style = `--ant-descriptions-content-color:${local ? '#873800' : '#003eb3'}`;
  }

  return result;
}
