import { describe, expect, it } from 'vitest';
import {
  autoSplitterPercentages,
  collapseSplitterPanels,
  getSplitterAria,
  getSplitterPreviewOffset,
  getSplitterResizable,
  getSplitterSizes,
  normalizeSplitterPanels,
  resizeSplitterPanels,
  splitterAriaNumber,
  splitterPanelHidden
} from './splitter.engine';
import type { SplitterPanelProps } from './splitter.types';

describe('getSplitterSizes', () => {
  it.each<{ name: string; items: SplitterPanelProps[]; container: number; expected: number[]; }>([
    {
      name: 'mixed constraints and remaining space',
      items: [{ size: 100, min: 100, max: 200 }, { min: 100, max: 200 }, { min: '20%' }],
      container: 1000,
      expected: [100, 200, 700]
    },
    {
      name: 'all minimums filling the container',
      items: [{ min: 300 }, { min: 100, max: 200 }, { min: 600 }],
      container: 1000,
      expected: [300, 100, 600]
    },
    {
      name: 'greedy filling after minimums',
      items: [{ min: 100, max: 200 }, { min: 100, max: 200 }, { min: 400 }],
      container: 1000,
      expected: [200, 200, 600]
    },
    {
      name: 'impossible limits',
      items: [{ min: 600, max: 300 }, { min: 400, max: 200 }, { min: 600, max: 300 }],
      container: 1000,
      expected: [1000 / 3, 1000 / 3, 1000 / 3]
    },
    {
      name: 'normalizing complete proportions',
      items: [{ size: '20%' }, { size: '30%' }],
      container: 1000,
      expected: [400, 600]
    },
    {
      name: 'pixel minimum after shrinking',
      items: [{ size: 200, min: 200 }, { size: 800 }],
      container: 600,
      expected: [200, 400]
    },
    {
      name: 'percentage minimum after shrinking',
      items: [{ size: 200, min: '40%' }, { size: 800 }],
      container: 600,
      expected: [240, 360]
    },
    {
      name: 'maximum after growing',
      items: [{ size: 100, max: 200 }, { size: 100 }],
      container: 1000,
      expected: [200, 800]
    },
    {
      name: 'collapsed minimum stays zero',
      items: [{ size: 0, min: 200 }, { size: 1000 }],
      container: 600,
      expected: [0, 600]
    },
    {
      name: 'unfittable minimums keep proportions',
      items: [{ size: 200, min: 400 }, { size: 800, min: 400 }],
      container: 600,
      expected: [120, 480]
    },
    {
      name: 'all zero sizes return equal proportions',
      items: [{ size: 0 }, { size: 0 }],
      container: 1000,
      expected: [500, 500]
    }
  ])('resolves $name', ({ items, container, expected }) => {
    const result = getSplitterSizes(items, items.map(item => item.defaultSize), container);

    result.pixels.forEach((size, index) => expect(size).toBeCloseTo(expected[index], 8));
    expect(result.pixels).toHaveLength(expected.length);
  });

  it('uses all prop sizes if any panel is controlled and ignores other default sizes', () => {
    expect(getSplitterSizes([{ size: '60%' }, { defaultSize: 700 }], [200, 700], 1000).pixels)
      .toEqual([600, 400]);
    expect(getSplitterSizes([{ size: 0 }, {}], [200, 700], 1000).pixels).toEqual([0, 1000]);
    expect(getSplitterSizes([{}, {}], [200, 800], 1000).pixels).toEqual([200, 800]);
  });

  it('retains raw initial sizes for SSR and does not parse CSS lengths as percentages', () => {
    expect(getSplitterSizes([{}, {}], [23, undefined]).panels).toEqual([23, undefined]);
    expect(getSplitterSizes([{}, {}], ['33%', undefined]).panels).toEqual(['33%', undefined]);
    expect(getSplitterSizes([{ size: '2rem' }], [], 500).pixels).toEqual([]);
    expect(getSplitterSizes([], [], 500).pixels).toEqual([]);
  });

  it(
    'scales specified overflow and gives unspecified panels zero without fitting their minimums',
    () => {
      const result = autoSplitterPercentages([0.6, 0.6, undefined], [0.1, 0.1, 0.2], [1, 1, 1]);

      expect(result).toEqual([0.5, 0.5, 0]);
    }
  );
});

describe('getSplitterResizable', () => {
  it('normalizes boolean and directional collapse declarations with auto visibility', () => {
    const result = normalizeSplitterPanels([
      { collapsible: true },
      { collapsible: { start: true, showCollapsibleIcon: false } },
      {}
    ]);

    expect(result.map(item => item.collapsible)).toEqual([
      { start: true, end: true, showCollapsibleIcon: 'auto' },
      { start: true, showCollapsibleIcon: false },
      { start: false, end: false, showCollapsibleIcon: 'auto' }
    ]);
  });

  it('requires both panels and disables dragging a collapsed panel with a minimum', () => {
    const panels = normalizeSplitterPanels([{ min: 10 }, {}, { resizable: false }]);

    expect(getSplitterResizable(panels, [0, 50, 50], false).map(info => info.resizable))
      .toEqual([false, false]);
    expect(getSplitterResizable(panels, [20, 30, 50], false).map(info => info.resizable))
      .toEqual([true, false]);
  });

  it('switches collapse to expansion and merges visibility on overlapping controls', () => {
    const panels = normalizeSplitterPanels([
      { collapsible: { end: true, showCollapsibleIcon: false } },
      { collapsible: { start: true, showCollapsibleIcon: true } }
    ]);
    const normal = getSplitterResizable(panels, [20, 80], false)[0];
    const collapsed = getSplitterResizable(panels, [100, 0], false)[0];

    expect(normal.startCollapsible).toBe(true);
    expect(normal.endCollapsible).toBe(true);
    expect(normal.showStartCollapsibleIcon).toBe(false);
    expect(collapsed.startCollapsible).toBe(true);
    expect(collapsed.endCollapsible).toBe(false);
    expect(collapsed.showStartCollapsibleIcon).toBe(true);
    expect(getSplitterResizable(panels, [100, 0], true)[0].endCollapsible).toBe(true);
  });
});

