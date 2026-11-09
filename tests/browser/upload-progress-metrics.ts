export function snapshotUploadProgress() {
  const item = document.querySelector('[data-upload-progress-host] .ant-upload-list-item');
  const root = item?.querySelector('.ant-progress');
  if (!root) return null;
  const rail = root.querySelector('.ant-progress-rail');
  const indicator = root.querySelector('.ant-progress-indicator');
  const icon = indicator?.querySelector('svg');
  const read = (node: Element | null, keys: string[]) => node && Object.fromEntries(
    keys.map(key => [key, getComputedStyle(node).getPropertyValue(key)])
  );

  return {
    classes: [...root.classList].filter(value =>
      !/^(?:svelte-|s-|css-)|-css-var$/.test(value)).sort(),
    label: root.getAttribute('aria-label'),
    labelledby: root.getAttribute('aria-labelledby'),
    value: root.getAttribute('aria-valuenow'),
    rail: read(rail, ['height', 'background-color', 'border-radius']),
    tracks: [...root.querySelectorAll('.ant-progress-track, .ant-progress-steps-item')]
      .map(node => read(node, ['height', 'width', 'background-color', 'background-image',
        'border-radius'])),
    indicator: indicator ? {
      text: indicator.textContent,
      icon: icon ? {
        viewBox: icon.getAttribute('viewBox'),
        paths: [...icon.querySelectorAll('path')].map(node => node.getAttribute('d'))
      } : null
    } : null
  };
}
