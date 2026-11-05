export function snapshotResultSource(prefix = 'ant-result') {
  const frame = document.querySelector('[data-result-source-frame]')!;
  const root = frame.querySelector<HTMLElement>(`.${prefix}`);
  const classes = (node: Element) => [...node.classList].filter(name =>
    !/^svelte-|^s-[\w-]{12}$|^css-|^ant-result-css-var$|^result-source-scope$/.test(name)
  ).sort();
  const style = (node: Element, keys: string[]) => Object.fromEntries(keys.map(key =>
    [key, getComputedStyle(node).getPropertyValue(key)]
  ));
  const text = (node: Element) => [...node.childNodes].filter(child =>
    child.nodeType === Node.TEXT_NODE || !(child instanceof SVGElement)
  ).map(child => child.textContent).join('').trim().replace(/\s+/g, ' ');
  const slot = (name: string) => {
    const node = root?.querySelector<HTMLElement>(`.${prefix}-${name}`);

    return node ? {
      classes: classes(node),
      text: text(node),
      style: style(node, ['color', 'font-size', 'line-height', 'padding-top',
        'margin-top', 'margin-bottom', 'background-color', 'text-align'])
    } : null;
  };
  const svg = frame.querySelector('svg');
  const glyph = root?.querySelector('.anticon');

  return {
    root: root ? {
      classes: classes(root),
      style: style(root, ['padding-top', 'padding-bottom', 'background-color', 'color', 'direction']),
      data: root.getAttribute('data-owner'),
      role: root.getAttribute('role'),
      description: root.getAttribute('aria-description')
    } : null,
    title: slot('title'),
    subTitle: slot('subtitle'),
    icon: slot('icon'),
    extra: slot('extra'),
    body: slot('body'),
    glyph: glyph ? {
      classes: classes(glyph),
      fontSize: getComputedStyle(glyph).fontSize
    } : null,
    svg: svg ? {
      width: glyph ? getComputedStyle(svg).width : svg.getAttribute('width'),
      height: glyph ? getComputedStyle(svg).height : svg.getAttribute('height'),
      glyphViewBox: glyph ? svg.getAttribute('viewBox') : null,
      standalone: root ? null : {
        title: svg.querySelector('title')?.textContent ?? null,
        ariaHidden: svg.getAttribute('aria-hidden'),
        focusable: svg.getAttribute('focusable'),
        viewBox: svg.getAttribute('viewBox')
      },
      shapes: [...svg.querySelectorAll('path,ellipse,circle,g')].map(node => ({
        tag: node.tagName,
        attributes: Object.fromEntries([...node.attributes].filter(attribute =>
          !['class', 'aria-hidden', 'focusable'].includes(attribute.name)
        ).map(attribute => [attribute.name, attribute.name === 'd'
          // CSSOM разбирает compact arc flags и сохраняет полную геометрию без своего SVG parser.
          ? getComputedStyle(node).getPropertyValue('d') : attribute.value]))
      }))
    } : null
  };
}
