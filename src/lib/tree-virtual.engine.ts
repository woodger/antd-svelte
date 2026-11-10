/** Оценка Ant Tree wrapper; фактические высоты списка уточняются DOM-измерением. */
export function treeItemHeight(token: {
  paddingXS: number;
  controlHeightSM: number;
  Tree?: { titleHeight?: number; };
}): number {
  return token.paddingXS / 2 + (token.Tree?.titleHeight || token.controlHeightSM);
}
