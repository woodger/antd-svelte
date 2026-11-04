import { describe, expect, it } from 'vitest';
import { getSliderPrefixCss } from './slider-prefix.engine';

describe('Slider prefix stylesheet', () => {
  it('uses the existing stylesheet for the default prefix', () => {
    expect(getSliderPrefixCss('ant-slider')).toBeUndefined();
  });

  it('changes both modes and tooltip ownership without changing variables or shared markers', () => {
    const css = getSliderPrefixCss('tenant-slider')!;

    expect(css).toContain('.tenant-slider:where([data-ant-slider-prefix])');
    expect(css).toContain('.tenant-slider-horizontal:where([data-ant-slider-prefix])');
    expect(css).toContain('.tenant-slider-handle-dragging-delete');
    expect(css).toContain('.tenant-slider-track-draggable');
    expect(css).toContain('.tenant-slider-tooltip .ant-tooltip-container');
    expect(css).toContain('[class^="tenant-slider"]');
    expect(css).toContain('--ant-slider-rail-size');
    expect(css).toContain('.ant-slider-css-var');
    expect(css).not.toContain('--tenant-slider-rail-size');
    expect(css).not.toContain('\n.ant-slider-css-var{');
    expect(css).not.toContain('.ant-slider-handle');
  });

  it('keeps replacement characters literal and scopes prefixes that overlap the private marker', () => {
    expect(getSliderPrefixCss('slider-$&')).toContain('.slider-$&-handle');
    expect(getSliderPrefixCss('ant-slider-business')).toContain('.ant-slider-business-handle');
    expect(getSliderPrefixCss('ant-slider-business')).not.toContain('business-business');
    expect(getSliderPrefixCss('ant-slider-css-var'))
      .toContain('.ant-slider-css-var:where([data-ant-slider-prefix])');
    expect(getSliderPrefixCss('slider-</style><script>')).not.toContain('</style');
  });
});
