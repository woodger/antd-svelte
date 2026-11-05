export function snapshotStatisticTheme() {
  return Object.fromEntries([...document.querySelectorAll<HTMLElement>('[data-statistic-theme]')]
    .map(root => {
      const select = (selector: string) => root.querySelector<HTMLElement>(selector)!;
      const style = (selector: string) => getComputedStyle(select(selector));
      const content = select('.ant-statistic-content');
      const skeleton = select('.ant-statistic-skeleton');

      return [root.dataset.statisticTheme, {
        direction: getComputedStyle(root).direction,
        headerPadding: style('.ant-statistic-header').paddingBottom,
        title: {
          fontSize: style('.ant-statistic-title').fontSize,
          color: style('.ant-statistic-title').color
        },
        content: content ? {
          fontSize: getComputedStyle(content).fontSize,
          color: getComputedStyle(content).color,
          valueDirection: style('.ant-statistic-content-value').direction,
          prefix: {
            fontSize: style('.ant-statistic-content-prefix').fontSize,
            end: style('.ant-statistic-content-prefix').marginInlineEnd
          },
          suffix: {
            fontSize: style('.ant-statistic-content-suffix').fontSize,
            start: style('.ant-statistic-content-suffix').marginInlineStart
          }
        } : null,
        skeletonPadding: skeleton ? getComputedStyle(skeleton).paddingTop : null
      }];
    }));
}
