export function snapshotMasonryPrefix() {
  return Object.fromEntries(
    [...document.querySelectorAll<HTMLElement>('[data-masonry-prefix-scope]')].map(scope => {
      const root = scope.firstElementChild!;
      const style = getComputedStyle(root);
      const bounds = root.getBoundingClientRect();
      const classes = (node: Element) => [...node.classList].filter(name =>
        !name.startsWith('css-') && !name.endsWith('-css-var')
          && !name.endsWith('-source-theme')).sort();
      return [scope.dataset.masonryPrefixScope, {
        classes: classes(root),
        root: {
          width: bounds.width,
          height: bounds.height,
          direction: style.direction,
          fontSize: style.fontSize,
          fontFamily: style.fontFamily,
          display: style.display,
          position: style.position,
          flexDirection: style.flexDirection,
          flexWrap: style.flexWrap
        },
        items: [...root.children].map(item => {
          const box = item.getBoundingClientRect();
          const css = getComputedStyle(item);
          return {
            classes: classes(item),
            width: box.width,
            height: box.height,
            x: box.x - bounds.x,
            y: box.y - bounds.y,
            top: css.top,
            inlineStart: css.insetInlineStart,
            boxSizing: css.boxSizing,
            variables: [...(item as HTMLElement).style]
              .filter(name => name.endsWith('-masonry-item-width'))
              .map(name => [name, (item as HTMLElement).style.getPropertyValue(name)]),
            transition: css.transition,
            input: item.querySelector('input')!.value
          };
        })
      }];
    }));
}
