import type {
  SliderClassNames,
  SliderConfig,
  SliderRangeProps,
  SliderSemanticValue,
  SliderStyles
} from './slider-range.types';
import type { SliderSingleProps } from './slider.types';

/** useMergeSemantic Slider: provider slots/style, затем локальные slots/style. */
export function sliderSemantics<Props extends SliderSingleProps | SliderRangeProps>(
  props: Props,
  context: SliderConfig | undefined,
  classNames: SliderSemanticValue<SliderClassNames, Props> | undefined,
  styles: SliderSemanticValue<SliderStyles, Props> | undefined
) {
  const resolve = <Value>(entry: SliderSemanticValue<Value, Props> | undefined) =>
    typeof entry === 'function'
      ? (entry as (info: { props: Props }) => Value)({ props }) : entry;
  const contextClasses = resolve(context?.classNames);
  const localClasses = resolve(classNames);
  const contextStyles = resolve(context?.styles);
  const localStyles = resolve(styles);
  const classes: SliderClassNames = {};
  const mergedStyles: SliderStyles = {};

  for (const slot of ['root', 'tracks', 'track', 'rail', 'handle'] as const) {
    classes[slot] = [contextClasses?.[slot], localClasses?.[slot]].filter(Boolean).join(' ');
    mergedStyles[slot] = [
      contextStyles?.[slot],
      slot === 'root' && context?.style,
      localStyles?.[slot],
      slot === 'root' && props.style
    ].filter(Boolean).join(';');
  }

  return { classNames: classes, styles: mergedStyles };
}
