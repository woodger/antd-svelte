export function readTreeSelectInputResponsive() {
  const host = document.querySelector('[data-input-responsive-case]')!;
  const root = host.querySelector('.ant-select')!;
  const content = root.querySelector<HTMLElement>('.ant-select-content')!;
  const field = root.querySelector<HTMLInputElement | HTMLTextAreaElement>('[data-input-responsive-editor]')!;
  const tags = [...root.querySelectorAll<HTMLElement>('[data-input-responsive-tag]')];
  const rest = root.querySelector<HTMLElement>('[data-input-responsive-rest]')!;
  const prefix = root.querySelector<HTMLElement>('[data-input-responsive-prefix]');
  const visible = (node: HTMLElement) => !node.closest('[aria-hidden="true"],[inert]');
  return { query: field.value, hostWidth: content.clientWidth,
    visible: tags.filter(visible).map(node => node.getAttribute('data-input-responsive-tag')),
    rest: visible(rest),
    editorWidth: field.getBoundingClientRect().width, prefixWidth: prefix?.getBoundingClientRect().width ?? null,
    variable: field.style.getPropertyValue('--select-input-width') };
}
