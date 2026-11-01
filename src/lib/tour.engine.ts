import type {
  TourClosable,
  TourConfig,
  TourContent,
  TourGap,
  TourProps,
  TourSlots
} from './tour.types';

export interface TourRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface TourHighlight extends TourRect {
  radius: number;
}

export function getTourHighlight(rect: TourRect, gap?: TourGap): TourHighlight {
  const offset = gap?.offset;
  const x = (typeof offset === 'number' ? offset : offset?.[0]) ?? 6;
  const y = (typeof offset === 'number' ? offset : offset?.[1]) ?? 6;
  return {
    left: rect.left - x,
    top: rect.top - y,
    width: rect.width + x * 2,
    height: rect.height + y * 2,
    radius: typeof gap?.radius === 'number' && !Number.isNaN(gap.radius) ? gap.radius : 2
  };
}

export function getTourClosable(
  stepClosable: TourClosable | undefined,
  stepIcon: TourContent,
  closable: TourClosable | undefined,
  icon: TourContent
): Exclude<TourClosable, boolean> | null {
  function resolve(value: TourClosable | undefined, closeIcon: TourContent) {
    const object = typeof value === 'object' && value !== null;
    if (value === false || closeIcon === false && (!object || !value.closeIcon)) return null;
    const mergedIcon = typeof closeIcon === 'boolean' ? undefined : closeIcon;
    if (object) return { ...value, closeIcon: value.closeIcon ?? mergedIcon };
    return value || closeIcon ? { closeIcon: mergedIcon } : 'empty';
  }

  const step = resolve(stepClosable, stepIcon);
  if (step !== 'empty') return step;
  const root = resolve(closable, icon);
  return root === 'empty' ? { closeIcon: typeof icon === 'boolean' ? undefined : icon } : root;
}

export function hasTourContent(value: TourContent) {
  return value !== null && value !== undefined && value !== false && value !== '';
}

export function getTourCloseAttributes(value: Exclude<TourClosable, boolean> | null) {
  return Object.fromEntries(Object.entries(value ?? {}).filter(([key]) =>
    key === 'role' || key.startsWith('aria-') || key.startsWith('data-')));
}

export function getTourSemantics(context: TourConfig | undefined, props: TourProps) {
  const resolve = (value: TourProps['styles']) =>
    (typeof value === 'function' ? value({ props }) : value) ?? {};
  const contextClasses = resolve(context?.classNames);
  const localClasses = resolve(props.classNames);
  const contextStyles = resolve(context?.styles);
  const localStyles = resolve(props.styles);
  const classes: TourSlots = {};
  const styles: TourSlots = {};
  const names = ['root', 'cover', 'close', 'mask', 'section', 'footer', 'actions',
    'indicator', 'indicators', 'header', 'title', 'description'] as const;

  for (const name of names) {
    classes[name] = [contextClasses[name], localClasses[name]]
      .filter(Boolean).join(' ') || undefined;
    styles[name] = [
      name === 'mask' && contextStyles.root,
      contextStyles[name],
      name === 'mask' && context?.style,
      name === 'mask' && localStyles.root,
      localStyles[name],
      name === 'mask' && props.style
    ].filter(Boolean).join(';') || undefined;
  }
  return { classes, styles };
}
