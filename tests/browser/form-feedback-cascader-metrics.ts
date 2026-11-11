export function readFormFeedbackCascader() {
  const host = document.querySelector<HTMLElement>('[data-feedback-case]')!;
  const prefix = host.dataset.feedbackPrefix!;
  const control = host.querySelector('[data-feedback-control]')!;
  const root = control.querySelector<HTMLElement>('[data-ant-path-choice-control], [data-ant-path-choice-panel], .'+CSS.escape(prefix)+', [data-custom-trigger], .ant-cascader-panel')!;
  const input = root.querySelector<HTMLInputElement>('input[role="combobox"]');
  const suffix = root.querySelector<HTMLElement>('.'+CSS.escape(prefix+'-suffix'));
  const icon = suffix?.querySelector<HTMLElement>('[class*="-item-feedback-icon"]');
  const custom = icon?.querySelector<HTMLElement>('[data-feedback-info]');
  const css = icon ? getComputedStyle(icon) : undefined;
  const item = host.querySelector('.feedback-item')!;
  const popup = document.querySelector('[data-form-status-read="popup"]');
  const popupInput = document.querySelector('[aria-label="Feedback popup control"]');
  return {
    root: [...root.classList].filter(name => name.startsWith(prefix+'-'))
      .map(name => name.slice(prefix.length+1)).filter(name => name.startsWith('status-')
        || ['has-feedback','in-form-item','show-arrow'].includes(name)).sort(),
    item: [...item.classList].filter(name => /-item-(?:has-feedback|has-error|has-warning|has-success|is-validating)$/.test(name))
      .map(name => name.slice(name.lastIndexOf('-item-')+6)).sort(),
    suffix: suffix ? { text: suffix.textContent, custom: suffix.querySelector('[data-custom-suffix]')?.textContent ?? null } : null,
    icon: icon ? { className: [...icon.classList].filter(name => name.includes('-item-feedback-icon')).join(' '),
      text: icon.textContent, color: css!.color, fontSize: css!.fontSize, visibility: css!.visibility,
      path: icon.querySelector('svg') ? [...icon.querySelectorAll('svg path')].map(path => path.getAttribute('d')) : null,
      custom: custom ? JSON.parse(custom.dataset.feedbackInfo!) : null } : null,
    status: JSON.parse(host.querySelector('[data-form-status-read="control"]')!.textContent!),
    focused: document.activeElement === (input ?? root),
    open: input ? input.getAttribute('aria-expanded') === 'true' : false,
    popup: popup ? { status: JSON.parse(popup.textContent!),
      feedback: Boolean(popupInput?.closest('[class*="-affix-wrapper"]')?.querySelector('[class*="-item-feedback-icon"]')) } : null
  };
}
