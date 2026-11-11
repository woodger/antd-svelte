export function readFormFeedbackControl() {
  const host = document.querySelector<HTMLElement>('[data-feedback-case]')!;
  const kind = host.dataset.feedbackKind!;
  const prefix = host.dataset.feedbackPrefix!;
  const control = document.querySelector<HTMLElement>('[data-feedback-control]')!;
  const input = control.querySelector<HTMLInputElement | HTMLTextAreaElement>('input:not([type="hidden"]), textarea')!;
  const root = kind === 'select' ? input.closest<HTMLElement>('[data-ant-select-control], .'+CSS.escape(prefix))!
    : kind === 'number' ? input.closest<HTMLElement>('.'+CSS.escape(prefix))!
      : input.closest<HTMLElement>('.'+CSS.escape(prefix+'-affix-wrapper')) ?? input;
  const item = host.querySelector<HTMLElement>('.feedback-item')!;
  const suffix = root.querySelector<HTMLElement>('.'+CSS.escape(prefix+'-suffix')+', .suffix');
  const icon = suffix?.querySelector<HTMLElement>('[class*="-item-feedback-icon"]');
  const custom = icon?.querySelector<HTMLElement>('[data-feedback-info]');
  const svg = icon?.querySelector('svg');
  const css = icon ? getComputedStyle(icon) : undefined;
  const classes = (node: Element, start: string) => [...node.classList].filter(name => name.startsWith(start)).map(name => name.slice(start.length)).sort();
  return {
    root: classes(root, prefix+'-').filter(name => name.startsWith('status-') || ['has-feedback', 'in-form-item',
      'textarea-has-feedback', 'affix-wrapper', 'affix-wrapper-input-with-clear-btn'].includes(name)),
    item: [...item.classList].filter(name => /-item-(?:has-feedback|has-error|has-warning|has-success|is-validating)$/.test(name))
      .map(name => name.slice(name.lastIndexOf('-item-')+6)).sort(),
    suffix: suffix ? { text: suffix.textContent,
      children: [...suffix.children].filter(node => !node.classList.contains('svelte-css-wrapper'))
        .map(node => node.classList.contains(prefix+'-textarea-suffix') ? 'textarea-suffix'
          : node.getAttribute('class')?.includes('-item-feedback-icon') ? 'feedback' : node.getAttribute('class')?.includes('-clear-icon') ? 'clear'
            : node.getAttribute('class')?.includes('-count') ? 'count' : 'custom') } : null,
    icon: icon ? { className: [...icon.classList].filter(name => name.includes('-item-feedback-icon')).join(' '),
      text: icon.textContent, color: css!.color, fontSize: css!.fontSize, visibility: css!.visibility,
      path: svg ? [...svg.querySelectorAll('path')].map(path => path.getAttribute('d')) : null,
      custom: custom ? JSON.parse(custom.dataset.feedbackInfo!) : null } : null,
    status: JSON.parse(document.querySelector('[data-form-status-read="control"]')!.textContent!),
    value: kind === 'select' ? null : input.value,
    focused: document.activeElement === input
  };
}
