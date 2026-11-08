/** Форматы async-validator 6.0.0; MIT: vendor/LICENSE.rc-async-validator. */
const emailPattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+\.)+[a-zA-Z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]{2,}))$/;
const telPattern = /^(\+[0-9]{1,3}[-\s\u2011]?)?(\([0-9]{1,4}\)[-\s\u2011]?)?([0-9]+[-\s\u2011]?)*[0-9]+$/;
const hexPattern = /^#?([a-f0-9]{6}|[a-f0-9]{3})$/i;
const octet = '(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]\\d|\\d)';
const ipv4 = `${octet}(?:\\.${octet}){3}`;
const letter = '[a-z\\u00a1-\\uffff0-9]';
// Те же domain labels без неоднозначного разбиения соседних alphanumeric символов.
const host = `${letter}(?:[a-z\\u00a1-\\uffff0-9_-]*${letter})?`;
const domain = `(?:\\.${letter}(?:[a-z\\u00a1-\\uffff0-9-]*${letter})?)*`;
const tld = '(?:\\.[a-z\\u00a1-\\uffff]{2,})';
const urlPattern = new RegExp(
  `^(?:(?:[a-z]+:)?//|www\\.)(?:\\S+(?::\\S*)?@)?`
    + `(?:localhost|${ipv4}|\\[[^\\]]+\\]|${host}${domain}${tld})`
    + '(?::\\d+)?(?:[/?#][^\\s"]*)?$', 'i'
);

export function matchesValidationFormat(value: unknown, type: string) {
  if (typeof value !== 'string') return false;

  switch (type) {
    case 'email': return value.length <= 320 && emailPattern.test(value);
    case 'tel': return value.length <= 32 && telPattern.test(value);
    case 'hex': return hexPattern.test(value);
    case 'url':
      if (value.length > 2048 || !urlPattern.test(value)) return false;
      try {
        // URL проверяет IPv6 brackets и диапазон порта, которые source regex теряет.
        new URL(value.startsWith('//') ? `http:${value}`
          : /^www\./i.test(value) ? `http://${value}` : value);
        return true;
      } catch { return false; }
    default: return false;
  }
}

export function matchesValidationPattern(value: unknown, pattern: RegExp | string, coerce: boolean) {
  if (!pattern) return true;

  try {
    const expression = typeof pattern === 'string' ? new RegExp(pattern)
      : new RegExp(pattern.source, pattern.flags);
    return expression.test((coerce ? String(value) : value) as string);
  } catch {
    return false;
  }
}
