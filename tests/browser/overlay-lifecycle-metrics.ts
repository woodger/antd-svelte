export function snapshotOverlayLifecycle() {
  const popups = [...document.querySelectorAll<HTMLElement>('.ant-tooltip,.ant-popover')];
  const visible = popups.filter(popup => getComputedStyle(popup).display !== 'none'
    && popup.getClientRects().length > 0);

  return {
    visible: visible.length,
    contents: popups.flatMap(popup => [...popup.querySelectorAll('[data-lifecycle-payload]')])
      .map(payload => ({
        value: payload.querySelector<HTMLInputElement>('[aria-label="Lifecycle draft"]')!.value,
        count: payload.querySelector('[aria-label="Lifecycle count"]')!.textContent
      })),
    callbacks: visible.flatMap(popup => [...popup.classList]
      .filter(name => name.startsWith('lifecycle-destroy-'))).sort()
  };
}
