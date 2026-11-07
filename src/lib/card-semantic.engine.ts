import type { CardConfig, CardMetaConfig, CardProps, CardMetaProps, CardSlots, CardMetaSlots }
  from './card.types';

import { mergeComponentSemantics } from './semantic-style.engine';

/** Порядок useMergeSemantic Card; legacy header/body остаются ниже merged semantic styles. */
export function cardSemantics(context: CardConfig | undefined, props: CardProps) {
  return mergeComponentSemantics<keyof CardSlots, CardProps>(context, props,
    ['root', 'header', 'body', 'title', 'extra', 'actions', 'cover']);
}

export function cardMetaSemantics(context: CardMetaConfig | undefined, props: CardMetaProps) {
  return mergeComponentSemantics<keyof CardMetaSlots, CardMetaProps>(context, props,
    ['root', 'section', 'avatar', 'title', 'description']);
}
