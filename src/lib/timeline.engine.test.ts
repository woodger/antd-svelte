import { describe, expect, it } from 'vitest';
import { timelineItems, timelineLayoutAlternate, timelineMode } from './timeline.engine';

describe('Timeline source data mapping', () => {
  it('preserves authored placement over the mode and defaults to start', () => {
    expect(timelineMode()).toBe('start');
    const items = timelineItems(
      [{ placement: 'end' }, { placement: 'start' }],
      'alternate',
      'loading'
    );

    expect(items.map(item => item.class)).toEqual(
      ['ant-timeline-item-placement-end', 'ant-timeline-item-placement-start']
    );
  });
  it('assigns alternate positions before reverse and preserves owner data', () => {
    const source = Object.freeze(
      [
        Object.freeze({ key: 'one', content: 'One' }),
        Object.freeze({ key: 'two', content: 'Two' }),
        Object.freeze({ key: 'three', content: 'Three' })
      ]
    );
    const items = timelineItems(source, 'alternate', 'loading', true);

    expect(items.map(item => item.content)).toEqual(['Three', 'Two', 'One']);
    expect(items.map(item => item.class)).toEqual(
      [
        'ant-timeline-item-placement-start',
        'ant-timeline-item-placement-end',
        'ant-timeline-item-placement-start'
      ]
    );
    expect(source[0].key).toBe('one');
  });
  it('preserves current scalar content and replaces falsy icons only for loading items', () => {
    const items = timelineItems(
      [
        {
          title: 0,
          content: false,
          loading: true,
          icon: 0
        },
        { title: null, content: 0, icon: true, loading: true }
      ],
      'start',
      'loading'
    );

    expect(items[0]).toMatchObject(
      { title: 0, content: false, icon: 'loading', status: 'process' }
    );
    expect(items[1]).toMatchObject(
      { title: undefined, content: 0, icon: true, status: 'process' }
    );
  });
  it('uses preset classes and lets inline styles override custom colors', () => {
    const items = timelineItems(
      [
        { color: 'red' },
        { color: '#123456', style: '--ant-cmp-steps-item-icon-dot-color:orange' }
      ],
      'end',
      'loading'
    );

    expect(items[0].class).toContain('ant-timeline-item-color-red');
    expect(items[1].style).toBe(
      '--ant-cmp-steps-item-icon-dot-color:#123456;--ant-cmp-steps-item-icon-dot-color:orange'
    );
    expect(items[1].class).not.toContain('color-');
  });
  it('uses truthy titles for vertical alternate layout but not horizontal layout', () => {
    expect(timelineLayoutAlternate('start', 'vertical', [{ title: 0 }])).toBe(false);
    expect(timelineLayoutAlternate('start', 'vertical', [{ title: true }])).toBe(true);
    expect(timelineLayoutAlternate('start', 'horizontal', [{ title: 'Title' }])).toBe(false);
    expect(timelineLayoutAlternate('alternate', 'horizontal', [])).toBe(true);
  });
});
