export function snapshotSegmentedPrefix(prefix: string) {
  return Object.fromEntries(
    [...document.querySelectorAll<HTMLElement>('[data-segmented-prefix-case]')].map(host => {
      const ownPrefix = host.dataset.segmentedPrefixCase === 'outside' ? 'ant-segmented' : prefix;
      const root = host.querySelector<HTMLElement>('[role="radiogroup"]')!;
      const group = root.querySelector<HTMLElement>(`.${CSS.escape(`${ownPrefix}-group`)}`)!;
      const style = (node: Element) => getComputedStyle(node);
      const rootStyle = style(root);
      const bounds = root.getBoundingClientRect();

      return [host.dataset.segmentedPrefixCase!, {
        root: {
          classes: ['', '-rtl', '-vertical', '-block', '-sm', '-lg', '-shape-round', '-disabled']
            .filter(suffix => root.classList.contains(`${ownPrefix}${suffix}`)),
          width: bounds.width,
          height: bounds.height,
          display: rootStyle.display,
          padding: rootStyle.padding,
          color: rootStyle.color,
          background: rootStyle.backgroundColor,
          borderRadius: rootStyle.borderRadius,
          direction: rootStyle.direction,
          fontSize: rootStyle.fontSize
        },
        group: {
          display: style(group).display,
          direction: style(group).flexDirection,
          position: style(group).position
        },
        items: [...root.querySelectorAll('label')].map(item => {
          const input = item.querySelector('input')!;
          const label = item.querySelector<HTMLElement>(
            `.${CSS.escape(`${ownPrefix}-item-label`)}`
          )!;
          const icon = item.querySelector(`.${CSS.escape(`${ownPrefix}-item-icon`)}`);

          return {
            classes: ['-item', '-item-selected', '-item-selected-text', '-item-disabled']
              .filter(suffix => item.classList.contains(`${ownPrefix}${suffix}`)),
            width: item.getBoundingClientRect().width,
            height: item.getBoundingClientRect().height,
            color: style(item).color,
            background: style(item).backgroundColor,
            borderRadius: style(item).borderRadius,
            label: {
              padding: style(label).padding,
              minHeight: style(label).minHeight,
              lineHeight: style(label).lineHeight,
              fontSize: style(label).fontSize
            },
            input: {
              className: [...input.classList]
                .filter(name => name === `${ownPrefix}-item-input`).join(' '),
              checked: input.checked,
              disabled: input.disabled,
              position: style(input).position,
              width: style(input).width,
              height: style(input).height,
              opacity: style(input).opacity,
              pointerEvents: style(input).pointerEvents
            },
            icon: icon ? {
              display: style(icon.querySelector('svg')!).display,
              verticalAlign: style(icon.querySelector('svg')!).verticalAlign,
              marginEnd: style(icon.querySelector('svg')!).marginBlockEnd
            } : null
          };
        })
      }] satisfies [string, unknown];
    })
  );
}

export function snapshotSegmentedPrefixInteraction() {
  const item = document.querySelector('[data-segmented-prefix-case="normal"]')!
    .querySelectorAll('label')[1];
  const text = getComputedStyle(item);
  const overlay = getComputedStyle(item, '::after');

  return { color: text.color, background: overlay.backgroundColor, opacity: overlay.opacity };
}
