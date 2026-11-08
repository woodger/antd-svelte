export function snapshotConfigPrefix() {
  return Object.fromEntries([...document.querySelectorAll<HTMLElement>('[data-prefix-scope]')]
    .map(scope => [scope.dataset.prefixScope, {
      token: JSON.parse(scope.dataset.prefixToken!),
      classes: Object.fromEntries(['app', 'layout', 'sider', 'header', 'content', 'footer']
        .map(part => {
          const node = part === 'app' ? scope.querySelector(':scope > div')!
            : scope.querySelector(`[data-prefix-part="${part}"]`)!;
          return [part, [...node.classList]
            .filter(name => !/^(css-|s-[\w-]{12}$|ant-app-css-var|ant-layout-css-var)/.test(name))];
        }))
    }]));
}
