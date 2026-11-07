import type { ComponentSize } from 'antd-svelte';

/** Raw эталоны подписывают обычный размер middle; это метка замера, а не prop. */
export function referenceSizeLabel(size: ComponentSize) {
  return size === 'medium' ? 'middle' : size;
}

/** Воспроизводит текущий размер по историческим входным данным Source. */
export function currentReferenceSize(size: unknown): ComponentSize | undefined {
  if (size === 'small' || size === 'large') return size;
  if (size === 'medium' || size === 'middle') return 'medium';
  return undefined;
}
