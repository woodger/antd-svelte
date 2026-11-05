export function snapshotImageTheme({ id, prefix = 'ant' }: { id: string; prefix?: string }) {
  const thumbnail = document.querySelector<HTMLElement>(`[data-image-theme="${id}"] .ant-image`)!;
  const viewer = document.querySelector<HTMLElement>(`.image-theme-preview-${id}.ant-image-preview`)!;
  const properties = [
    '--ant-image-z-index-popup',
    '--ant-image-preview-operation-color',
    '--ant-image-preview-operation-hover-color',
    '--ant-image-preview-operation-color-disabled',
    '--ant-image-preview-operation-size',
    '--ant-image-progress-animation-duration'
  ];
  const variables = (node: HTMLElement) => Object.fromEntries(properties.map(name => [
    name,
    getComputedStyle(node).getPropertyValue(name.replace('--ant-', `--${prefix}-`)).trim().replace(/,\s*/g, ',')
  ]));
  const metrics = (selector: string) => {
    const element = viewer.querySelector<HTMLElement>(selector);
    if (!element) return null;
    const css = getComputedStyle(element);

    return {
      fontSize: css.fontSize,
      color: css.color,
      background: css.backgroundColor,
      padding: css.padding,
      gap: css.gap
    };
  };
  const css = getComputedStyle(viewer);
  const footer = viewer.querySelector<HTMLElement>('.ant-image-preview-footer')!;
  const cover = thumbnail.querySelector<HTMLElement>('.ant-image-cover');

  return {
    thumbnail: {
      variables: variables(thumbnail),
      coverColor: cover ? getComputedStyle(cover).color : null
    },
    viewer: {
      variables: variables(viewer),
      zIndex: css.zIndex,
      footerBottom: getComputedStyle(footer).bottom,
      footerGap: getComputedStyle(footer).gap,
      actions: metrics('.ant-image-preview-actions'),
      enabled: metrics('.ant-image-preview-actions-action-zoomIn'),
      disabled: metrics('.ant-image-preview-actions-action-zoomOut'),
      close: metrics('.ant-image-preview-close'),
      previous: metrics('.ant-image-preview-switch-prev'),
      next: metrics('.ant-image-preview-switch-next'),
      maskBackground: getComputedStyle(viewer.querySelector('.ant-image-preview-mask')!).backgroundColor
    }
  };
}
