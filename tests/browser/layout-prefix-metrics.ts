export function snapshotLayoutPrefix() {
  return Object.fromEntries([...document.querySelectorAll<HTMLElement>('[data-layout-prefix]')]
    .map(host => {
      const root = host.querySelector<HTMLElement>('[data-layout-part="root"]')!;
      const sider = root.querySelector('aside')!;
      const prefix = host.dataset.prefix!;
      const sidebar = host.dataset.siderPrefix!;
      const nodes = {
        root, sider,
        body: sider.querySelector(`.${sidebar}-children`),
        trigger: sider.querySelector(`.${sidebar}-trigger,.${sidebar}-zero-width-trigger`),
        header: root.querySelector('header'), content: root.querySelector('main'),
        footer: root.querySelector('footer')
      };

      return [host.dataset.layoutPrefix, {
        rootPrefix: root.classList.contains(prefix), defaultRoot: root.classList.contains('ant-layout'),
        siderPrefix: sider.classList.contains(sidebar),
        defaultSider: sider.classList.contains('ant-layout-sider'),
        slots: Object.fromEntries(Object.entries(nodes).map(([part, node]) => {
          if (!node) return [part, null];
          const css = getComputedStyle(node);

          return [part, {
            classes: [...node.classList].filter(name => /^(ctx-|local-|inner-)/.test(name)).sort(),
            direction: css.direction, color: css.color, background: css.backgroundColor,
            paddingTop: css.paddingTop, paddingRight: css.paddingRight,
            borderTopWidth: css.borderTopWidth, borderTopColor: css.borderTopColor,
            fontSize: css.fontSize, lineHeight: css.lineHeight, flexDirection: css.flexDirection,
            position: css.position, overflow: css.overflow, width: part === 'sider' ? css.width : null
          }];
        }))
      }];
    }));
}
