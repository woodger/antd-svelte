import type { TagCloseConfig, TagConfig, TagProps } from './tag.types';
import type { AriaAttributes } from 'svelte/elements';

function getCloseConfig({ closable, closeIcon }: Pick<TagProps, 'closable' | 'closeIcon'>) {
  if (!closable && (closable === false || closeIcon === false || closeIcon === null))
    return false;
  if (closable == null && closeIcon == null) return null;

  const result: TagCloseConfig = {
    closeIcon: typeof closeIcon !== 'boolean' && closeIcon != null ? closeIcon : undefined
  };
  if (closable && typeof closable === 'object') Object.assign(result, closable);
  return result;
}

/** Undefined icon означает default glyph; boolean из object config оставляет пустой control. */
export function getTagClose(
  props: Pick<TagProps, 'closable' | 'closeIcon'>,
  context?: Pick<TagConfig, 'closable' | 'closeIcon'>
) {
  const local = getCloseConfig(props);
  const parent = context ? getCloseConfig(context) : null;
  const merged: TagCloseConfig = {};
  const attributes: AriaAttributes = {};
  const enabled = local !== false && (local !== null || parent !== false && parent !== null);

  if (enabled) {
    for (const record of [parent, local]) {
      if (!record) continue;
      for (const [name, value] of Object.entries(record)) {
        if (value !== undefined) Object.assign(merged, { [name]: value });
      }
    }
  }

  for (const [key, value] of Object.entries(merged)) {
    if (key === 'role' || key.startsWith('aria-')) Object.assign(attributes, { [key]: value });
  }

  return {
    visible: enabled && merged.closeIcon !== null,
    icon: merged.closeIcon,
    attributes
  };
}
