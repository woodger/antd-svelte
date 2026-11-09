export function snapshotRatePrefix() {
  const style = (node: Element, keys: string[]) => {
    const css = getComputedStyle(node);

    return Object.fromEntries(keys.map(key => [key, css.getPropertyValue(key)]));
  };

  return Object.fromEntries(
    [...document.querySelectorAll<HTMLElement>('[data-rate-prefix-scope]')].map(host => {
      const root = host.querySelector<HTMLElement>('.fixture-rate-prefix')!;
      const box = root.getBoundingClientRect();
      const controls = [...root.querySelectorAll<HTMLElement>('[role="radio"]')];

      return [host.dataset.ratePrefixScope!, {
        classes: [...root.classList].filter(value => !/^(?:css-|svelte-|s-|fixture-)|-css-var$|-sourcetheme$/.test(value)).sort(),
        style: style(root, ['display', 'font-size', 'line-height', 'color', 'direction', 'opacity',
          'margin-top', 'padding-top', 'list-style-type']),
        box: [box.width, box.height],
        stars: controls.map(control => {
          const star = control.closest('li')!;
          const rect = star.getBoundingClientRect();
          const layers = [...control.children];

          return {
            classes: [...star.classList].filter(value => !/^(?:svelte-|s-)/.test(value)).sort(),
            checked: control.getAttribute('aria-checked'),
            box: [rect.x - box.x, rect.y - box.y, rect.width, rect.height],
            style: style(star, ['display', 'cursor', 'margin-inline-end']),
            layers: layers.map(node => ({
              style: style(node, ['color', 'opacity', 'width', 'overflow', 'position']),
              text: node.textContent,
              infoPrefix: node.querySelector('[data-character-prefix]')
                ?.getAttribute('data-character-prefix') ?? null
            }))
          };
        })
      }];
    })
  );
}
