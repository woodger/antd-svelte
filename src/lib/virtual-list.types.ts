import type { VirtualScrollAlign } from './virtual-list.engine';

export interface VirtualScrollOffsetInfo<Key> {
  align?: VirtualScrollAlign;
  getSize: (startKey: Key, endKey?: Key) => { top: number; bottom: number | undefined; };
}
export type VirtualScrollOffset<Key> = number | ((info: VirtualScrollOffsetInfo<Key>) => number);
export type VirtualScrollTarget<Key> = {
  align?: VirtualScrollAlign;
  offset?: VirtualScrollOffset<Key>;
} & ({ key: Key; } | { index: number; });
export type VirtualScrollConfig<Key> = number | VirtualScrollTarget<Key>
  | { top?: number; left?: number; };
