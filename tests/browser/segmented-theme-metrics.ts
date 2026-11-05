export function snapshotSegmentedTheme() {
  return Object.fromEntries([...document.querySelectorAll<HTMLElement>('[data-segmented-theme]')]
    .map(host => {
      const root = host.querySelector<HTMLElement>('.ant-segmented')!;
      const items = root.querySelectorAll('label');
      const rootStyle = getComputedStyle(root);
      const selected = getComputedStyle(items[0]);
      const item = getComputedStyle(items[1]);
      const disabled = getComputedStyle(items[2]);
      const labelNode = items[1].querySelector('.ant-segmented-item-label')!;
      const label = getComputedStyle(labelNode);

      return [host.dataset.segmentedTheme, {
        root: {
          padding: rootStyle.padding,
          background: rootStyle.backgroundColor,
          color: rootStyle.color,
          radius: rootStyle.borderRadius,
          display: rootStyle.display,
          direction: rootStyle.direction
        },
        groupDirection: getComputedStyle(root.querySelector('.ant-segmented-group')!).flexDirection,
        label: {
          minHeight: label.minHeight,
          lineHeight: label.lineHeight,
          padding: label.padding,
          fontSize: label.fontSize,
          width: items[1].getBoundingClientRect().width
        },
        selected: {
          color: selected.color,
          background: selected.backgroundColor,
          radius: selected.borderRadius,
          shadow: selected.boxShadow
        },
        item: { color: item.color, radius: item.borderRadius },
        disabledColor: disabled.color
      }];
    }));
}

export function snapshotSegmentedState({ id, index }: { id: string; index: number; }) {
  const node = document.querySelector(`[data-segmented-theme="${id}"]`)!
    .querySelectorAll('label')[index];
  const style = getComputedStyle(node);
  const after = getComputedStyle(node, '::after');

  return { color: style.color, background: after.backgroundColor, opacity: after.opacity };
}
