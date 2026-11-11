export function readFormFeedbackAutoComplete() {
  const host = document.querySelector<HTMLElement>('[data-feedback-autocomplete]')!;
  const prefix = host.dataset.feedbackPrefix!;
  const root = host.querySelector<HTMLElement>('[data-feedback-autocomplete-control] > div')!;
  const editor = root.querySelector<HTMLInputElement | HTMLTextAreaElement>('input:not([type="hidden"]), textarea')!;
  const classes = (node: Element, start: string) => [...node.classList].filter(name => name.startsWith(start)).map(name => name.slice(start.length)).sort();
  const item = host.querySelector<HTMLElement>('.feedback-item')!;
  const suffix = [...root.children].find(node => node.classList.contains(prefix+'-suffix'));
  const icons = [...root.querySelectorAll<HTMLElement>('[class*="-item-feedback-icon"]')].map(icon => {
    const css = getComputedStyle(icon);
    const custom = icon.querySelector<HTMLElement>('[data-feedback-info]');
    return { className: [...icon.classList].filter(name => name.includes('-item-feedback-icon')).join(' '),
      text: icon.textContent, color: css.color, fontSize: css.fontSize, visibility: css.visibility,
      paths: [...icon.querySelectorAll('path')].map(path => path.getAttribute('d')),
      custom: custom ? JSON.parse(custom.dataset.feedbackInfo!) : null };
  });
  return {
    root: classes(root, prefix+'-').filter(name => name.startsWith('status-') || ['has-feedback','in-form-item','show-arrow'].includes(name)),
    item: [...item.classList].filter(name => /-item-(?:has-feedback|has-error|has-warning|has-success|is-validating)$/.test(name))
      .map(name => name.slice(name.lastIndexOf('-item-')+6)).sort(),
    suffix: suffix ? { text: suffix.textContent, opacity: getComputedStyle(suffix).opacity,
      icons: suffix.querySelectorAll('[class*="-item-feedback-icon"]').length } : null,
    icons, status: JSON.parse(host.querySelector('[data-form-status-read="control"]')!.textContent!),
    value: editor.value, focused: document.activeElement === editor,
    open: editor.getAttribute('aria-expanded') === 'true'
  };
}
