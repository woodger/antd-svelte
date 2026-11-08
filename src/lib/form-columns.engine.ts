import type { ColProps, ColSize, GridBreakpoint } from './grid.types';
import { gridBreakpoints } from './grid.engine';

function colSize(value: ColProps[GridBreakpoint]): ColSize {
  // Source теряет numeric shorthand при выводе offset; сохраняем обычную семантику Col.
  if (typeof value === 'number') return { span: value };

  return typeof value === 'object' && value !== null ? value : {};
}

/** Null label выравнивает control по Form.labelCol; локальные col props отключают offset. */
export function resolveFormWrapperCol({
  label, labelCol, wrapperCol, formLabelCol, formWrapperCol
}: {
  label?: string | null;
  labelCol?: ColProps;
  wrapperCol?: ColProps;
  formLabelCol?: ColProps;
  formWrapperCol?: ColProps;
}): ColProps | undefined {
  if (label !== null || labelCol || wrapperCol || !formLabelCol) {
    return wrapperCol ?? formWrapperCol;
  }

  const merged: ColProps = { ...formWrapperCol };
  const sizes = [undefined, ...[...gridBreakpoints].reverse()];
  for (const size of sizes) {
    const labelSize = size ? colSize(formLabelCol[size]) : formLabelCol;
    const wrapperSize = size ? colSize(merged[size]) : merged;
    if ('span' in labelSize && !('offset' in wrapperSize) && Number(labelSize.span) < 24) {
      if (size) merged[size] = { ...wrapperSize, offset: labelSize.span };
      else merged.offset = labelSize.span;
    }
  }

  return merged;
}
