export function readTreeSelectComponentsForm() {
  const host = document.querySelector<HTMLElement>('[data-form-components-case]')!;
  const editor = host.querySelector<HTMLInputElement>('[data-form-components-editor]');
  const select = host.querySelector('.ant-select');
  const input = host.querySelector('.ant-input-affix-wrapper');
  const item = host.querySelector('.ant-form-item');
  return {
    mounted: Boolean(editor),
    value: editor?.value ?? null,
    name: editor?.getAttribute('name') ?? null,
    id: editor?.getAttribute('id') ?? null,
    aria: {
      required: editor?.getAttribute('aria-required') ?? null,
      describedBy: editor?.getAttribute('aria-describedby') ?? null,
      invalid: editor?.getAttribute('aria-invalid') ?? null
    },
    help: [...host.querySelectorAll('[id$="_help"],[id$="-help"]')].map(node => ({ id: node.id, text: node.textContent })),
    focused: Boolean(editor && document.activeElement === editor),
    open: [...document.querySelectorAll<HTMLElement>('.ant-tree-select-dropdown')]
      .some(node => node.getClientRects().length > 0 && getComputedStyle(node).display !== 'none'),
    model: JSON.parse(host.querySelector('[data-form-components-model]')!.textContent!),
    events: JSON.parse(host.querySelector('[data-form-components-events]')!.textContent!),
    status: {
      itemError: Boolean(item?.classList.contains('ant-form-item-has-error')),
      itemFeedback: Boolean(item?.classList.contains('ant-form-item-has-feedback')),
      selectError: Boolean(select?.classList.contains('ant-select-status-error')),
      selectFeedback: Boolean(select?.classList.contains('ant-select-has-feedback')),
      inputError: Boolean(input?.classList.contains('ant-input-status-error'))
    },
    icons: [...host.querySelectorAll('.ant-form-item-feedback-icon')].map(icon => ({
      classes: [...icon.classList].filter(name => name.startsWith('ant-form-item-feedback-icon')).sort(),
      paths: [...icon.querySelectorAll('path')].map(path => path.getAttribute('d'))
    })),
    association: JSON.parse(host.querySelector('[data-form-components-association]')!.textContent!)
  };
}
