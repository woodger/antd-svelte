const radios = new Map<HTMLInputElement, (checked: boolean) => void>();

function sameGroup(input: HTMLInputElement, peer: HTMLInputElement): boolean {
  return Boolean(input.name)
    && input.name === peer.name
    && input.form === peer.form
    && input.getRootNode() === peer.getRootNode();
}

export function syncRadioPeers(input: HTMLInputElement) {
  if (!input.checked) return;

  for (const [peer, update] of radios) {
    if (peer !== input && sameGroup(input, peer))
      update(peer.checked);
  }
}

export function connectRadio(input: HTMLInputElement, update: (
  checked: boolean
) => void): () => void {
  const root = input.getRootNode();

  function handleChange(event: Event) {
    const peer = event.target;

    if (peer instanceof HTMLInputElement
      && peer !== input
      && peer.type === 'radio'
      && sameGroup(
        input,
        peer
      )) {
      update(input.checked);
    }
  }

  radios.set(input, update);
  root.addEventListener('change', handleChange);

  return () => {
    root.removeEventListener('change', handleChange);
    radios.delete(input);
  };
}

/** Label создаёт второй input click; bubble lock rc-checkbox оставляет один внешний click. */
export function createRadioClickLock() {
  let view: Window | null = null;
  let frame: number | undefined;

  function clear() {
    if (frame !== undefined) view?.cancelAnimationFrame(frame);
    frame = undefined;
  }

  return {
    label(event: MouseEvent & { currentTarget: EventTarget & HTMLLabelElement; }) {
      clear();
      view = event.currentTarget.ownerDocument.defaultView;
      frame = view?.requestAnimationFrame(() => { frame = undefined; });
    },
    input(event: MouseEvent) {
      if (frame === undefined) return;

      event.stopPropagation();
      clear();
    },
    destroy: clear
  };
}
