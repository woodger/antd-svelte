import type { DescriptionsConfig, DescriptionsProps, DescriptionsSlots } from './descriptions.types';
import { mergeComponentSemantics } from './semantic-style.engine';

export function descriptionsSemantics(
  context: DescriptionsConfig | undefined,
  props: DescriptionsProps
) {
  return mergeComponentSemantics<keyof DescriptionsSlots, DescriptionsProps>(context, props,
    ['root', 'header', 'title', 'extra', 'label', 'content']);
}
