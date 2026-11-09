export function snapshotUploadConfig() {
  return [...document.querySelectorAll('[data-upload-config-host]')].map(host => {
    const root = host.querySelector('.ant-upload-wrapper')!;
    const control = root.querySelector('.ant-upload-select, .ant-upload-drag');
    const input = root.querySelector('input[type=file]');
    const parts = {
      root,
      trigger: control,
      list: root.querySelector('.ant-upload-list'),
      item: root.querySelector('.ant-upload-list-item')
    };

    return {
      accept: input?.getAttribute('accept'),
      parts: Object.fromEntries(Object.entries(parts).map(([key, node]) => [key, node ? {
        classes: [...node.classList].filter(value =>
          /^(?:config-|local-|raw-)/.test(value)).sort(),
        color: getComputedStyle(node).color,
        paddingTop: getComputedStyle(node).paddingTop,
        marginTop: getComputedStyle(node).marginTop,
        minHeight: getComputedStyle(node).minHeight
      } : null]))
    };
  });
}
