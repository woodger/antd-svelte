import type { BreadcrumbConfig, BreadcrumbProps, BreadcrumbSlots } from 'antd-svelte';

export function breadcrumbConfigProfile(
  name?: string,
  local = false,
  nodes: Pick<BreadcrumbConfig, 'separator' | 'dropdownIcon'> = {}
): BreadcrumbConfig {
  if (!name || name === 'empty') return {};
  const prefix = local ? 'local' : 'context';
  const classes: BreadcrumbSlots = Object.fromEntries(
    ['root', 'item', 'separator'].map(key => [key, `${prefix}-breadcrumb-${key}`])
  );
  const styles: BreadcrumbSlots = Object.fromEntries(['root', 'item', 'separator'].map(key =>
    [key, `color:${local ? '#873800' : '#722ed1'};padding-top:${local ? 9 : 5}px;margin-top:${local ? 7 : 3}px`]
  ));
  const result: BreadcrumbConfig = {
    class: `${prefix}-breadcrumb-plain`, classNames: classes, styles
  };

  if (name === 'functions') {
    result.separator = local ? '|' : '::';
    result.dropdownIcon = local ? 'L' : 'C';
    const classNames: NonNullable<BreadcrumbProps['classNames']> = ({ props }) => ({ ...classes,
      root: `${classes.root}-${props.items!.length}-${props.separator === '::' ? 'configured' : 'other'}` });
    result.classNames = classNames;
    result.styles = ({ props }) => ({ ...styles,
      root: `${styles.root};opacity:${props.items!.length === 2 ? 0.65 : 0.8}` });
  }
  if (name === 'priority') {
    result.styles = { root: local ? 'background-color:#008000;margin-top:3px'
      : 'background-color:#ff0000;margin-top:1px;padding-top:1px' };
    result.style = local ? 'background-color:#ffff00'
      : 'background-color:#0000ff;margin-top:2px;padding-top:2px';
  }
  if (name === 'defaults') {
    result.separator = local ? '|' : '::';
    result.dropdownIcon = local ? 'L' : 'C';
  }
  if (name === 'nodes') Object.assign(result, nodes);
  if (name === 'variables') {
    result.styles = undefined;
    result.style = `--ant-breadcrumb-separator-color:${local ? '#873800' : '#003eb3'}`;
  }

  return result;
}
