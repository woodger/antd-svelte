import type { FormItemProps } from 'antd-svelte';
import registry from 'antd-svelte/porting/registry.json';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import reference from '../browser/fixtures/ant-design-form-hidden-reference.json';
import FormHiddenFixtures from '../browser/fixtures/FormHiddenFixtures.svelte';

describe('Form hidden public package', () => {
  it('pins the preserved source binding and metadata during hiding and reset', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version, revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    expect(reference.cases.find(({ id }) => id === 'hidden')).toMatchObject({
      display: 'none', retained: true, stableRef: true, local: 'Scratch', instance: true
    });
    expect(reference.cases.find(({ id }) => id === 'reset-hidden')).toMatchObject({
      display: 'none', retained: false, stableRef: false, local: 'Local'
    });
  });

  it('publishes hidden without deleting its children from SSR output', () => {
    const hidden: FormItemProps['hidden'] = true;
    const { body } = render(FormHiddenFixtures, { props: { initialHidden: hidden } });

    expect(hidden).toBe(true);
    expect(body).toContain('ant-form-item-hidden');
    expect(body).toContain('value="Alpha"');
    expect(body).toContain('Local draft');
    expect(body).toContain('Concealed');
  });
});
