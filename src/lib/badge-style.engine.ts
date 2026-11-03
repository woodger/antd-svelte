import {
  getInlineStyleDeclarations as getBadgeStyleDeclarations,
  type InlineStyleLayer as BadgeStyleLayer
} from './inline-style.engine';

export { getInlineStyleDeclarations as getBadgeStyleDeclarations } from './inline-style.engine';
export type { InlineStyleLayer as BadgeStyleLayer } from './inline-style.engine';

export function getBadgeStyleValue(layers: readonly BadgeStyleLayer[], property: string) {
  let result: string | undefined;
  let important = false;

  for (const declaration of getBadgeStyleDeclarations(layers)) {
    if (declaration.property === property && (!important || declaration.priority)) {
      result = declaration.value;
      important = Boolean(declaration.priority);
    }
  }

  return result;
}

export function serializeBadgeStyleLayers(layers: readonly BadgeStyleLayer[]) {
  return layers.map(layer => typeof layer === 'string' ? layer
    : layer?.filter(([, value]) => value !== '')
      .map(([property, value]) => `${property}:${value}`).join(';'))
    .filter(Boolean).join(';') || undefined;
}
