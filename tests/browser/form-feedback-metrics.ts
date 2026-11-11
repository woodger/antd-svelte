export function readFormFeedback() {
  const host = document.querySelector<HTMLElement>('[data-feedback-case]')!;
  const prefix = host.dataset.feedbackPrefix!;
  const root = host.querySelector<HTMLElement>('[data-feedback-control] > div')!;
  const input = root.querySelector<HTMLInputElement>('[role="combobox"]')!;
  const item = host.querySelector<HTMLElement>('.feedback-item')!;
  const suffix = root.querySelector<HTMLElement>(`.${CSS.escape(prefix + '-suffix')}, .suffix`);
  const icon = suffix?.querySelector<HTMLElement>('[class*="-item-feedback-icon"]');
  const custom = icon?.querySelector<HTMLElement>('[data-feedback-info]');
  const svg = icon?.querySelector('svg');
  const classes = (node: Element, start: string) => [...node.classList].filter(name => name.startsWith(start)).map(name => name.slice(start.length)).sort();
  const css = icon ? getComputedStyle(icon) : undefined;
  const reader = document.querySelector('[data-form-status-read="control"]');
  const portalReader = document.querySelector('[data-form-status-read="popup"]');
  const popupControl = document.querySelector('[aria-label="Feedback popup control"]')?.closest('[data-ant-tree-choice-control], [class~="ant-select"]');
  return {
    root: classes(root, prefix + '-').filter(name => name.startsWith('status-') || ['has-feedback', 'in-form-item', 'show-arrow'].includes(name)),
    item: [...item.classList].filter(name => /-item-(?:has-feedback|has-error|has-warning|has-success|is-validating)$/.test(name))
      .map(name => name.slice(name.lastIndexOf('-item-') + 6)).sort(),
    open: input.getAttribute('aria-expanded') === 'true',
    selected: input.getAttribute('aria-expanded') === 'true' || root.classList.contains(prefix + '-multiple') ? null
      : input.hasAttribute('data-ant-tree-choice-input') ? input.value : root.querySelector(`.${CSS.escape(prefix + '-content')}`)?.textContent ?? '',
    tags: [...root.querySelectorAll(`.${CSS.escape(prefix + '-selection-item-content')}`)].map(node => node.textContent),
    suffix: suffix ? { text: suffix.textContent, width: Math.round(suffix.getBoundingClientRect().width * 100) / 100,
      rendered: suffix.querySelector('[data-rendered-suffix]')?.textContent ?? null } : null,
    icon: icon ? { className: [...icon.classList].filter(name => name.includes('-item-feedback-icon')).join(' '),
      text: icon.textContent, color: css!.color, fontSize: css!.fontSize,
      visibility: css!.visibility, path: svg
        ? [...svg.querySelectorAll('path')].map(path => path.getAttribute('d')) : null,
      custom: custom ? JSON.parse(custom.dataset.feedbackInfo!) : null } : null,
    status: reader ? JSON.parse(reader.textContent!) : null,
    popup: portalReader ? { status: JSON.parse(portalReader.textContent!),
      feedback: Boolean(popupControl?.className.includes('-has-feedback')),
      inForm: Boolean(popupControl?.className.includes('-in-form-item')) } : null
  };
}
