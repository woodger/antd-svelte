export function snapshotCardTheme() {
  return Object.fromEntries([...document.querySelectorAll<HTMLElement>('[data-card-theme]')]
    .map(root => {
      const select = (selector: string) => root.querySelector<HTMLElement>(selector)!;
      const style = (node: Element) => getComputedStyle(node);
      const head = style(select('.ant-card-head'));
      const body = style(select('.ant-card-body'));
      const extra = style(select('.ant-card-extra'));
      const actions = style(select('.ant-card-actions'));
      const action = style(select('.ant-card-actions>li'));
      const tabs = select('.ant-tabs-top');
      const grid = select('.ant-card-grid');
      const meta = select('.ant-card-meta');

      return [root.dataset.cardTheme, {
        background: style(root).backgroundColor,
        color: style(root).color,
        fontSize: style(root).fontSize,
        header: {
          minHeight: head.minHeight, padding: head.padding,
          fontSize: head.fontSize, background: head.backgroundColor
        },
        body: { padding: body.padding },
        extraColor: extra.color,
        actions: { background: actions.backgroundColor, margin: action.margin },
        tabs: tabs ? { marginBottom: style(tabs).marginBottom } : null,
        grid: grid ? { padding: style(grid).padding } : null,
        meta: meta ? {
          titleFont: style(select('.ant-card-meta-title')).fontSize,
          descriptionColor: style(select('.ant-card-meta-description')).color
        } : null
      }];
    }));
}
