import { describe, expect, it } from 'vitest';
import { getTimelinePrefixCss } from './timeline-prefix.engine';
import { timelineItems } from './timeline.engine';

describe('Timeline local prefix boundary', () => {
  it('uses the shared sheet by default and keeps Steps variable names for custom prefixes', () => {
    expect(getTimelinePrefixCss('ant-timeline')).toBeUndefined();
    const css = getTimelinePrefixCss('history')!;

    expect(css).toContain('.history:where([data-ant-timeline-prefix])');
    expect(css).toContain('.history-horizontal:where([data-ant-timeline-prefix])');
    expect(css).toContain(':where(.ant-timeline-css-var[data-ant-timeline-prefix])');
    expect(css).toContain('--ant-timeline-dot-size');
    expect(css).toContain('--ant-cmp-steps-icon-size');
    expect(css).not.toContain('--history-dot-size');
  });

  it('keeps literal replacement text and escapes closing style tags', () => {
    const css = getTimelinePrefixCss('history-$&</STYLE><script>')!;

    expect(css).toContain('history-$&<\\/style><script>-item');
    expect(css).not.toMatch(/<\/style/i);
  });

  it('updates preset/placement classes while retaining color variables and pre-reverse placement', () => {
    const items = timelineItems([
      { key: 'a', title: 'A', color: 'green' },
      { key: 'b', title: 'B', color: '#123456' }
    ], 'alternate', 'Loading', true, 'history');

    expect(items.map(item => item.class)).toEqual([
      'history-item-placement-end', 'history-item-color-green history-item-placement-start'
    ]);
    expect(items[0].style).toBe('--ant-cmp-steps-item-icon-dot-color:#123456');
  });
});
