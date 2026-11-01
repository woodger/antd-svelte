import type {
  TypographyBlockProps,
  TypographyContent,
  TypographyEllipsisConfig,
  TypographyTextProps
} from './typography.types';
import type { TooltipProps } from './tooltip.types';

function isTooltipConfig(
  value: TypographyEllipsisConfig['tooltip']
): value is Omit<TooltipProps, 'children'> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function typographyTooltip(
  value: TypographyEllipsisConfig['tooltip'],
  fallback: TypographyContent
): {
  title: TypographyContent;
  options: Omit<TooltipProps, 'children' | 'title'>;
} {
  if (value === true) return { title: fallback, options: {} };
  if (isTooltipConfig(value)) {
    return { title: Object.hasOwn(value, 'title') ? value.title : fallback, options: value };
  }
  return { title: value, options: {} };
}

/** Как rc-util toArray: вложенные массивы раскрываются, пустые и boolean nodes пропускаются. */
export function typographyNodes(value: TypographyContent): Exclude<
  TypographyContent, readonly TypographyContent[] | boolean | null | undefined
>[] {
  if (typeof value === 'string' || typeof value === 'number'
    || typeof value === 'bigint' || typeof value === 'function') return [value];
  if (Array.isArray(value)) return value.flatMap(typographyNodes);
  return [];
}

export function typographyNodeLength(value: TypographyContent): number {
  return typographyNodes(value).reduce<number>((length, node) => length + (
    typeof node === 'string' || typeof node === 'number' ? String(node).length : 1
  ), 0);
}

/** Slice использует UTF-16, как исходный String.slice; snippet и bigint считаются одним узлом. */
export function typographySlice(value: TypographyContent, length: number): TypographyContent[] {
  const output: TypographyContent[] = [];
  let remaining = length;
  for (const node of typographyNodes(value)) {
    if (remaining === 0) return output;
    const text = typeof node === 'string' || typeof node === 'number';
    const size = text ? String(node).length : 1;
    if (size > remaining) {
      output.push(String(node).slice(0, remaining));
      return output;
    }
    output.push(node);
    remaining -= size;
  }
  return output;
}

export function typographyCopyFallback(value: TypographyContent): string {
  function stringify(node: TypographyContent): string {
    if (node == null) return '';
    if (typeof node === 'function') return '[object Object]';
    if (Array.isArray(node)) return node.map(stringify).join(',');
    return String(node);
  }
  if (value == null) return '';
  return Array.isArray(value) ? value.map(stringify).join('') : stringify(value);
}

export function typographyCopyNodes(value: TypographyContent): readonly TypographyContent[] {
  if (value === false) return [false, false];
  return Array.isArray(value) ? value : [value];
}

export function typographyActionNode(
  value: TypographyContent,
  fallback: TypographyContent,
  icon = false
) {
  if (value === true || value === undefined) return fallback;
  return value || (icon ? fallback : false);
}

export function typographyHasChildren(value: TypographyContent) {
  return value !== null && value !== undefined && value !== false && value !== '';
}

export function typographyDecorationTags(props: Pick<
  TypographyBlockProps, 'mark' | 'code' | 'underline' | 'delete' | 'strong' | 'keyboard' | 'italic'
>) {
  const tags: ('strong' | 'u' | 'del' | 'code' | 'mark' | 'kbd' | 'i')[] = [];
  if (props.strong) tags.push('strong');
  if (props.underline) tags.push('u');
  if (props.delete) tags.push('del');
  if (props.code) tags.push('code');
  if (props.mark) tags.push('mark');
  if (props.keyboard) tags.push('kbd');
  if (props.italic) tags.push('i');
  return tags.reverse();
}

export function typographyTextEllipsis(value: TypographyTextProps['ellipsis']) {
  if (!value || typeof value !== 'object') return value;
  const result: TypographyEllipsisConfig = { ...value };
  delete result.rows;
  delete result.expandable;
  return result;
}

export function typographyMeasureNeeded(
  enabled: boolean,
  config: TypographyEllipsisConfig,
  editable: boolean,
  copyable: boolean
) {
  return Boolean(enabled && (config.suffix !== undefined || config.onEllipsis
    || config.expandable || editable || copyable));
}

export function typographyEditValue(value: string) {
  return value.replace(/[\n\r]/g, '');
}

export function typographyEditKey(
  previous: number | undefined,
  event: Pick<KeyboardEvent, 'keyCode' | 'ctrlKey' | 'altKey' | 'metaKey' | 'shiftKey'>,
  composing: boolean
) {
  if (previous !== event.keyCode || composing
    || event.ctrlKey || event.altKey || event.metaKey || event.shiftKey) return undefined;
  if (event.keyCode === 13) return 'save';
  if (event.keyCode === 27) return 'cancel';
  return undefined;
}
