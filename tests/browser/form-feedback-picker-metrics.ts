export function readFormFeedbackPicker() {
  const host = document.querySelector<HTMLElement>('[data-feedback-picker-case]')!;
  const prefix = host.dataset.feedbackPrefix!;
  const root = host.querySelector<HTMLElement>('[data-feedback-picker-control] .'+CSS.escape(prefix))!;
  const item = host.querySelector<HTMLElement>('.feedback-item')!;
  const suffix = root.querySelector<HTMLElement>('.'+CSS.escape(prefix+'-suffix'));
  const icon = suffix?.querySelector<HTMLElement>('[class*="-item-feedback-icon"]');
  const custom = icon?.querySelector<HTMLElement>('[data-feedback-info]');
  const css = icon ? getComputedStyle(icon) : undefined;
  const flags = (node: Element, start: string) => [...node.classList]
    .filter(name => name.startsWith(start)).map(name => name.slice(start.length)).sort();
  return {
    root: flags(root, prefix+'-').filter(name => name.startsWith('status-') || ['has-feedback', 'in-form-item'].includes(name)),
    item: flags(item, (item.className.match(/(?:^| )([^ ]+)-item(?: |$)/)?.[1] ?? 'ant-form')+'-item-')
      .filter(name => ['has-error', 'has-warning', 'has-success', 'is-validating', 'has-feedback'].includes(name)),
    suffix: suffix ? { text: suffix.textContent, custom: Boolean(suffix.querySelector('[data-picker-custom-suffix]')),
      feedback: Boolean(icon), glyphs: suffix.querySelectorAll('svg').length } : null,
    icon: icon ? { className: [...icon.classList].filter(name => name.includes('-item-feedback-icon')).join(' '),
      text: icon.textContent, color: css!.color, fontSize: css!.fontSize, visibility: css!.visibility,
      path: [...icon.querySelectorAll('path')].map(path => path.getAttribute('d')),
      custom: custom ? JSON.parse(custom.dataset.feedbackInfo!) : null } : null,
    status: JSON.parse(host.querySelector('[data-form-status-read="control"]')!.textContent!),
    values: [...root.querySelectorAll<HTMLInputElement>('input:not([type="hidden"])')].map(input => input.value),
    focused: [...root.querySelectorAll('input')].findIndex(input => document.activeElement === input)
  };
}
