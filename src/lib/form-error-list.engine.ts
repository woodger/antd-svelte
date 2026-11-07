import type { FormErrorListProps, FormValidateStatus } from './form-error-list.types';
import type { RenderEmptyContent } from './types';

export interface FormErrorEntity {
  key: string;
  content: RenderEmptyContent;
  status?: FormValidateStatus;
}

export interface FormErrorMotionEntity extends FormErrorEntity {
  visible: boolean;
}

/** Текст сохраняет identity; дубликаты и имена Object.prototype не создают одинаковые keys. */
export function buildFormErrorList({
  help, helpStatus, errors = [], warnings = []
}: Pick<FormErrorListProps, 'help' | 'helpStatus' | 'errors' | 'warnings'>): FormErrorEntity[] {
  function entity(
    content: RenderEmptyContent,
    prefix: string,
    index = 0,
    status?: FormValidateStatus
  ): FormErrorEntity {
    return { content, key: typeof content === 'string' ? content : `${prefix}-${index}`, status };
  }

  const messages = help !== undefined && help !== null
    ? [entity(help, 'help', 0, helpStatus)]
    : [
      ...errors.map((content, index) => entity(content, 'error', index, 'error')),
      ...warnings.map((content, index) => entity(content, 'warning', index, 'warning'))
    ];
  const counts = new Map<string, number>();
  for (const { key } of messages) counts.set(key, (counts.get(key) ?? 0) + 1);

  const used = new Set(messages.filter(({ key }) => counts.get(key) === 1).map(({ key }) => key));

  return messages.map((message, index) => {
    if (counts.get(message.key) === 1) return message;

    let key = `${message.key}-fallback-${index}`;
    while (used.has(key)) key = `${key}-fallback-${index}`;
    used.add(key);

    return { ...message, key };
  });
}

/** Порядок leaving rows следует diffKeys @rc-component/motion 1.3.3; см. LICENSE.rc-motion. */
export function reconcileFormErrorList(
  previous: readonly FormErrorMotionEntity[],
  current: readonly FormErrorEntity[]
): FormErrorMotionEntity[] {
  const merged: FormErrorMotionEntity[] = [];
  const keys = new Set(current.map(({ key }) => key));
  let cursor = 0;

  for (const entry of previous) {
    const index = current.findIndex((next, position) =>
      position >= cursor && next.key === entry.key
    );

    if (index < 0) {
      merged.push({ ...entry, visible: false });
    } else {
      merged.push(...current.slice(cursor, index + 1).map((next) => ({ ...next, visible: true })));
      cursor = index + 1;
    }
  }

  merged.push(...current.slice(cursor).map((entry) => ({ ...entry, visible: true })));

  return merged.filter((entry) => entry.visible || !keys.has(entry.key));
}
