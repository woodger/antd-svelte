/** Ant Design 6.6.8 / rc-select 1.10.1; MIT, vendor/LICENSE.rc-select. */
export function mergeTreeSelectComponentAttributes<Attributes extends object>(
  target: Attributes, generated: object, own: object | undefined, slot: 'root' | 'input'
): Attributes {
  Object.assign(target, slot === 'root' ? own : generated, slot === 'root' ? generated : own);
  for (const [key, callback] of Object.entries(own ?? {})) {
    const internal = Reflect.get(generated, key);
    if (typeof callback !== 'function' || typeof internal !== 'function') continue;
    Reflect.set(target, key, (...args: unknown[]) => {
      if (slot === 'root') { internal(...args); callback(...args); }
      else { callback(...args); internal(...args); }
    });
  }
  // React снимает delegated callbacks до удаления focused DOM. Svelte может
  // доставить blur уже отсоединённому элементу во время удаления snippet.
  for (const [key, callback] of Object.entries(target)) {
    if (!key.startsWith('on') || typeof callback !== 'function') continue;
    Reflect.set(target, key, (...args: unknown[]) => {
      const event = args[0];
      const node = event && typeof event === 'object' && 'currentTarget' in event ? event.currentTarget : undefined;
      if (node && typeof node === 'object' && 'isConnected' in node && node.isConnected === false) return;
      callback(...args);
    });
  }
  return target;
}

/** Собственный slot handler уже мог отменить событие; Native hook отменяет отдельно. */
export function treeSelectNativeKeyCancelled<EventType extends Event>(
  event: EventType, callback: ((event: EventType) => void) | null | undefined
) {
  if (!callback) return false;
  if (!event.defaultPrevented) { callback(event); return event.defaultPrevented; }
  const descriptor = Object.getOwnPropertyDescriptor(event, 'preventDefault');
  const original = event.preventDefault;
  let cancelled = false;
  Object.defineProperty(event, 'preventDefault', { configurable: true, writable: true,
    value() { cancelled = true; original.call(event); } });
  try { callback(event); }
  finally {
    if (descriptor) Object.defineProperty(event, 'preventDefault', descriptor);
    else Reflect.deleteProperty(event, 'preventDefault');
  }
  return cancelled;
}
