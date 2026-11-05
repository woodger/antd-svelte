export function snapshotRateTheme() {
  return Object.fromEntries([...document.querySelectorAll<HTMLElement>('[data-rate-theme]')]
    .map(host => {
      const root = host.querySelector<HTMLElement>('.ant-rate')!;
      const stars = [...root.querySelectorAll<HTMLElement>('.ant-rate-star')];
      const css = getComputedStyle(root);

      return [host.dataset.rateTheme!, {
        root: {
          color: css.color,
          fontSize: css.fontSize,
          lineHeight: css.lineHeight,
          direction: css.direction,
          width: root.getBoundingClientRect().width,
          height: root.getBoundingClientRect().height
        },
        stars: stars.map(star => ({
          width: star.getBoundingClientRect().width,
          height: star.getBoundingClientRect().height,
          marginEnd: getComputedStyle(star).marginInlineEnd,
          cursor: getComputedStyle(star).cursor
        })),
        layers: [0, 2, 3].map(index => {
          const star = stars[index];
          const first = getComputedStyle(star.querySelector('.ant-rate-star-first')!);
          const second = getComputedStyle(star.querySelector('.ant-rate-star-second')!);

          return { firstColor: first.color, firstOpacity: first.opacity, secondColor: second.color };
        })
      }] satisfies [string, unknown];
    }));
}

export function snapshotRateThemeInteraction(id = 'normal') {
  const root = document.querySelector(`[data-rate-theme="${id}"] .ant-rate`)!;
  const control = root.querySelectorAll('[role="radio"]')[3];
  const css = getComputedStyle(control);

  return {
    transform: css.transform,
    outlineColor: css.outlineColor,
    outlineWidth: css.outlineWidth,
    outlineStyle: css.outlineStyle
  };
}
