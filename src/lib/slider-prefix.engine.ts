import template from './vendor/slider-prefix.css.js';

// Prefix template следует native CSS; восстанавливаем aliases только у native-владельца.
const native = `
.ant-slider[data-ant-slider-native]{
  --ant-slider-control-size:calc(var(--ant-control-height-lg) / 4);
  --ant-slider-handle-size:var(--ant-slider-control-size);
  --ant-slider-handle-size-hover:calc(var(--ant-control-height-sm) / 2);
  --ant-slider-rail-bg:var(--ant-color-fill-tertiary);
  --ant-slider-rail-hover-bg:var(--ant-color-fill-secondary);
  --ant-slider-track-bg:var(--ant-color-primary-border);
  --ant-slider-track-hover-bg:var(--ant-color-primary-border-hover);
  --ant-slider-handle-color:var(--ant-color-primary-border);
  --ant-slider-handle-active-color:var(--ant-color-primary);
  --ant-slider-handle-active-outline-color:color-mix(in srgb,var(--ant-color-primary) 20%,transparent);
  --ant-slider-dot-border-color:var(--ant-color-border-secondary);
  --ant-slider-dot-active-border-color:var(--ant-color-primary-border);
  --ant-slider-track-bg-disabled:var(--ant-color-bg-container-disabled);
}`;
const rootStates = new Set(['', '-horizontal', '-vertical', '-rtl', '-disabled', '-lock',
  '-with-marks']);

/** ComponentCls и потомки меняются, CSS variables/marker и собственный Tooltip prefix остаются. */
export function getSliderPrefixCss(prefix: string) {
  if (prefix === 'ant-slider') return undefined;

  return `${template}${native}`
    .replace(/\.ant-slider(?!-css-var\b)([-\w]*)/g, (_, suffix: string) =>
      `.${prefix}${suffix}${rootStates.has(suffix) ? ':where([data-ant-slider-prefix])' : ''}`)
    .replace(/"ant-slider"/g, () => `"${prefix}"`)
    .replace(/" ant-slider"/g, () => `" ${prefix}"`)
    .replace(/<\/style/gi, '<\\/style');
}
