/**
 * rc-select считает UTF-16 units. Сохраняем его slice/ellipsis, но не разрываем
 * существующую surrogate pair: иначе корректный emoji превращается в invalid text.
 */
export function getSelectTagText(text: string, maxLength?: number) {
  if (typeof maxLength !== 'number' || !(text.length > maxLength)) return text;

  const shortened = text.slice(0, maxLength);
  const high = text.charCodeAt(shortened.length - 1);
  const low = text.charCodeAt(shortened.length);
  const splitsPair = high >= 0xD800 && high <= 0xDBFF && low >= 0xDC00 && low <= 0xDFFF;
  return `${splitsPair ? shortened.slice(0, -1) : shortened}...`;
}
