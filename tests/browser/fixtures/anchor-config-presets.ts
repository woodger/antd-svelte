import type { AnchorConfig, AnchorSlots } from 'antd-svelte';

export function anchorConfigProfile(name?: string, local = false): AnchorConfig {
  if (!name || name === 'empty') return {};
  const prefix = local ? 'local' : 'context';
  const classes: AnchorSlots = Object.fromEntries(
    ['root', 'item', 'itemTitle', 'indicator'].map(key => [key, `${prefix}-anchor-${key}`])
  );
  const styles: AnchorSlots = {
    root: `color:${local ? '#873800' : '#722ed1'};margin-top:${local ? 7 : 5}px`,
    item: `padding-top:${local ? 13 : 9}px`,
    itemTitle: `color:${local ? '#873800' : '#722ed1'};padding-top:${local ? 8 : 4}px;padding-bottom:${local ? 8 : 4}px`,
    indicator: `background-color:${local ? '#873800' : '#722ed1'}`
  };
  const result: AnchorConfig = { class: `${prefix}-anchor-plain`, classNames: classes, styles };

  if (name === 'functions') {
    result.classNames = ({ props }) => ({ ...classes,
      root: `${classes.root}-${props.direction}` });
    result.styles = ({ props }) => ({ ...styles,
      root: `${styles.root};padding-top:${props.direction === 'horizontal' ? 12 : 8}px` });
  }
  if (name === 'priority') {
    result.styles = { root: local ? 'background-color:#008000;margin-top:3px'
      : 'background-color:#ff0000;margin-top:1px;padding-top:1px' };
    result.style = local ? 'background-color:#ffff00;max-height:223px'
      : 'background-color:#0000ff;margin-top:2px;padding-top:2px;max-height:221px';
  }
  if (name === 'plain') {
    result.classNames = undefined;
    result.styles = undefined;
    result.style = 'color:#722ed1;margin-top:5px';
  }
  if (name === 'variables') {
    result.styles = undefined;
    result.style = `--ant-anchor-link-padding-block:${local ? 15 : 11}px`;
  }
  if (name === 'indicator') result.styles = { ...styles,
    indicator: `background-color:${local ? '#873800' : '#722ed1'};top:333px;height:444px;left:555px;width:7px;opacity:${local ? 0.8 : 0.6}` };

  return result;
}
