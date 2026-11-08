import registry from 'antd-svelte/porting/registry.json';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import reference from '../browser/fixtures/ant-design-form-slot-context-reference.json';
import FormSlotContextFixtures from '../browser/fixtures/FormSlotContextFixtures.svelte';

describe('Form slot context public package', () => {
  it('pins source helper ownership, explicit props and inherited Form appearance', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version, revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    const plain = reference.cases.find(({ sample }) => sample.id === 'default')!.metrics;
    const required = reference.cases.find(({ sample }) => sample.id === 'required')!.metrics;
    expect(plain.extra).toMatchObject({ name: null, id: null, required: false, describedBy: null });
    expect(plain.refIsMain).toBe(true);
    expect(required.popup.ariaRequired).toBeNull();
    expect(reference.cases.find(({ sample }) => sample.id === 'disabled')!.metrics.selector.disabled)
      .toBe(true);
    expect(reference.helperBlur).toEqual({ touched: false, value: 'Main' });
  });

  it('keeps names, required and error descriptions on the main control during SSR', () => {
    const body = render(FormSlotContextFixtures, { props: { initialCase: 'error' } }).body;
    const inputs = body.match(/<input\b[^>]*>/g)!;
    const main = inputs.find((input) => input.includes('aria-label="main control"'))!;
    const extra = inputs.find((input) => input.includes('aria-label="extra draft"'))!;
    const popup = inputs.find((input) => input.includes('aria-label="popup draft"'))!;

    expect(main).toContain('name="name"');
    expect(main).toContain('aria-invalid="true"');
    for (const helper of [extra, popup]) {
      expect(helper).toBeDefined();
      expect(helper).not.toMatch(/\s(?:name|id|required|aria-invalid|aria-describedby)=/);
    }
  });
});
