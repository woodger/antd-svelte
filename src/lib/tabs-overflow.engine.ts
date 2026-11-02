import type { TabsItem } from './tabs.types';

export interface TabsOffset {
  key: string;
  start: number;
  size: number;
}

/** Границы useVisibleRange из @rc-component/tabs 1.13.0, включая floor на правом крае. */
export function getTabsVisibleRange(
  offsets: readonly TabsOffset[],
  visibleLength: number,
  scroll: number
): [number, number] {
  if (!offsets.length) return [0, 0];

  let end = offsets.length;
  for (let index = 0; index < offsets.length; index++) {
    const tab = offsets[index];
    if (Math.floor(tab.start + tab.size) > Math.floor(scroll + visibleLength)) {
      end = index - 1;
      break;
    }
  }
  let start = 0;
  for (let index = offsets.length - 1; index >= 0; index--) {
    if (offsets[index].start < scroll) {
      start = index + 1;
      break;
    }
  }
  return start > end ? [0, -1] : [start, end];
}

export function getTabsMoreNavigationKey(
  items: readonly Pick<TabsItem, 'key' | 'disabled'>[],
  key: string | null,
  offset: -1 | 1
): string | null {
  const enabled = items.filter(item => !item.disabled);
  if (!enabled.length) return null;

  // В OperationNode исходный findIndex=-1 сохраняется; первый ArrowUp выбирает предпоследний.
  const index = enabled.findIndex(item => item.key === key) || 0;
  return enabled[(index + offset + enabled.length) % enabled.length].key;
}

/** is-mobile 5.0.0 без tablet/featureDetect; MIT, vendor/LICENSE.is-mobile. */
export function isTabsMobileDevice(userAgent: string): boolean {
  return !/CrOS/.test(userAgent)
    && /(android|bb\d+|meego).+mobile|armv7l|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|redmi|series[46]0|samsungbrowser.*mobile|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(userAgent);
}
