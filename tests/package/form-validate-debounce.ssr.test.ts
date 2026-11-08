import type { FormItemProps } from 'antd-svelte';
import registry from 'antd-svelte/porting/registry.json';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import reference from '../browser/fixtures/ant-design-form-debounce-observation.json';
import FormValidateDebounceFixtures from '../browser/fixtures/FormValidateDebounceFixtures.svelte';

describe('Form validateDebounce public package', () => {
  it('pins source timing, silent validation and obsolete unmount work', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version, revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    expect(reference.cases.find(({ id, phase }) => id === 'burst' && phase === 'settled'))
      .toMatchObject({ calls: ['Good new'], errors: [], validating: false });
    expect(reference.cases.find(({ id, phase }) => id === 'silent' && phase === 'action'))
      .toMatchObject({ calls: ['bad-old'], errors: [], validating: true });
    expect(reference.cases.find(({ id, phase }) => id === 'unmount' && phase === 'settled'))
      .toMatchObject({ calls: ['bad-old'] });
    expect(reference.observations[0].id).toBe('unmount');
  });

  it('publishes the delay prop and renders its field without scheduling validation on SSR', () => {
    const props: Pick<FormItemProps, 'validateDebounce'> = { validateDebounce: 300 };
    const body = render(FormValidateDebounceFixtures).body;

    expect(props.validateDebounce).toBe(300);
    expect(body).toContain('name="name"');
    expect(body).toContain('value="Alpha"');
    expect(body).toContain('"calls":[]');
    expect(body).toContain('"validating":false');
    expect(body).not.toContain('Invalid Alpha');
    expect(body).not.toContain('validateDebounce=');
  });
});
