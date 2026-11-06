export function snapshotAffixTheme(localPrefix?: string | void) {
  const prefix = localPrefix || 'ant-affix';
  const result: Record<string, unknown> = {};
  for (const host of document.querySelectorAll<HTMLElement>('[data-affix-theme]')) {
    const root = host.querySelector<HTMLElement>('.theme-affix')!;
    const content = root.lastElementChild as HTMLElement;
    const scroll = host.querySelector<HTMLElement>('[data-affix-scroll]')!;
    const css = getComputedStyle(content);
    const placeholder = root.querySelector<HTMLElement>(':scope > [aria-hidden="true"]');
    result[host.dataset.affixTheme!] = {
      content: Object.fromEntries([
        'position', 'z-index', 'font-family', 'font-size', 'line-height',
        'color', 'box-sizing', 'width', 'height', 'direction'
      ].map(name => [name, css.getPropertyValue(name)])),
      fixed: content.classList.contains(prefix) || content.classList.contains('ant-affix'),
      topOffset: content.classList.contains(prefix) || content.classList.contains('ant-affix')
        ? content.getBoundingClientRect().top - scroll.getBoundingClientRect().top : null,
      placeholder: placeholder ? [placeholder.style.width, placeholder.style.height] : null,
      fields: root.querySelectorAll('input').length
    };
  }
  return result;
}

export function snapshotAffixConfiguration(localPrefix?: string | void) {
  const prefix = localPrefix || 'ant-affix';
  return Object.fromEntries([...document.querySelectorAll<HTMLElement>('[data-affix-theme]')]
    .map(host => {
      const root = host.querySelector<HTMLElement>('.theme-affix')!;
      const content = root.lastElementChild!;
      const css = getComputedStyle(root);
      const defaultPrefix = content.classList.contains('ant-affix');
      return [host.dataset.affixTheme!, {
        className: root.className,
        opacity: css.opacity,
        outlineOffset: css.outlineOffset,
        // Общий native CSS marker может совпасть с custom prefix соседнего компонента.
        localPrefix: content.classList.contains(prefix) && (prefix === 'ant-affix' || !defaultPrefix),
        defaultPrefix,
        rootClass: content.classList.contains('theme-affix-fixed')
      }];
    }));
}
