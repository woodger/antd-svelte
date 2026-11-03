export type BadgeStyleLayer = string | undefined | readonly (readonly [string, string])[];

/** Сохраняет declaration keys, строки, комментарии и function values без развёртки shorthand. */
export function* getBadgeStyleDeclarations(layers: readonly BadgeStyleLayer[]) {
  for (const layer of layers) {
    if (typeof layer !== 'string') {
      for (const [property, value] of layer ?? []) yield { property, value, priority: '' };
      continue;
    }
    let declaration = '';
    let depth = 0;
    let quote = '';
    let escaped = false;
    let comment = false;
    const source = `${layer ?? ''};`;

    for (let index = 0; index < source.length; index++) {
      const character = source[index];
      if (comment) {
        if (character === '*' && source[index + 1] === '/') {
          comment = false;
          index++;
        }
        continue;
      }
      if (escaped) {
        declaration += character;
        escaped = false;
        continue;
      }
      if (character === '\\') {
        declaration += character;
        escaped = true;
        continue;
      }
      if (quote) {
        declaration += character;
        if (character === quote) quote = '';
        continue;
      }
      if (character === '/' && source[index + 1] === '*') {
        declaration += ' ';
        comment = true;
        index++;
        continue;
      }
      if (character === '"' || character === "'") quote = character;
      if ('([{'.includes(character)) depth++;
      if (')]}'.includes(character)) depth--;
      if (character !== ';' || depth !== 0) {
        declaration += character;
        continue;
      }

      const separator = declaration.indexOf(':');
      const name = declaration.slice(0, separator).trim()
        .replace(/\\([\da-f]{1,6}\s?|[^\n\r\f])/gi, (_, escape: string) => {
          if (!/^[\da-f]/i.test(escape)) return escape;
          const code = Number.parseInt(escape, 16);
          return String.fromCodePoint(code > 0 && code <= 0x10ffff ? code : 0xfffd);
        });
      const value = declaration.slice(separator + 1).trim();
      const priority = /\s*!\s*important\s*$/i.test(value);
      const content = value.replace(/\s*!\s*important\s*$/i, '').trim();
      if (separator >= 0 && content) {
        yield {
          property: name.startsWith('--') ? name : name.toLowerCase(),
          value: content,
          priority: priority ? 'important' : ''
        };
      }
      declaration = '';
    }
  }
}

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
