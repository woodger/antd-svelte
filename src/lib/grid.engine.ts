import type { ColProps, GridGap, GridGutter, GridResponsive, GridScreenMap } from './grid.types';
import type { AliasToken } from './theme-token.types';
import type { GridBreakpoint } from './grid.types';

export const gridBreakpoints = ['xxxl', 'xxl', 'xl', 'lg', 'md', 'sm', 'xs'] as const;
export const gridMediaQueries = {
  xs: '(max-width: 575px)',
  sm: '(min-width: 576px)',
  md: '(min-width: 768px)',
  lg: '(min-width: 992px)',
  xl: '(min-width: 1200px)',
  xxl: '(min-width: 1600px)',
  xxxl: '(min-width: 1920px)'
} as const;

type BreakpointTokens = Pick<AliasToken, Extract<keyof AliasToken, `screen${string}`>>;

/** Source responsiveObserver проверяет порядок границ до создания matchMedia queries. */
export function getGridMediaQueries(token: BreakpointTokens): Record<GridBreakpoint, string> {
  const names = ['XS', 'SM', 'MD', 'LG', 'XL', 'XXL', 'XXXL'] as const;
  for (const [index, name] of names.entries()) {
    const minimum = token[`screen${name}Min`];
    const current = token[`screen${name}`];
    if (!(minimum <= current)) {
      throw new Error(`screen${name}Min<=screen${name} fails : !(${minimum}<=${current})`);
    }
    if (name !== 'XXXL') {
      const maximum = token[`screen${name}Max`];
      if (!(current <= maximum)) {
        throw new Error(`screen${name}<=screen${name}Max fails : !(${current}<=${maximum})`);
      }
      const next = names[index + 1];
      const nextMinimum = token[`screen${next}Min`];
      if (!(maximum <= nextMinimum)) {
        throw new Error(`screen${name}Max<=screen${next}Min fails : !(${maximum}<=${nextMinimum})`);
      }
    }
  }

  return {
    xs: `(max-width: ${token.screenXSMax}px)`,
    sm: `(min-width: ${token.screenSM}px)`,
    md: `(min-width: ${token.screenMD}px)`,
    lg: `(min-width: ${token.screenLG}px)`,
    xl: `(min-width: ${token.screenXL}px)`,
    xxl: `(min-width: ${token.screenXXL}px)`,
    xxxl: `(min-width: ${token.screenXXXL}px)`
  };
}

export function gridResponsiveValue<Value>(
  value: Value | GridResponsive<Value>,
  screens: GridScreenMap | null
): Value | undefined {
  if (typeof value !== 'object' || value === null) return value as Value;

  for (const key of gridBreakpoints)
    if (screens?.[key]
      && (value as GridResponsive<Value>)[key] !== undefined) return (value as GridResponsive<
        Value
      >)[key];
  return undefined;
}

export function gridGutters(
  gutter: GridGutter | [GridGutter, GridGutter],
  screens: GridScreenMap | null
): [GridGap, GridGap] {
  const values = Array.isArray(gutter) ? gutter : [gutter, undefined];
  // useGutter эталона при SSR/null считает все breakpoints совпавшими.
  const available = screens ?? Object.fromEntries(gridBreakpoints.map(key => [key, true]));
  return values.map(value => gridResponsiveValue(value, available)) as [GridGap, GridGap];
}

export function parseGridFlex(value: string | number): string {
  if (value === 'auto') return '1 1 auto';
  if (typeof value === 'number' && !Number.isNaN(value)) return `${value} ${value} auto`;
  if (/^\d+(\.\d+)?(px|em|rem|%)$/.test(String(value))) return `0 0 ${value}`;
  return String(value);
}

export function gridColClasses(props: ColProps, prefix = 'ant-col', rootPrefix = 'ant'): {
  classes: string[];
  variables: string;
  attributes: Record<string, string>;
} {
  const classes: string[] = [];
  const variables: string[] = [];
  const attributes: Record<string, string> = {};
  const namespace = rootPrefix.replace(/\./g, '');
  if (props.span !== undefined) {
    classes.push(`${prefix}-${props.span}`);
    attributes['data-ant-col-span'] = String(props.span);
  }
  for (const key of ['order', 'offset', 'push', 'pull'] as const)
    if (props[key])
      classes.push(`${prefix}-${key}-${props[key]}`);
  for (const breakpoint of [...gridBreakpoints].reverse()) {
    const previous = classes.length;
    const value = props[breakpoint];
    const options = typeof value === 'number' && !Number.isNaN(value)
      ? { span: value }
      : typeof value === 'object' && value !== null ? value : {};
    if (options.span !== undefined && options.span !== null) {
      classes.push(`${prefix}-${breakpoint}-${options.span}`);
      attributes[`data-ant-col-${breakpoint}-span`] = String(options.span);
    }
    for (const key of ['order', 'offset', 'push', 'pull'] as const)
      if (options[key] || options[key] === 0)
        classes.push(`${prefix}-${breakpoint}-${key}-${options[key]}`);
    if (options.flex || options.flex === 0) {
      classes.push(`${prefix}-${breakpoint}-flex`);
      variables.push(`--${namespace}-col-${breakpoint}-flex:${parseGridFlex(options.flex)}`);
    }
    if (classes.length !== previous) attributes[`data-ant-col-${breakpoint}`] = '';
  }
  return { classes, variables: variables.join(';'), attributes };
}

export function gridHalfGutter(value: GridGap, negative = false): string | undefined {
  if (!value) return undefined;
  return typeof value === 'number' && !Number.isNaN(value)
    ? `${value / (negative ? -2 : 2)}px`
    : `calc(${value} / ${negative ? -2 : 2})`;
}
