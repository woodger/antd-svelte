import type { InputNumberFocusOptions, InputNumberRef } from './input-number.types';

export function focusInputNumber(
  input: HTMLInputElement | undefined,
  options?: InputNumberFocusOptions
) {
  if (!input) return;

  input.focus(options);
  if (input.selectionStart === null) return;

  const length = input.value.length;
  if (options?.cursor === 'start') input.setSelectionRange(0, 0);
  if (options?.cursor === 'end') input.setSelectionRange(length, length);
  if (options?.cursor === 'all') input.setSelectionRange(0, length);
}

export function createInputNumberRef(input: HTMLInputElement, root: HTMLElement): InputNumberRef {
  const focus = (options?: InputNumberFocusOptions) => focusInputNumber(input, options);

  return new Proxy(input, {
    get(target, property) {
      if (property === 'nativeElement') return root;
      if (property === 'focus') return focus;

      const value = Reflect.get(target, property, target);

      // DOM methods требуют native receiver, даже когда ref читается через Proxy.
      return typeof value === 'function' ? value.bind(target) : value;
    },
    set(target, property, value) {
      return Reflect.set(target, property, value, target);
    }
  }) as InputNumberRef;
}

export function recordInputNumberCursor(input: HTMLInputElement | undefined) {
  if (!input || input.selectionStart === null || input.selectionEnd === null) return;

  return {
    before: input.value.substring(0, input.selectionStart),
    after: input.value.substring(input.selectionEnd),
    start: input.selectionStart
  };
}

export function restoreInputNumberCursor(
  input: HTMLInputElement | undefined,
  cursor: ReturnType<typeof recordInputNumberCursor>
) {
  if (!input || !cursor || input.selectionStart === null) return;

  const value = input.value;
  let start = value.length;

  if (value.startsWith(cursor.before)) start = cursor.before.length;
  else if (value.endsWith(cursor.after)) start = value.length - cursor.after.length;
  else {
    const last = cursor.before[cursor.start - 1];
    const index = value.indexOf(last, cursor.start - 1);

    if (index !== -1) start = index + 1;
  }

  input.setSelectionRange(start, start);
}

/** Source StepHandler: immediate step, затем 600ms/200ms; native buttons добавляют клавиатуру. */
export function connectInputNumberStep(element: HTMLButtonElement, onStep: () => void) {
  const document = element.ownerDocument;
  const view = document.defaultView!;
  const frames = new Set<number>();
  let timer: ReturnType<typeof setTimeout> | undefined;
  let pointer: number | undefined;
  let active = false;
  let alive = true;

  function stop() {
    if (timer !== undefined) clearTimeout(timer);
    timer = undefined;
    pointer = undefined;
    active = false;
  }

  function delayedStop() {
    if (!active) return;

    const frame = view.requestAnimationFrame(() => {
      frames.delete(frame);
      stop();
    });
    frames.add(frame);
  }

  function repeat() {
    onStep();
    if (alive) timer = setTimeout(repeat, 200);
  }

  function down(event: MouseEvent, pointerId?: number) {
    if (event.button !== 0 || element.disabled) return;

    event.preventDefault();
    stop();
    pointer = pointerId;
    active = true;
    onStep();
    if (alive) timer = setTimeout(repeat, 600);
  }

  function pointerDown(event: PointerEvent) {
    if (event.pointerType !== 'mouse') down(event, event.pointerId);
  }

  function pointerEnd(event: PointerEvent) {
    if (pointer !== undefined && event.pointerId === pointer) delayedStop();
  }

  function pointerLeave(event: PointerEvent) {
    if (pointer === undefined || event.pointerId === pointer) delayedStop();
  }

  function mouseDown(event: MouseEvent) {
    down(event);
  }

  function mouseUp() {
    if (pointer === undefined) delayedStop();
  }

  element.addEventListener('mousedown', mouseDown);
  element.addEventListener('pointerdown', pointerDown);
  element.addEventListener('pointerleave', pointerLeave);
  document.addEventListener('mouseup', mouseUp);
  document.addEventListener('pointerup', pointerEnd);
  document.addEventListener('pointercancel', pointerEnd);
  view.addEventListener('blur', stop);

  return () => {
    alive = false;
    stop();
    for (const frame of frames) view.cancelAnimationFrame(frame);
    element.removeEventListener('mousedown', mouseDown);
    element.removeEventListener('pointerdown', pointerDown);
    element.removeEventListener('pointerleave', pointerLeave);
    document.removeEventListener('mouseup', mouseUp);
    document.removeEventListener('pointerup', pointerEnd);
    document.removeEventListener('pointercancel', pointerEnd);
    view.removeEventListener('blur', stop);
  };
}
