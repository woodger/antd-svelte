export function snapshotAvatarGroupPopover() {
  const popup = document.querySelector<HTMLElement>('.ant-avatar-group-popover');
  const open = Boolean(popup && getComputedStyle(popup).display !== 'none'
    && popup.getClientRects().length);
  const title = popup?.querySelector('.ant-popover-title');
  const content = popup?.querySelector('.ant-popover-content');
  const input = popup?.querySelector<HTMLInputElement>('[aria-label="Owner popup draft"]');

  return {
    open,
    title: open ? title?.textContent ?? null : null,
    content: open && !content?.querySelector('.ant-avatar') ? content?.textContent ?? null : null,
    input: input?.value ?? null,
    avatars: [...popup?.querySelectorAll('.ant-avatar-string') ?? []]
      .map(node => node.textContent ?? ''),
    arrow: open && Boolean(popup?.querySelector('.ant-popover-arrow')),
    placement: open ? [...popup!.classList]
      .find(name => name.startsWith('ant-popover-placement-'))!
      .replace('ant-popover-placement-', '') : null,
    classes: open ? [...popup!.classList].filter(name => name.startsWith('case-')).sort() : [],
    container: open ? popup!.closest('[data-group-popover-container]')
      ?.getAttribute('data-group-popover-container') ?? null : null,
    events: JSON.parse(
      document.querySelector('[aria-label="Group popup events"]')!.textContent!
    ) as boolean[]
  };
}
