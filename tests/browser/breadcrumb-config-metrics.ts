export function snapshotBreadcrumbConfiguration() {
  const root = document.querySelector('#breadcrumb-config-fixture .breadcrumb-config-main .ant-breadcrumb')!;
  const content = (node: Element) => (node.querySelector('.ant-breadcrumb-overlay-link')
    ?? node.querySelector('.ant-breadcrumb-link') ?? node).textContent!.trim();

  return Object.fromEntries(['root', 'item', 'separator'].map(key => {
    const nodes = key === 'root' ? [root] : [...root.querySelectorAll(`.ant-breadcrumb-${key}`)];

    return [key, nodes.map(node => {
      const css = getComputedStyle(node);

      return {
        tag: node.tagName.toLowerCase(),
        content: key === 'root' ? [...node.querySelector('ol')!.children].map(content)
          : [content(node)],
        links: [...node.querySelectorAll('a.ant-breadcrumb-link')]
          .map(link => link.getAttribute('href')),
        icons: [...node.querySelectorAll('[data-breadcrumb-icon]')].map(icon => ({
          source: icon.getAttribute('data-breadcrumb-icon'), text: icon.textContent
        })),
        separators: [...node.querySelectorAll('[data-breadcrumb-separator]')].map(separator => ({
          source: separator.getAttribute('data-breadcrumb-separator'), text: separator.textContent
        })),
        classes: [...node.classList].filter(name => /^(context|local)-/.test(name)),
        styles: Object.fromEntries(['color', 'background-color', 'padding-top', 'margin-top',
          'margin-left', 'margin-right', 'opacity', 'font-size']
          .map(name => [name, css.getPropertyValue(name)]))
      };
    })];
  }));
}
