export function snapshotUploadLinkProps() {
  const host = document.querySelector('[data-upload-link-host]');
  const name = host?.querySelector('.ant-upload-list-item-name, [data-file-link]');
  const preview = host?.querySelector('.ant-upload-list-item-thumbnail');
  const actions = host?.querySelector('.ant-upload-list-item-actions a');

  return {
    name: name ? {
      tag: name.tagName,
      text: name.textContent,
      class: name.getAttribute('class')?.split(/\s+/)
        .filter(value => !value.startsWith('svelte-') && !/^s-[\w-]{12}$/.test(value))
        .join(' ') ?? null,
      title: name.getAttribute('title'),
      href: name.getAttribute('href'),
      target: name.getAttribute('target'),
      rel: name.getAttribute('rel'),
      download: name.getAttribute('download'),
      ariaLabel: name.getAttribute('aria-label'),
      data: name.getAttribute('data-file-link'),
      color: name.getAttribute('style') ? getComputedStyle(name).color : null
    } : null,
    thumbnail: preview?.getAttribute('data-file-link') ?? null,
    previewAction: actions?.getAttribute('data-file-link') ?? null
  };
}
