export function snapshotAffixTheme() {
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
      fixed: content.classList.contains('ant-affix'),
      topOffset: content.classList.contains('ant-affix')
        ? content.getBoundingClientRect().top - scroll.getBoundingClientRect().top : null,
      placeholder: placeholder ? [placeholder.style.width, placeholder.style.height] : null,
      fields: root.querySelectorAll('input').length
    };
  }
  return result;
}
