export function snapshotTypographyTheme() {
  function properties(node: Element) {
    const style = getComputedStyle(node);
    return Object.fromEntries([
      'font-size', 'line-height', 'font-family', 'font-weight', 'color',
      'margin-top', 'margin-bottom', 'direction'
    ].map(name => [name, style.getPropertyValue(name)]));
  }

  return Object.fromEntries(
    [...document.querySelectorAll<HTMLElement>('[data-typography-theme]')].map(host => [
      host.dataset.typographyTheme!,
      Object.fromEntries(
        [...host.querySelectorAll<HTMLElement>('[data-typography-part]')].map(part => {
          const root = part.lastElementChild!;
          const textarea = root.querySelector('textarea');
          const code = root.querySelector('code');
          const heading = part.dataset.typographyPart === 'article' ? root.querySelector('h2') : null;
          return [part.dataset.typographyPart!, {
            root: properties(root),
            textarea: textarea ? properties(textarea) : null,
            code: code ? properties(code) : null,
            heading: heading ? properties(heading) : null
          }];
        })
      )
    ])
  );
}
