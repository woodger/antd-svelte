export function snapshotEmptySource(prefix = 'ant-empty') {
  const root = document.querySelector('[data-empty-source-frame]')!
    .querySelector<HTMLElement>(`.${prefix}`)!;
  const classes = (node: Element) => [...node.classList].filter(name =>
    !/^svelte-|^s-[\w-]{12}$|^css-|^ant-empty-css-var$|^empty-source-scope$/.test(name)
  ).sort();
  const style = (node: Element, keys: string[]) => Object.fromEntries(keys.map(key =>
    [key, getComputedStyle(node).getPropertyValue(key)]
  ));
  const part = (name: string) => root.querySelector<HTMLElement>(`.${prefix}-${name}`);
  const image = part('image');
  const description = part('description');
  const footer = part('footer');
  const svg = image?.querySelector('svg');
  const img = image?.querySelector('img');
  const slot = (node: HTMLElement | null) => node ? {
    classes: classes(node),
    text: node.textContent!.trim().replace(/\s+/g, ' '),
    style: style(node, ['padding-top', 'margin-top', 'color', 'background-color'])
  } : null;

  return {
    root: {
      classes: classes(root),
      style: style(root, ['font-size', 'line-height', 'padding-top', 'margin-inline-start',
        'margin-top', 'color', 'background-color'])
    },
    image: image ? {
      classes: classes(image),
      style: style(image, ['height', 'padding-top', 'opacity', 'background-color']),
      ...(svg ? {} : { text: image.textContent!.trim() })
    } : null,
    description: slot(description),
    footer: slot(footer),
    img: img ? {
      src: img.getAttribute('src'), alt: img.getAttribute('alt'), draggable: img.draggable
    } : null,
    svg: svg ? {
      width: svg.getAttribute('width'), height: svg.getAttribute('height'),
      viewBox: svg.getAttribute('viewBox'), title: svg.querySelector('title')?.textContent ?? null,
      shapes: [...svg.querySelectorAll('path,ellipse,circle,g')].map(node => ({
        tag: node.tagName,
        attributes: Object.fromEntries([...node.attributes].filter(attribute =>
          !['class', 'aria-hidden', 'focusable'].includes(attribute.name)
        ).map(attribute => [attribute.name, attribute.value]))
      }))
    } : null
  };
}
