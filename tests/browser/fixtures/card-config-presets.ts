import type { CardConfig, CardMetaConfig } from 'antd-svelte';

function profile(kind: 'card' | 'meta', local: boolean) {
  const prefix = local ? 'local' : 'context';
  const keys = kind === 'card' ? ['root', 'header', 'body', 'title', 'extra', 'actions', 'cover']
    : ['root', 'section', 'avatar', 'title', 'description'];
  const styles = `color:${local ? '#873800' : '#722ed1'};padding-top:${local ? 23 : 19}px;`
    + `margin-top:${local ? 7 : 5}px`;

  return {
    class: `${prefix}-${kind}-plain`,
    classNames: Object.fromEntries(keys.map(key => [key, `${prefix}-${kind}-${key}`])),
    styles: Object.fromEntries(keys.map(key => [key, styles]))
  };
}

export function cardConfigProfile(name: string | undefined, local = false): CardConfig {
  if (!name || name === 'empty') return {};
  const base = profile('card', local);
  const result: CardConfig = { ...base, variant: local ? undefined : 'borderless' };

  if (name === 'functions') {
    result.classNames = ({ props }) => ({ ...base.classNames,
      root: `${base.classNames.root}-${props.size}-${props.variant}` });
    result.styles = ({ props }) => ({ ...base.styles,
      root: `${base.styles.root};opacity:${props.size === 'small' ? 0.65 : 0.8}` });
  }
  if (name === 'priority') {
    result.styles = { root: local ? 'background-color:#008000;margin-top:3px'
      : 'background-color:#ff0000;margin-top:1px;padding-top:1px' };
    result.style = local ? 'background-color:#ffff00'
      : 'background-color:#0000ff;margin-top:2px;padding-top:2px';
  }
  if (name === 'variables') {
    result.styles = undefined;
    result.style = `--ant-card-body-padding:${local ? 45 : 41}px`;
  }

  return result;
}

export function cardMetaConfigProfile(name: string | undefined, local = false): CardMetaConfig {
  if (!name || name === 'empty') return {};
  const base = profile('meta', local);
  const result: CardMetaConfig = { ...base };

  if (name === 'functions') {
    result.classNames = ({ props }) => ({ ...base.classNames,
      root: `${base.classNames.root}-${props.title ? 'titled' : 'untitled'}` });
    result.styles = () => ({ ...base.styles, root: `${base.styles.root};opacity:0.8` });
  }
  if (name === 'priority') {
    result.styles = { root: local ? 'background-color:#008000;margin-top:3px'
      : 'background-color:#ff0000;margin-top:1px;padding-top:1px' };
    result.style = local ? 'background-color:#ffff00'
      : 'background-color:#0000ff;margin-top:2px;padding-top:2px';
  }
  if (name === 'variables') {
    result.styles = undefined;
    result.style = `--ant-margin-xs:${local ? 15 : 13}px`;
  }

  return result;
}
