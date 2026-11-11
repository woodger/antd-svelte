export function readFormFeedbackMentions() {
  const host = document.querySelector<HTMLElement>('[data-feedback-case]')!;
  const prefix = host.dataset.feedbackPrefix!;
  const kind = host.dataset.feedbackKind!;
  const root = host.querySelector<HTMLElement>('[data-feedback-control] > :first-child')!;
  const editor = root.querySelector<HTMLTextAreaElement | HTMLInputElement>('textarea, input:not([type="checkbox"]):not([type="hidden"])');
  const classes = (node: Element, start: string) => [...node.classList].filter(name => name.startsWith(start)).map(name => name.slice(start.length)).sort();
  const icons = [...root.querySelectorAll<HTMLElement>('[class*="-item-feedback-icon"]')].map(icon => {
    const custom = icon.querySelector<HTMLElement>('[data-feedback-info]');
    const css = getComputedStyle(icon);
    return { classes: [...icon.classList].filter(name => name.includes('-item-feedback-icon')).join(' '),
      text: icon.textContent, color: css.color, fontSize: css.fontSize, visibility: css.visibility,
      paths: [...icon.querySelectorAll('svg path')].map(path => path.getAttribute('d')),
      info: custom ? JSON.parse(custom.dataset.feedbackInfo!) : null };
  });
  const searches = kind === 'transfer' ? [...root.querySelectorAll<HTMLInputElement>('input:not([type="checkbox"]):not([type="hidden"])')]
    .map(input => ({ value: input.value, icons: input.parentElement!.querySelectorAll('[class*="-item-feedback-icon"]').length,
      status: [...input.parentElement!.classList].filter(name => /-status-/.test(name)).map(name => name.slice(name.lastIndexOf('-status-') + 8)) })) : [];
  const item = host.querySelector<HTMLElement>('.feedback-item')!;
  const suffix = kind === 'mentions' ? root.querySelector<HTMLElement>('.'+CSS.escape(prefix+'-suffix')) : null;
  const popup = kind === 'mentions' ? document.querySelector<HTMLElement>('.'+CSS.escape(prefix+'-dropdown')) : null;
  return {
    root: classes(root, prefix+'-').filter(name => name.startsWith('status-') || ['has-feedback', 'has-suffix', 'affix-wrapper'].includes(name)),
    item: [...item.classList].filter(name => /-item-(?:has-feedback|has-error|has-warning|has-success|is-validating)$/.test(name))
      .map(name => name.slice(name.lastIndexOf('-item-') + 6)).sort(),
    // Source retains an invisible clear button; native Mentions removes it when empty.
    suffix: suffix ? [...suffix.children].filter(node => !node.classList.contains('svelte-css-wrapper')
      && !node.classList.contains(prefix+'-clear-icon-hidden'))
      .map(node => node.hasAttribute('data-ant-mentions-clear') || node.classList.contains(prefix+'-clear')
        || node.classList.contains(prefix+'-clear-icon') ? 'clear' : 'feedback') : null,
    icons, searches,
    value: kind === 'mentions' ? editor!.value : null,
    target: kind === 'transfer' ? [...([...root.querySelectorAll('.'+CSS.escape(prefix+'-section'))].at(-1)
      ?.querySelectorAll('.'+CSS.escape(prefix+'-list-content-item')) ?? [])].map(node => node.textContent?.trim()).join('|') : null,
    status: JSON.parse(host.querySelector('[data-form-status-read="control"]')!.textContent!),
    focused: Boolean(editor && editor === document.activeElement),
    popup: Boolean(popup && popup.getClientRects().length && getComputedStyle(popup).visibility !== 'hidden')
  };
}
