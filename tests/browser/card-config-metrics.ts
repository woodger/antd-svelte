export function snapshotCardConfiguration() {
  const slots = {
    card: {
      root: '.ant-card',
      header: '.ant-card-head',
      body: '.ant-card-body',
      title: '.ant-card-head-title',
      extra: '.ant-card-extra',
      cover: '.ant-card-cover',
      actions: '.ant-card-actions'
    },
    meta: {
      root: '.ant-card-meta',
      section: '.ant-card-meta-section',
      avatar: '.ant-card-meta-avatar',
      title: '.ant-card-meta-title',
      description: '.ant-card-meta-description'
    }
  };

  return Object.fromEntries(Object.entries(slots).map(([kind, selectors]) => {
    const root = document.querySelector(selectors.root)!;

    return [kind, Object.fromEntries(Object.entries(selectors).map(([slot, selector]) => {
      const node = slot === 'root' ? root : root.querySelector(selector)!;
      const css = getComputedStyle(node);

      return [slot, {
        classes: [...node.classList].filter(name => /^(context|local)-/.test(name)),
        styles: Object.fromEntries(['color', 'background-color', 'padding-top', 'margin-top',
          'margin-bottom', 'opacity'].map(name => [name, css.getPropertyValue(name)]))
      }];
    }))];
  }));
}
