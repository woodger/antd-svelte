export function snapshotAlertBoundary(defaultStack: boolean) {
  const frame = document.querySelector('[data-boundary-frame]')!;
  const root = frame.querySelector('.ant-alert');
  const title = root?.querySelector('.ant-alert-title');
  const pre = root?.querySelector('pre');

  return {
    healthyInput: frame.querySelector('input')?.value ?? null,
    root: root ? {
      id: root.id,
      role: root.getAttribute('role'),
      status: root.classList.contains('ant-alert-error'),
      description: root.classList.contains('ant-alert-with-description'),
      icon: Boolean(root.querySelector('.ant-alert-icon')),
      close: Boolean(root.querySelector('button'))
    } : null,
    title: title ? title.textContent : null,
    description: pre ? defaultStack ? 'framework-stack' : pre.textContent : null,
    stackHasChild: defaultStack && pre ? pre.textContent!.includes('BrokenChild') : null,
    pre: pre ? {
      fontSize: getComputedStyle(pre).fontSize,
      overflowX: getComputedStyle(pre).overflowX,
      margin: getComputedStyle(pre).margin,
      padding: getComputedStyle(pre).padding
    } : null
  };
}
