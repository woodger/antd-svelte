export function formDisabledMetrics() {
  function capture(kind: string) {
    const node = document.querySelector(`[data-disabled-scope="${kind}"]`)!;

    return {
      input: node.querySelector<HTMLInputElement>('[data-disabled-control="input"] input')!.disabled,
      select: node.querySelector('.ant-select')!.classList.contains('ant-select-disabled'),
      button: node.querySelector<HTMLButtonElement>('.ant-btn')!.disabled,
      tag: node.querySelector('.ant-tag')!.classList.contains('ant-tag-disabled')
    };
  }

  return { free: capture('free'), field: capture('field') };
}
