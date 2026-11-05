export function snapshotPopoverLifecycle(mode: string) {
  const popup = document.querySelector<HTMLElement>('[data-ant-popover]')!;
  const container = popup.querySelector<HTMLElement>('[data-ant-popover-container]')!;
  const body = popup.querySelector<HTMLElement>(mode === 'popconfirm'
    ? '.ant-popconfirm-description' : '.ant-popover-content');
  const heading = popup.querySelector<HTMLElement>(mode === 'popconfirm'
    ? '.ant-popconfirm-title' : '.ant-popover-title');
  const fields = (node: HTMLElement | null) => node ? {
    text: node.textContent,
    color: node.style.color,
    classes: [...node.classList].filter(value => value.startsWith('cache-'))
  } : null;
  const input = popup.querySelector<HTMLInputElement>('[aria-label="Lifecycle draft"]');

  return {
    visible: popup.matches(':popover-open') && !popup.hidden,
    id: popup.id,
    zIndex: getComputedStyle(popup).zIndex,
    inlineZIndex: popup.style.zIndex,
    container: {
      padding: container.style.padding,
      classes: [...container.classList].filter(value => value.startsWith('cache-'))
    },
    body: fields(body),
    heading: fields(heading),
    buttons: mode === 'popconfirm'
      ? [...popup.querySelectorAll<HTMLButtonElement>('.ant-popconfirm-buttons button')].map(node => ({
        text: node.textContent!.trim(), disabled: node.disabled,
        classes: [...node.classList].filter(value => value.startsWith('cache-'))
      })) : [],
    icon: mode === 'popconfirm' ? Boolean(popup.querySelector('.ant-popconfirm-message-icon')) : false,
    widget: input ? { value: input.value,
      count: popup.querySelector('[aria-label="Lifecycle count"]')!.textContent } : null,
    portal: popup.parentElement?.id === 'popover-lifecycle-container'
  };
}
