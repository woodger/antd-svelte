export function formScrollFirstMetrics() {
  const host = document.querySelector('[data-scroll-case]')!;
  const viewport = host.querySelector('[data-scroll-viewport]')!;
  const state = document.querySelector('output[aria-label="First error capture"]')!.textContent!;
  const capture = JSON.parse(state);
  const index = capture.failed?.names[0]?.[0] === 'second' ? 1 : 0;
  const target = host.querySelector(`[data-scroll-field="${index}"] input`)!;
  const submit = host.querySelector('#submit-control')!;
  const rect = viewport.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();

  return {
    ...capture,
    scrollTop: Math.round(viewport.scrollTop * 100) / 100,
    targetTop: Math.round((targetRect.top - rect.top) * 100) / 100,
    active: document.activeElement === submit ? 'submit'
      : document.activeElement === target ? 'target' : 'other'
  };
}
