/** Сопоставляет вычисленные стили Upload, сохраняя различия React/Svelte обёрток. */
export function snapshotUploadPrefix() {
  const root = document.querySelector<HTMLElement>('.fixture-upload-prefix');
  if (!root) throw new Error('Upload root is missing');
  const prefix = [...root.classList].find(value => value.endsWith('-wrapper'))!.slice(0, -8);
  const selector = (suffix: string) => `[class~="${prefix}${suffix}"]`;
  const part = (suffix: string) => root.querySelector(selector(suffix));

  const typography = ['font-family', 'font-size', 'font-weight', 'line-height', 'color'];
  const box = [
    'width', 'height', 'min-width', 'padding-top', 'padding-right', 'padding-bottom',
    'padding-left', 'border-top-width', 'border-top-color', 'border-top-style',
    'border-radius', 'background-color', 'box-shadow'
  ];
  const css = (node: Element | null, keys: readonly string[]) => {
    if (!node) return null;
    const style = getComputedStyle(node);
    return Object.fromEntries(keys.map(key => [key, style.getPropertyValue(key)]));
  };
  const area = root.querySelector(`${selector('-select')}, ${selector('-drag')}`);

  return {
    root: css(root, typography),
    area: css(area, [...typography, ...box, 'cursor']),
    trigger: css(area?.querySelector('button') ?? null, [...typography, ...box]),
    dragText: css(part('-text'), typography),
    dragHint: css(part('-hint'), typography),
    items: [...root.querySelectorAll(selector('-list-item-container'))].map(container => {
      const row = container.querySelector(selector('-list-item'));
      const filename = row?.querySelector(selector('-list-item-name')) ?? null;
      const progress = row?.querySelector(selector('-list-item-progress')) ?? null;

      return {
        container: css(container, ['width', 'height', 'margin-bottom']),
        row: css(row ?? null, [...typography, ...box, 'margin-top']),
        backdrop: row ? {
          background: getComputedStyle(row, '::before').backgroundColor,
          opacity: getComputedStyle(row, '::before').opacity
        } : null,
        filename: css(filename, [
          ...typography, 'text-decoration-line', 'text-decoration-color',
          'padding-left', 'padding-right', 'display'
        ]),
        thumbnail: css(row?.querySelector(selector('-list-item-thumbnail')) ?? null, [
          ...typography, ...box, 'text-decoration-line'
        ]),
        icon: css(row?.querySelector(`${selector('-icon')} .anticon`) ?? null, typography),
        actions: [...(row?.querySelectorAll(selector('-list-item-action')) ?? [])].map(node => ({
          button: css(node, [...typography, ...box, 'opacity']),
          icon: css(node.querySelector('.anticon'), typography)
        })),
        actionsContainer: css(row?.querySelector(selector('-list-item-actions')) ?? null, [
          'opacity', 'color', 'font-size'
        ]),
        preview: css(row?.querySelector(`${selector('-list-item-actions')} > a`) ?? null, [
          ...typography, 'text-decoration-line', 'opacity'
        ]),
        progress: css(progress, ['bottom', 'padding-left', 'line-height']),
        progressInner: css(progress?.querySelector('[data-ant-progress-part="rail"], [class*="-progress-rail"]') ?? null, [
          'height', 'border-radius', 'background-color'
        ]),
        progressBar: css(progress?.querySelector('[data-ant-progress-part="track"], [class*="-progress-track"]') ?? null, [
          'height', 'border-radius', 'background-color'
        ])
      };
    })
  };
}
