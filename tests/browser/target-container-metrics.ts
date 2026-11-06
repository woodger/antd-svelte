export function snapshotTargetContainer() {
  return Object.fromEntries([...document.querySelectorAll<HTMLElement>('[data-target-consumer]')]
    .map(host => {
      const root = host.querySelector<HTMLElement>('.target-affix')!;
      const content = root.lastElementChild!;
      const css = getComputedStyle(content);
      const name = host.dataset.targetName!;
      const target = name === 'window' ? { top: 0 }
        : document.getElementById(`target-${name}`)!.getBoundingClientRect();
      const placeholder = root.querySelector<HTMLElement>(':scope > [aria-hidden="true"]');
      const fixed = content.classList.contains('ant-affix');

      return [host.dataset.targetConsumer!, {
        target: name,
        fixed,
        position: css.position,
        topOffset: fixed ? content.getBoundingClientRect().top - target.top : null,
        placeholder: placeholder ? [placeholder.style.width, placeholder.style.height] : null,
        fieldCount: root.querySelectorAll('input').length,
        active: host.querySelector('.ant-anchor-link-title-active')?.getAttribute('href') ?? null,
        links: [...host.querySelectorAll('.ant-anchor-link-title')]
          .map(node => node.getAttribute('href'))
      }];
    }));
}
