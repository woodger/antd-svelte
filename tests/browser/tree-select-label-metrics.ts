/** Callback/summary labels из реального DOM; ReactNode и Snippet сравниваются после render. */
export function readTreeLabels() {
  const records = (root: Element | null) => root ? [...root.querySelectorAll('[data-renderer-record]')]
    .map(node => ({ ...JSON.parse(node.getAttribute('data-renderer-record')!),
      text: node.querySelector('[data-record-label]')?.textContent ?? '',
      rendered: [...node.querySelectorAll('[data-render-label]')].map(label => ({
        value: label.getAttribute('data-render-value'), payload: label.getAttribute('data-render-payload'),
        context: label.getAttribute('data-render-context')
      }))
    })) : [];
  return {
    opened: document.querySelector('[data-tree-label-control] [role="combobox"]')?.getAttribute('aria-expanded') === 'true',
    omitted: records(document.querySelector('[data-tree-label-omitted]')),
    history: [...document.querySelectorAll('[data-tree-label-batch]')].map(records),
    events: JSON.parse(document.querySelector('[data-tree-label-events]')?.textContent ?? '[]')
  };
}
