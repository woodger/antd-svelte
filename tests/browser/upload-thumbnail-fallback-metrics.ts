export function snapshotUploadThumbnailFallback() {
  const item = document.querySelector('[data-upload-thumbnail-host] .ant-upload-list-item')!;
  const thumbnail = item.querySelector('.ant-upload-list-item-thumbnail')!;
  const image = thumbnail.querySelector('img');
  const preview = item.querySelector('.ant-upload-list-item-actions a');

  return {
    thumbnail: {
      tag: thumbnail.tagName,
      href: thumbnail.getAttribute('href'),
      src: image?.getAttribute('src') ?? null,
      icons: [...thumbnail.querySelectorAll('svg')].map(node => ({
        viewBox: node.getAttribute('viewBox'),
        paths: [...node.querySelectorAll('path')].map(path => path.getAttribute('d'))
      }))
    },
    previewHref: preview?.getAttribute('href') ?? null,
    previewCalls: Number(document.querySelector('[data-preview-file-calls]')?.textContent ?? '0')
  };
}
