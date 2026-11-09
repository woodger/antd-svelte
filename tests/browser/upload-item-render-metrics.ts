export function snapshotUploadItemRender() {
  return [...document.querySelectorAll('[data-upload-item-host] .ant-upload-list-item-container')]
    .map(container => {
      const custom = container.querySelector('[data-custom-item]');

      return {
        custom: custom ? {
          id: custom.getAttribute('data-custom-item'),
          name: custom.getAttribute('data-item-file'),
          list: custom.getAttribute('data-item-list'),
          status: custom.getAttribute('data-item-status')
        } : null,
        origins: container.querySelectorAll('.ant-upload-list-item').length,
        names: [...container.querySelectorAll('.ant-upload-list-item-name')]
          .map(node => node.textContent),
        buttons: [...container.querySelectorAll('button[aria-label^="Custom"]')]
          .map(node => node.getAttribute('aria-label'))
      };
    });
}
