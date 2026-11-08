import type { FormItemProps } from 'antd-svelte';
import registry from 'antd-svelte/porting/registry.json';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import reference from '../browser/fixtures/ant-design-form-extra-reference.json';
import FormExtraFixtures from '../browser/fixtures/FormExtraFixtures.svelte';

describe('Form extra public package', () => {
  it('pins source zero, true, false and nested content presence with descriptions', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version, revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    expect(reference.cases.find(({ id }) => id === 'zero'))
      .toMatchObject({ extra: { text: '0' }, described: [{ kind: 'extra', text: '0' }] });
    expect(reference.cases.find(({ id }) => id === 'true')).toMatchObject({ extra: { text: '' } });
    expect(reference.cases.find(({ id }) => id === 'false')).toMatchObject({ extra: null });
  });

  it('accepts current Svelte content types for permanent field explanations', () => {
    const content: FormItemProps['extra'][] = [undefined, null, false, true, '', 0, [false, 0, 'Text']];
    const zero = render(FormExtraFixtures, { props: { initialMode: 'zero' } }).body;
    const missing = render(FormExtraFixtures).body;

    expect(content).toHaveLength(7);
    expect(zero).toMatch(/id="[^"]+_extra" class="ant-form-item-extra">(?:<!--[\s\S]*?-->)*0/);
    expect(missing).not.toMatch(/id="[^"]+_extra"/);
    expect(zero).toContain('aria-describedby=');
  });
});
