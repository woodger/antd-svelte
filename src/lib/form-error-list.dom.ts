interface FormErrorMotion {
  visible: boolean;
  kind: 'holder' | 'message';
  onFinish(visible: boolean): void;
}

/** Web Animations сохраняет CSS easing и отменяет прежнюю motion при развороте или unmount. */
export function formErrorMotion(node: HTMLElement, initial: FormErrorMotion) {
  const view = node.ownerDocument.defaultView!;
  const reduced = view.matchMedia('(prefers-reduced-motion: reduce)');
  let parameters = initial;
  let animation: Animation | undefined;
  let deadline: number | undefined;
  let active = true;
  let generation = 0;

  function cancel() {
    view.clearTimeout(deadline);
    deadline = undefined;
    animation?.cancel();
    animation = undefined;
  }

  function run(appearing: boolean) {
    const current = view.getComputedStyle(node);
    const fromOpacity = appearing ? 0 : current.opacity;
    const fromHeight = appearing ? 0 : node.getBoundingClientRect().height;
    const fromTransform = appearing ? 'translateY(-5px)' : current.transform;
    const token = current.getPropertyValue('--ant-motion-duration-fast').trim();
    const parsed = Number.parseFloat(token) * (token.endsWith('ms') ? 1 : 1000);
    const duration = reduced.matches ? 0 : Number.isFinite(parsed) && parsed >= 0 ? parsed : 100;
    const easing = current.getPropertyValue('--ant-motion-ease-in-out').trim()
      || 'cubic-bezier(0.645, 0.045, 0.355, 1)';
    const visible = parameters.visible;
    const tokenId = ++generation;
    let finished = false;
    cancel();

    function finish() {
      if (!active || finished || tokenId !== generation) return;

      finished = true;
      cancel();
      parameters.onFinish(visible);
    }

    if (duration === 0) {
      queueMicrotask(finish);
      return;
    }

    const frames: Keyframe[] = parameters.kind === 'holder'
      ? [{ opacity: fromOpacity }, { opacity: visible ? 1 : 0 }]
      : [
        {
          height: `${fromHeight}px`, opacity: fromOpacity,
          transform: fromTransform, overflow: 'hidden'
        },
        {
          height: `${visible ? node.scrollHeight : 0}px`, opacity: visible ? 1 : 0,
          transform: `translateY(${visible ? 0 : -5}px)`, overflow: 'hidden'
        }
      ];

    animation = node.animate(frames, { duration, easing, fill: 'both' });
    void animation.finished.then(finish, () => {});
    // У CSSMotion upstream та же граница, если transitionend не пришёл.
    deadline = view.setTimeout(finish, 500);
  }

  function handleReducedMotion() {
    if (reduced.matches) animation?.finish();
  }

  reduced.addEventListener('change', handleReducedMotion);
  run(initial.visible);

  return {
    update(next: FormErrorMotion) {
      const changed = parameters.visible !== next.visible;
      parameters = next;
      if (changed) run(false);
    },
    destroy() {
      active = false;
      generation++;
      cancel();
      reduced.removeEventListener('change', handleReducedMotion);
    }
  };
}
