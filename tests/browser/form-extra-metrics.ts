export function formExtraMetrics() {
  const root = document.querySelector<HTMLElement>('#form-extra-fixture')!;
  const item = root.querySelector('.ant-form-item')!;
  const input = item.querySelector('input')!;
  const box = item.querySelector<HTMLElement>('[id$="_extra"]');
  const described = (input.getAttribute('aria-describedby') || '').split(/\s+/)
    .filter(Boolean).map((id) => {
      const node = input.ownerDocument.getElementById(id);
      return {
        kind: node === box ? 'extra' : 'help', text: node?.innerText.replace(/\s+/g, ' ').trim()
      };
    });
  const metadata = JSON.parse(root.querySelector('[data-extra-meta]')!.textContent!);
  const style = box ? getComputedStyle(box) : null;

  return {
    id: root.dataset.extraCase,
    extra: box ? { text: box.textContent, style: Object.fromEntries(
      ['color', 'font-size', 'line-height', 'display'].map((key) => [key, style!.getPropertyValue(key)])
    ) } : null,
    described, ...metadata, value: input.value
  };
}
