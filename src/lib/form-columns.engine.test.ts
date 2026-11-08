import { describe, expect, it } from 'vitest';
import { resolveFormWrapperCol } from './form-columns.engine';
import type { ColProps } from './grid.types';

describe('resolveFormWrapperCol', () => {
  it.each([undefined, '', 'Name'])('keeps the configured columns for label=%s', (label) => {
    expect(resolveFormWrapperCol({
      label, formLabelCol: { span: 6 }, formWrapperCol: { span: 18 }
    })).toEqual({ span: 18 });
  });

  it('offsets a null label without mutating the caller columns', () => {
    const label = { span: 6 };
    const wrapper = { span: 18, style: 'padding:4px' };

    const result = resolveFormWrapperCol({
      label: null, formLabelCol: label, formWrapperCol: wrapper
    });

    expect(result).toEqual({ span: 18, offset: 6, style: 'padding:4px' });
    expect(label).toEqual({ span: 6 });
    expect(wrapper).toEqual({ span: 18, style: 'padding:4px' });
  });

  it('keeps an unconfigured control free of artificial columns', () => {
    expect(resolveFormWrapperCol({ label: null })).toBeUndefined();
    expect(resolveFormWrapperCol({ label: null, formWrapperCol: { span: 18 } }))
      .toEqual({ span: 18 });
  });

  it('disables derived offsets for explicit local col objects including empty objects', () => {
    expect(resolveFormWrapperCol({
      label: null, labelCol: {}, formLabelCol: { span: 6 }, formWrapperCol: { span: 18 }
    })).toEqual({ span: 18 });
    expect(resolveFormWrapperCol({
      label: null, wrapperCol: {}, formLabelCol: { span: 6 }, formWrapperCol: { span: 18 }
    })).toEqual({});
    expect(resolveFormWrapperCol({
      label: null, wrapperCol: { span: 12 }, formLabelCol: { span: 6 }
    })).toEqual({ span: 12 });
  });

  it.each([0, 2, undefined])('preserves a supplied offset=%s', (offset) => {
    expect(resolveFormWrapperCol({
      label: null, formLabelCol: { span: 6 }, formWrapperCol: { span: 18, offset }
    })).toEqual({ span: 18, offset });
  });

  it.each([24, 25, undefined])('does not derive an offset from span=%s', (span) => {
    expect(resolveFormWrapperCol({
      label: null, formLabelCol: { span }, formWrapperCol: { span: 18 }
    })).toEqual({ span: 18 });
  });

  it('preserves zero and numeric string spans for the root offset', () => {
    expect(resolveFormWrapperCol({ label: null, formLabelCol: { span: 0 } }))
      .toEqual({ offset: 0 });
    expect(resolveFormWrapperCol({ label: null, formLabelCol: { span: '6' } }))
      .toEqual({ offset: '6' });
  });

  it('derives responsive offsets independently and preserves explicit offsets', () => {
    const label: ColProps = { xs: { span: 24 }, sm: { span: 6 }, md: { span: 4 } };
    const wrapper: ColProps = {
      xs: { span: 24 }, sm: { span: 18, offset: 0 }, md: { span: 20 }, class: 'owner'
    };

    expect(resolveFormWrapperCol({
      label: null, formLabelCol: label, formWrapperCol: wrapper
    })).toEqual({
      xs: { span: 24 }, sm: { span: 18, offset: 0 }, md: { span: 20, offset: 4 }, class: 'owner'
    });
    expect(wrapper.md).toEqual({ span: 20 });
  });

  it.each([
    [{ sm: 6 }, { sm: { span: 12 } }],
    [{ sm: { span: 6 } }, { sm: 12 }],
    [{ sm: 6 }, { sm: 12 }]
  ] satisfies [ColProps, ColProps][])('keeps numeric responsive spans equivalent to object spans', (label, wrapper) => {
    expect(resolveFormWrapperCol({
      label: null, formLabelCol: label, formWrapperCol: wrapper
    })).toEqual({ sm: { span: 12, offset: 6 } });
  });

  it('preserves responsive objects with an explicit undefined offset', () => {
    expect(resolveFormWrapperCol({
      label: null, formLabelCol: { sm: { span: 6 } },
      formWrapperCol: { sm: { span: 12, offset: undefined } }
    })).toEqual({ sm: { span: 12, offset: undefined } });
  });
});
