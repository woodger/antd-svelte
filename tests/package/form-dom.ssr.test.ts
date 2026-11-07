import { createForm, type FormInstance, type FormScrollOptions } from 'antd-svelte';
import registry from 'antd-svelte/porting/registry.json';
import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import reference from '../browser/fixtures/ant-design-form-dom-observation.json';
import FormDomFixtures from '../browser/fixtures/FormDomFixtures.svelte';
import FormDomScrollFixtures from '../browser/fixtures/FormDomScrollFixtures.svelte';

describe('Form DOM public package', () => {
  it('pins source focus and scroll captures and records ref-key and scroll-margin defects', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version, revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    expect(reference.cases.find(({ id }) => id === 'focus-nested'))
      .toMatchObject({ sameRef: false, active: { tag: 'literal' } });
    expect(reference.cases.find(({ id }) => id === 'focus-numeric'))
      .toMatchObject({ sameRef: false, active: { tag: 'string' } });
    expect(reference.scrollCases.find(({ id }) => id === 'nearest'))
      .toEqual({ id: 'nearest', top: 184, left: 220, focused: false });
    expect(reference.scrollCases.find(({ id }) => id === 'visible'))
      .toEqual({ id: 'visible', top: 184, left: 220, focused: false });
    expect(reference.observations).toHaveLength(3);
  });

  it('keeps public DOM methods safe before mount and exposes typed scrolling options', () => {
    const form: FormInstance<{ name: string }> = createForm({ initialValues: { name: 'Anna' } });
    const options: FormScrollOptions = {
      block: 'center', inline: 'nearest', scrollMode: 'if-needed', focus: true,
      behavior: (actions) => actions.map(({ el, top, left }) => ({ element: el, top, left }))
    };
    const instance: HTMLInputElement | undefined = form.getFieldInstance<HTMLInputElement>('name');

    expect(instance).toBeUndefined();
    expect(form.scrollToField('name', options)).toBeUndefined();
    expect(form.focusField('name')).toBeUndefined();
    expect(form.values.name).toBe('Anna');
  });

  it('renders field registrations and scroll fixtures without running browser work during SSR', () => {
    vi.useFakeTimers();
    try {
      expect(render(FormDomFixtures).body).toContain('Form DOM methods');
      expect(render(FormDomScrollFixtures).body).toContain('Scroll target');
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });
});
