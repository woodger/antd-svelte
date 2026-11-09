export function snapshotImagePrefix() {
  const host = document.querySelector('[data-image-prefix-scope]')!;
  const thumbnail = host.querySelector<HTMLElement>('.fixture-image-prefix')!;
  const viewer = [...document.querySelectorAll<HTMLElement>('[role="dialog"],dialog')]
    .find(node => node.querySelector('img') && node.getClientRects().length) ?? null;
  const previewPrefix = viewer ? [...viewer.classList].find(value => value.endsWith('-preview')) : '';
  function css(node: Element | null, keys: string[]) {
    if (!node) return null;
    const style = getComputedStyle(node);

    return Object.fromEntries(keys.map(key => [key, style.getPropertyValue(key)]));
  }
  function part(suffix: string) {
    return viewer?.querySelector(`[class~="${previewPrefix}${suffix}"]`) ?? null;
  }
  const font = ['font-family', 'font-size', 'color'];
  const box = ['width', 'height', 'padding-top', 'padding-right', 'padding-bottom',
    'padding-left', 'background-color', 'border-radius'];
  const imagePrefix = [...thumbnail.classList].find(value =>
    !/^(?:css-|svelte-|s-|fixture-|image-trigger$)|-css-var$|-sourcetheme$/.test(value)
  )!;
  const cover = thumbnail.querySelector(`[class~="${imagePrefix}-cover"]`);

  return {
    thumbnail: css(thumbnail, [...font, ...box, 'position', 'display']),
    image: css(thumbnail.querySelector('img'), ['width', 'height', 'vertical-align', 'border-radius']),
    cover: css(cover, [...font, 'position', 'opacity', 'display', 'justify-content']),
    viewer: viewer ? {
      zIndex: getComputedStyle(viewer).zIndex,
      image: css(part('-img'), ['max-width', 'max-height', 'cursor', 'transform']),
      mask: css(part('-mask'), ['display', 'background-color', 'backdrop-filter']),
      footer: css(part('-footer'), ['bottom', 'gap']),
      actions: css(part('-actions'), [...font, 'padding', 'gap', 'background-color', 'border-radius']),
      enabled: css(part('-actions-action-zoomIn'), ['font-size', 'color', 'padding', 'background-color']),
      disabled: css(part('-actions-action-zoomOut'), ['font-size', 'color', 'padding', 'background-color']),
      close: css(part('-close'), [...font, 'padding', 'top', 'inset-inline-end', 'background-color']),
      previous: css(part('-switch-prev'), ['color', 'font-size', 'padding', 'background-color']),
      next: css(part('-switch-next'), ['color', 'font-size', 'padding', 'background-color']),
      progress: part('-progress')?.textContent ?? null
    } : null
  };
}
