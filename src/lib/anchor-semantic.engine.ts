import type { AnchorConfig, AnchorProps, AnchorSlots } from './anchor.types';
import { mergeComponentSemantics } from './semantic-style.engine';

export function anchorSemantics(context: AnchorConfig | undefined, props: AnchorProps) {
  return mergeComponentSemantics<keyof AnchorSlots, AnchorProps>(
    context,
    props,
    ['root', 'item', 'itemTitle', 'indicator']
  );
}
