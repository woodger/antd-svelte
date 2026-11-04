import template from './vendor/skeleton-prefix.css.js';

const rootStates = new Set(['', '-element', '-active', '-block', '-round', '-rtl', '-with-avatar']);

/** Marker и variables общие; root declarations ограничены своим Skeleton host. */
export function getSkeletonPrefixCss(prefix: string) {
  if (prefix === 'ant-skeleton') return undefined;

  return template
    .replace(/\.ant-skeleton([-\w]*)/g, (_, suffix: string) => suffix === '-css-var'
      ? '.ant-skeleton-css-var:where([data-ant-skeleton-prefix])'
      : `.${prefix}${suffix}${rootStates.has(suffix) ? ':where([data-ant-skeleton-prefix])' : ''}`)
    .replace(/"ant-skeleton"/g, () => `"${prefix}"`)
    .replace(/" ant-skeleton"/g, () => `" ${prefix}"`)
    .replace(/<\/style/gi, '<\\/style');
}