describe('resizeSplitterPanels', () => {
  it('clamps both panel minimums and maximums while retaining their total size', () => {
    const panels = normalizeSplitterPanels([{ min: 10, max: 80 }, { min: 10, max: 80 }]);
    const infos = getSplitterResizable(panels, [50, 50], false);

    expect(resizeSplitterPanels(panels, infos, [50, 50], null, 0, -100, 100).sizes)
      .toEqual([20, 80]);
    expect(resizeSplitterPanels(panels, infos, [50, 50], null, 0, 100, 100).sizes)
      .toEqual([80, 20]);
  });

  it('keeps offsets relative to the gesture start rather than accumulating moves', () => {
    const panels = normalizeSplitterPanels([{}, {}]);
    const infos = getSplitterResizable(panels, [50, 50], false);
    const first = resizeSplitterPanels(panels, infos, [50, 50], null, 0, 10, 100);

    expect(first.sizes).toEqual([60, 40]);
    expect(resizeSplitterPanels(panels, infos, [50, 50], first.moving, 0, 20, 100).sizes)
      .toEqual([70, 30]);
  });

  it('chooses the first resizable nonzero panel to the left of overlapping bars', () => {
    const panels = normalizeSplitterPanels([{}, { defaultSize: 0 }, {}]);
    const infos = getSplitterResizable(panels, [50, 0, 50], false);
    const result = resizeSplitterPanels(
      panels,
      infos,
      [50, 0, 50],
      { index: 1, confirmed: false },
      1,
      -100,
      100
    );

    expect(result.sizes).toEqual([0, 50, 50]);
    expect(result.moving).toEqual({ index: 0, confirmed: true });

    panels[0].resizable = false;

    expect(resizeSplitterPanels(
      panels,
      getSplitterResizable(panels, [50, 0, 50], false),
      [50, 0, 50],
      { index: 1, confirmed: false },
      1,
      -100,
      100
    ).sizes).toEqual([50, 0, 50]);
  });
});

describe('collapseSplitterPanels', () => {
  it('collapses without respecting minimums and restores a compatible cached size', () => {
    const panels = normalizeSplitterPanels([{ min: 10 }, { min: '80%' }]);
    const folded = collapseSplitterPanels(panels, [20, 80], [], 0, 'start', false, 100);
    const restored = collapseSplitterPanels(
      panels,
      folded.sizes,
      folded.cache,
      0,
      'end',
      false,
      100
    );

    expect(folded.sizes).toEqual([0, 100]);
    expect(restored.sizes).toEqual([20, 80]);
    expect(collapseSplitterPanels(
      panels,
      restored.sizes,
      restored.cache,
      0,
      'end',
      false,
      100
    ).sizes)
      .toEqual([100, 0]);
  });

  it('uses the source fallback when a cached size no longer fits current limits', () => {
    const panels = normalizeSplitterPanels([{ max: 200 }, {}]);
    const folded = collapseSplitterPanels(panels, [300, 200], [], 0, 'start', false, 500);

    expect(collapseSplitterPanels(panels, folded.sizes, folded.cache, 0, 'end', false, 500).sizes)
      .toEqual([100, 400]);
  });

  it('uses the neighbor minimum as the fallback offset and reverses physical sides in RTL', () => {
    const panels = normalizeSplitterPanels([{ min: 150 }, {}]);
    const restored = collapseSplitterPanels(panels, [0, 440], [100], 0, 'end', false, 440);

    expect(restored.sizes).toEqual([150, 290]);
    expect(collapseSplitterPanels(panels, [150, 290], [], 0, 'start', true, 440).sizes)
      .toEqual([440, 0]);
  });
});

describe('Splitter ARIA and preview', () => {
  it('reports percentages and keeps pre-measurement attributes finite', () => {
    const items = [{ size: 100, min: 100, max: 200 }, { min: 100, max: 200 }, { min: '20%' }];
    const before = getSplitterAria(getSplitterSizes(items, []), 1);
    const ready = getSplitterAria(
      getSplitterSizes([{ size: '50%', min: '30%', max: '70%' }, {}], [], 100),
      0
    );

    expect(splitterAriaNumber(before.max)).toBe(80);
    expect(splitterAriaNumber(before.min)).toBe(0);
    expect(ready).toEqual({ now: 50, min: 30, max: 70 });
    expect([NaN, Infinity, -Infinity, 33.6].map(splitterAriaNumber)).toEqual([0, 0, 0, 34]);
  });

  it('limits preview offsets to the shared range including two adjacent zero panels', () => {
    expect(getSplitterPreviewOffset(100, 50, 30, 70, 1000)).toBe(20);
    expect(getSplitterPreviewOffset(100, 50, 30, 70, -1000)).toBe(-20);
    expect(getSplitterPreviewOffset(100, 0, 0, 0, 1000)).toBe(0);
  });

  it('recognizes the same collapsed raw sizes as the upstream panel', () => {
    expect([0, '0%', '0px', '-0%', 1, '20%', undefined].map(splitterPanelHidden))
      .toEqual([true, true, true, true, false, false, false]);
  });
});
