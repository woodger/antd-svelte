export { connectPopupPortal as connectTourPortal } from './popup-portal.dom';

interface EscapeScope {
  callbacks: ((event: KeyboardEvent) => void)[];
  compositionEnded: number;
  keydown: (event: KeyboardEvent) => void;
  compositionend: () => void;
}
const escapeScopes = new WeakMap<Window, EscapeScope>();

export function connectTourEscape(view: Window, callback: (event: KeyboardEvent) => void) {
  let scope = escapeScopes.get(view);
  if (!scope) {
    const state: EscapeScope = {
      callbacks: [],
      compositionEnded: 0,
      keydown(event) {
        if (event.key !== 'Escape' || event.isComposing
          || Date.now() - state.compositionEnded < 200) return;
        for (const handler of [...state.callbacks].reverse()) handler(event);
      },
      compositionend() {
        state.compositionEnded = Date.now();
      }
    };
    scope = state;
    escapeScopes.set(view, scope);
  }
  if (!scope.callbacks.length) {
    view.addEventListener('keydown', scope.keydown);
    view.addEventListener('compositionend', scope.compositionend);
  }
  scope.callbacks.push(callback);
  return () => {
    const index = scope.callbacks.indexOf(callback);
    if (index !== -1) scope.callbacks.splice(index, 1);
    if (!scope.callbacks.length) {
      view.removeEventListener('keydown', scope.keydown);
      view.removeEventListener('compositionend', scope.compositionend);
    }
  };
}
