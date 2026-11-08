import { describe, expect, it } from 'vitest';
import { getDescriptionsPrefixCss } from './descriptions-prefix.engine';

describe('Descriptions prefix stylesheet', () => {
  it('keeps the default stylesheet for the default prefix', () => {
    expect(getDescriptionsPrefixCss('ant-descriptions')).toBeUndefined();
  });

  it('styles owner rows, cells and colon pseudo elements without renaming theme variables', () => {
    const css = getDescriptionsPrefixCss('details')!;

    expect(css).toContain(
      '.details:where(.ant-descriptions-css-var:where([data-ant-descriptions-prefix="details"][data-ant-descriptions-global="ant"]))'
    );
    expect(css).toContain('.details-bordered');
    expect(css).toContain('.details-row');
    expect(css).toContain('.details-item-label::after');
    expect(css).toContain('--ant-descriptions-colon-margin-left');
    expect(css).not.toContain('.ant-descriptions-item-label');
  });

  it('isolates expanded Table row selectors by the owner global prefix', () => {
    const css = getDescriptionsPrefixCss('details', 'suite')!;

    expect(css).toContain(
      '.suite-table-wrapper tr.suite-table-expanded-row :where([data-ant-descriptions-prefix="details"][data-ant-descriptions-global="suite"]) .details-view{display:flex;}'
    );
    expect(css).not.toContain('.ant-table-expanded-row');
    expect(getDescriptionsPrefixCss('ant-descriptions', 'suite')).toContain('.suite-table-wrapper');
  });

  it('keeps literal replacements and escapes closing style text', () => {
    expect(getDescriptionsPrefixCss('ant-descriptions-rtl')).not.toContain('rtl-rtl-rtl');
    expect(getDescriptionsPrefixCss('details-$&')).toContain('.details-$&-header');
    expect(getDescriptionsPrefixCss('details-</style><script>')).not.toContain('</style');
  });
});
