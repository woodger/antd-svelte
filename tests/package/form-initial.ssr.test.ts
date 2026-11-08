import registry from 'antd-svelte/porting/registry.json';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import reference from '../browser/fixtures/ant-design-form-initial-reference.json';
import FormInitialFixtures from '../browser/fixtures/FormInitialFixtures.svelte';

describe('Form field initial values public package', () => {
  it('pins initial values, reset priorities and live default changes to the source', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version, revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    expect(reference.defaultUpdate.updated.metrics.inputs).toEqual(['First']);
    expect(reference.defaultUpdate.reset.metrics.inputs).toEqual(['Second']);
    const list = reference.cases.find(({ sample }) => sample.id === 'list-local')!;
    expect(list.selectedReset.inputs).toEqual(['']);
    expect(list.fullReset.inputs).toEqual(['Local']);
  });

  it.each(['text', 'form-priority', 'nested', 'false', 'list-local'])(
    'renders the initial control value during SSR for %s', (initialCase) => {
      const expected = reference.cases.find(({ sample }) => sample.id === initialCase)!;
      const body = render(FormInitialFixtures, { props: { initialCase } }).body;
      const input = body.match(/<input(?=[^>]*aria-label="Field 0")[^>]*>/)![0];

      expect(input).toContain(`value="${expected.initial.inputs[0]}"`);
      expect(body).toContain(`"store":${JSON.stringify(expected.initial.store)}`);
    }
  );
});
