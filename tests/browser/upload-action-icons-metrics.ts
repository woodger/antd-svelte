export function snapshotUploadActionIcons() {
  return [...document.querySelectorAll('[data-upload-actions-host] .ant-upload-list-item')]
    .map(item => [...item.querySelectorAll('.ant-upload-list-item-actions > a, .ant-upload-list-item-actions > button')]
      .map(control => ({
        tag: control.tagName,
        label: control.getAttribute('aria-label'),
        disabled: control.hasAttribute('disabled'),
        text: control.textContent?.trim() ?? '',
        custom: [...control.querySelectorAll('[data-custom-action]')].map(node => ({
          action: node.getAttribute('data-custom-action'),
          file: node.getAttribute('data-action-file')
        })),
        icons: [...control.querySelectorAll('svg')].map(node => ({
          viewBox: node.getAttribute('viewBox'),
          paths: [...node.querySelectorAll('path')].map(path => path.getAttribute('d'))
        }))
      })));
}
