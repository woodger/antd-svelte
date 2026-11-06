import {
  getBorderBeamCount,
  getBorderBeamStyle,
  type BorderBeamBorderWidth,
  type BorderBeamRuntimeOptions
} from './border-beam.engine';

export function createBorderBeamRuntime(host: HTMLElement) {
  const document = host.ownerDocument;
  const view = document.defaultView!;
  const computed = view.getComputedStyle(host);
  const parseWidth = (value: string) => {
    const width = parseFloat(value);

    return Number.isNaN(width) ? 0 : width;
  };
  // Как useBorderSize: снимок принадлежит узлу и не обновляется при изменении его стиля.
  const widths: BorderBeamBorderWidth = [
    parseWidth(computed.borderTopWidth),
    parseWidth(computed.borderRightWidth),
    parseWidth(computed.borderBottomWidth),
    parseWidth(computed.borderLeftWidth)
  ];
  const layers: HTMLDivElement[] = [];
  let active = true;
  let current: BorderBeamRuntimeOptions | undefined;
  let origin: HTMLElement | undefined;
  let observer: MutationObserver | undefined;

  function sync() {
    if (!active || !current) return;
    const inherited: string[] = [];
    if (origin) {
      const source = view.getComputedStyle(origin);
      for (const name of source) {
        if (name.startsWith('--')) inherited.push(`${name}:${source.getPropertyValue(name)}`);
      }
    }
    const options = {
      ...current,
      themeStyle: [...inherited, current.themeStyle].filter(Boolean).join(';')
    };
    const count = getBorderBeamCount(options.count);

    while (layers.length > count)
      layers.pop()!.remove();

    for (let index = 0; index < count; index++) {
      const existing = layers[index];
      const layer = existing ?? document.createElement('div');
      const style = getBorderBeamStyle(options, widths, index);

      if (layer.className !== options.className)
        layer.className = options.className;

      if (layer.getAttribute('style') !== style)
        layer.setAttribute('style', style);

      if (!existing) {
        layer.setAttribute('aria-hidden', 'true');
        layers.push(layer);
        host.append(layer);
      }
    }
  }

  return {
    configure(options: BorderBeamRuntimeOptions) {
      if (!active) return;

      current = options;
      if (origin !== options.themeOrigin) {
        observer?.disconnect();
        view.removeEventListener('resize', sync);
        origin = options.themeOrigin;
        observer = origin ? new view.MutationObserver(sync) : undefined;
        for (let node = origin; node; node = node.parentElement ?? undefined)
          observer?.observe(node, { attributes: true });
        if (origin) view.addEventListener('resize', sync);
      }
      sync();
    },
    destroy() {
      active = false;
      observer?.disconnect();
      view.removeEventListener('resize', sync);

      for (const layer of layers)
        layer.remove();

      layers.length = 0;
    }
  };
}
