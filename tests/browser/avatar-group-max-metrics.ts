export function snapshotAvatarGroupMax(host: HTMLElement) {
  const root = host.querySelector<HTMLElement>('.ant-avatar-group')!;
  const avatars = [...root.querySelectorAll<HTMLElement>('.ant-avatar')]
    .filter(node => !node.closest('.ant-popover'));
  const counter = avatars.find(node => node.textContent?.startsWith('+'));
  const style = counter && getComputedStyle(counter);

  return {
    texts: avatars.filter(node => node !== counter).map(node => node.textContent),
    counter: counter && style ? {
      text: counter.textContent,
      color: style.color,
      background: style.backgroundColor,
      width: style.width,
      height: style.height,
      radius: style.borderRadius,
      fontSize: style.fontSize
    } : null,
    attributes: ['maxcount', 'maxstyle', 'maxpopoverplacement', 'maxpopovertrigger']
      .map(name => root.getAttribute(name))
  };
}

export function snapshotAvatarGroupMaxPopup() {
  const popup = [...document.querySelectorAll<HTMLElement>('.ant-avatar-group-popover')]
    .find(node => getComputedStyle(node).display !== 'none' && node.getClientRects().length);

  return {
    open: Boolean(popup),
    placement: popup ? [...popup.classList]
      .find(name => name.startsWith('ant-popover-placement-'))!
      .replace('ant-popover-placement-', '') : null,
    texts: popup ? [...popup.querySelectorAll('.ant-avatar-string')]
      .map(node => node.textContent ?? '') : []
  };
}
