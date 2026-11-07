import { describe, expect, it } from 'vitest';
import { resolveVariant, type VariantOptions } from './variant.engine';
import reference from '../../tests/browser/fixtures/ant-design-config-variants-reference.json';

const cases: [string, VariantOptions][] = [
  ['default', {}],
  ['global-outlined', { globalVariant: 'outlined' }],
  ['global-filled', { globalVariant: 'filled' }],
  ['global-borderless', { globalVariant: 'borderless' }],
  ['global-underlined', { globalVariant: 'underlined' }],
  ['component-over-global', { globalVariant: 'underlined', componentVariant: 'filled' }],
  ['form-over-component', {
    globalVariant: 'underlined', componentVariant: 'filled', formVariant: 'borderless'
  }],
  ['local-over-form', {
    globalVariant: 'underlined', componentVariant: 'filled', formVariant: 'borderless', variant: 'outlined'
  }]
];

describe('Variant source priorities', () => {
  for (const [name, options] of cases) {
    it(`matches the unmodified UMD Input and Search button for ${name}`, () => {
      const sample = reference.cases.find(item => item.name === name)!;
      const state = resolveVariant(options);

      expect(state.variant).toBe(sample.expected.input.variants[0]);
      expect(state.isConfigured).toBe(sample.expected.search.buttonVariants.length > 0);
    });
  }

  it('uses Input fallback for the Search field while leaving an unconfigured button alone', () => {
    const sample = reference.cases.find(item => item.name === 'input-fallback')!;

    expect(resolveVariant({ fallbackVariant: 'filled' }).variant)
      .toBe(sample.expected.search.variants[0]);
    expect(resolveVariant({}).isConfigured).toBe(sample.expected.search.buttonVariants.length > 0);
  });

  it('keeps component config above Input fallback', () => {
    const sample = reference.cases.find(item => item.name === 'input-search-over-fallback')!;

    expect(resolveVariant({ componentVariant: 'filled', fallbackVariant: 'borderless' }).variant)
      .toBe(sample.expected.search.variants[0]);
  });

  it('keeps Form above the fallback component', () => {
    const sample = reference.cases.find(item => item.name === 'form-over-input-fallback')!;

    expect(resolveVariant({ formVariant: 'underlined', fallbackVariant: 'filled' }).variant)
      .toBe(sample.expected.search.variants[0]);
  });
});
