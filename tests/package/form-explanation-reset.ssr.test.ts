import registry from 'antd-svelte/porting/registry.json';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import reference from '../browser/fixtures/ant-design-form-explanation-reset-reference.json';
import FormExplanationResetFixtures from '../browser/fixtures/FormExplanationResetFixtures.svelte';

describe('Form explanation reset public package', () => {
  it('pins selected, repeated and complete source resets of all three slots', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version, revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    expect(reference.selected['a-extra']).toBe('a-extra: 0');
    expect(reference.selected['b-extra']).toBe('b-extra: 1');
    expect(reference.repeated).toEqual(reference.selected);
    expect(reference.all).toEqual(reference.initial);
  });

  it('renders initial slot content and associations without client state during SSR', () => {
    const body = render(FormExplanationResetFixtures).body;

    for (const id of Object.keys(reference.initial)) {
      expect(body).toContain(`data-counter="${id}"`);
      expect(body).toContain(`${id}: 0`);
    }
    expect(body).toContain('name="a"');
    expect(body).toContain('name="b"');
  });
});
