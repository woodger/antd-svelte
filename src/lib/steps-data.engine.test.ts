import { describe, expect, it } from 'vitest';
import { stepsDataHasContent, stepsDataItems, stepsLayout } from './steps-data.engine';

describe('Steps expanded data and layout', () => {
  it(
    'preserves existing string keys and first-wins deduplication while accepting unkeyed and numeric source items',
    () => {
      const original = Object.freeze(
        [
          { key: 'first', title: 'First' },
          false,
          { key: 'first', title: 'Ignored' },
          { key: 0, title: 0 },
          { title: 'Unkeyed' }
        ] as const
      );
      const items = stepsDataItems(original);

      expect(items.map(item => item.title)).toEqual(['First', 0, 'Unkeyed']);
      expect(items.map(item => item.key)).toEqual(['first', '@steps:number:0', '@steps:index:3']);
      expect(original).toHaveLength(5);
    }
  );
  it('retains distinct explicit, numeric and generated keys', () => {
    const items = stepsDataItems(
      [{ key: '@steps:index:3' }, { key: '@steps:number:0' }, { key: 0 }, {}]
    );

    expect(items).toHaveLength(4);
    expect(new Set(items.map(item => item.key)).size).toBe(4);
  });
  it('retains explicit scalar content and its source presence rules', () => {
    expect(
      stepsDataItems(
        [
          { content: 0 },
          { content: false },
          { content: null }
        ]
      ).map(
        item => item.content
      )
    ).toEqual(
      [0, false, null]
    );
    for (const value of [0, false, '', true])
      expect(stepsDataHasContent(value)).toBe(true);

    expect(stepsDataHasContent(null)).toBe(false);
  });
  it(
    'preserves layout constraints for navigation, panel and dot',
    () => {
      expect(stepsLayout('navigation', undefined, true, false, 'vertical'))
        .toEqual(
          { type: 'navigation', dot: false, vertical: false, titlePlacement: 'horizontal' }
        );
      expect(stepsLayout('panel', 'vertical', true, true)).toEqual(
        { type: 'panel', dot: false, vertical: false, titlePlacement: 'horizontal' }
      );
      expect(stepsLayout('dot', undefined, true, false)).toEqual(
        { type: 'dot', dot: true, vertical: false, titlePlacement: 'vertical' }
      );
    }
  );
  it(
    'resolves orientation and title placement within dot and vertical constraints',
    () => {
      expect(
        stepsLayout(undefined, 'horizontal', false, true, 'vertical').vertical
      ).toBe(
        false
      );
      expect(stepsLayout('inline', undefined, true, true).titlePlacement).toBe(
        'horizontal'
      );
      expect(
        stepsLayout(undefined, 'vertical', false, false, 'vertical')
          .titlePlacement
      ).toBe(
        'horizontal'
      );
      expect(
        stepsLayout(undefined, undefined, false, false, 'vertical')
          .titlePlacement
      ).toBe(
        'vertical'
      );
    }
  );
});
