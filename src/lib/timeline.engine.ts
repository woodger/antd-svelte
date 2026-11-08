import type { StepsDataItem } from './steps-data.engine';
import type { TimelineContent, TimelineItem, TimelineMode } from './timeline.types';
export function timelineMode(mode?: TimelineMode): 'start' | 'end' | 'alternate' {
  return mode === 'alternate' || mode === 'end' ? mode : 'start';
}
export function timelineItems(
  items: readonly TimelineItem[],
  mode: 'start' | 'end' | 'alternate',
  loadingIcon: TimelineContent,
  reverse?: boolean,
  prefix = 'ant-timeline'
): StepsDataItem[] {
  const result: StepsDataItem[] = items.map((item, index) => {
    const {
      color,
      placement,
      loading,
      icon,
      title,
      content,
      class: className,
      style,
      ...rest
    } = item;
    const actualPlacement = placement
      ?? (mode === 'alternate'
        ? index % 2 === 0 ? 'start' : 'end'
        : mode);
    const preset = color && ['blue', 'red', 'green', 'gray'].includes(color);
    const actualIcon = icon ?? undefined;
    return {
      ...rest,
      title: title ?? undefined,
      content: content ?? undefined,
      icon: !actualIcon && loading ? loadingIcon : actualIcon,
      status: loading ? 'process' : 'finish',
      class: [
        className,
        preset && `${prefix}-item-color-${color}`,
        `${prefix}-item-placement-${actualPlacement}`
      ].filter(
        Boolean
      ).join(
        ' '
      ),
      style: [color && !preset && `--ant-cmp-steps-item-icon-dot-color:${color}`, style].filter(
        Boolean
      ).join(
        ';'
      )
    };
  });
  return reverse ? result.reverse() : result;
}
export function timelineLayoutAlternate(
  mode: 'start' | 'end' | 'alternate',
  orientation: 'horizontal' | 'vertical',
  items: readonly StepsDataItem[]
) {
  return mode === 'alternate'
    || orientation === 'vertical'
    && items.some(
      item => Boolean(item.title)
    );
}
