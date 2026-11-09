export function snapshotUploadSemantics() {
  const host = document.querySelector('[data-upload-semantic-host]');
  const measureTokens = host?.hasAttribute('data-measure-tokens');
  const root = document.querySelector('[data-upload-semantic-host] .ant-upload-wrapper');
  const parts = {
    root,
    trigger: root?.querySelector('.ant-upload-select, .ant-upload-drag') ?? null,
    list: root?.querySelector('.ant-upload-list') ?? null,
    item: root?.querySelector('.ant-upload-list-item') ?? null
  };

  return Object.fromEntries(Object.entries(parts).map(([key, node]) => [key, node ? {
    classes: [...node.classList].filter(value =>
      /^(?:custom-|props-|raw-|local-)/.test(value)).sort(),
    styles: Object.fromEntries(['color', 'background-color', 'padding-top',
      'margin-top', 'min-height', 'opacity'].map(property =>
      [property, getComputedStyle(node).getPropertyValue(property)])),
    tokenSize: measureTokens
      ? getComputedStyle(node).getPropertyValue('--ant-upload-picture-card-size').trim() : null,
    triggerHeight: measureTokens && key === 'trigger' ? getComputedStyle(node).height : null
  } : null]));
}
