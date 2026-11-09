export function snapshotUploadIconRender() {
  const root = document.querySelector('[data-upload-icon-host]');
  if (!root) throw new Error('Upload icon root is missing');
  const icon = root.querySelector('[data-file-icon]');
  const holder = root.querySelector('.ant-upload-icon, .ant-upload-list-item-thumbnail');

  return {
    custom: icon ? { name: icon.getAttribute('data-file-icon'),
      listType: icon.getAttribute('data-icon-type'), status: icon.getAttribute('data-icon-status'),
      text: icon.textContent } : null,
    holderText: holder?.textContent || '',
    svg: holder?.querySelectorAll('svg').length || 0,
    images: holder?.querySelectorAll('img').length || 0
  };
}
