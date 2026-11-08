import registry from 'antd-svelte/porting/registry.json';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import reference from '../browser/fixtures/ant-design-form-use-status-reference.json';
import FormUseStatusFixtures from '../browser/fixtures/FormUseStatusFixtures.svelte';

describe('Form useFormItemStatus public package', () => {
  it('pins source pristine status, absent context and nested Form reset separately', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version, revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    const state = reference.cases.find(({ sample }) => sample.id === 'error')!.metrics;

    expect(state.outside).toEqual({ status: null, errors: [], warnings: [] });
    expect(state.inner).toEqual({ status: '', errors: [], warnings: [] });
    expect(state['inner-form']).toEqual({ status: null, errors: ['Invalid'], warnings: [] });
  });

  it('renders live getter fields from model metadata during SSR', () => {
    const body = render(FormUseStatusFixtures, { props: { initialCase: 'errors-warnings' } }).body;
    const main = body.match(/data-form-status-read="main">([^<]+)</)![1];
    const outside = body.match(/data-form-status-read="outside">([^<]+)</)![1];

    expect(JSON.parse(main)).toEqual({ status: 'error', errors: ['Invalid'], warnings: ['Check'] });
    expect(JSON.parse(outside)).toEqual({ status: null, errors: [], warnings: [] });
  });
});
