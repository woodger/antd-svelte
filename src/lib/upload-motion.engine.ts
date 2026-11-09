import type { UploadFile } from './upload.types';

export interface UploadMotionItem<T = unknown> {
  key: string;
  file: UploadFile<T>;
  status: 'add' | 'keep' | 'remove';
}

/** Порядок diffKeys @rc-component/motion 1.3.3 (MIT, vendor/LICENSE.rc-motion) с удержанием uid. */
export function getUploadMotionItems<T>(
  previous: readonly UploadMotionItem<T>[],
  files: readonly UploadFile<T>[]
): UploadMotionItem<T>[] {
  const current = files.map(file => ({ key: file.uid, file }));
  let next: UploadMotionItem<T>[] = [];
  let currentIndex = 0;

  for (const old of previous) {
    let found = false;
    for (let index = currentIndex; index < current.length; index++) {
      const item = current[index];
      if (item.key !== old.key) continue;

      next.push(...current.slice(currentIndex, index).map(file => ({
        ...file, status: 'add' as const
      })));
      next.push({ ...item, status: 'keep' });
      currentIndex = index + 1;
      found = true;
      break;
    }
    if (!found) next.push({ ...old, status: 'remove' });
  }
  next.push(...current.slice(currentIndex).map(file => ({ ...file, status: 'add' as const })));

  // В Source plain object ошибочно считает inherited имена uid; Map сохраняет keyed invariant.
  const counts = new Map<string, number>();
  for (const item of next) counts.set(item.key, (counts.get(item.key) ?? 0) + 1);
  next = next.filter(item => counts.get(item.key)! < 2 || item.status !== 'remove');
  for (const item of next) {
    if (counts.get(item.key)! > 1) item.status = 'keep';
  }

  return next;
}
