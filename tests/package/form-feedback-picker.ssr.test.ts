import { render } from 'svelte/server';
import { expect, it, vi } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import FormFeedbackPickerCase from '../browser/fixtures/FormFeedbackPickerCase.svelte';
import { feedbackPickerSamples } from '../browser/fixtures/form-feedback-picker-cases';
import reference from '../browser/fixtures/ant-design-form-feedback-picker-reference.json';

it('pins independent Source picker feedback captures and keeps picker flags distinct from Select', () => {
  expect(reference.reference).toMatchObject({ version: registry.upstream.version,
    revision: registry.upstream.revision, archiveSha256: registry.upstream.archiveSha256, errors: [] });
  expect(reference.cases.map(entry => entry.id)).toEqual(feedbackPickerSamples.map(sample => sample.id));
  expect(reference.cases).toHaveLength(66);
  expect(reference.cases.reduce((count, entry) => count + entry.steps.length, 0)).toBe(66);
  expect(reference.ssr).toHaveLength(16);
  expect(reference.cases.every(entry => !entry.initial.root.some(flag => flag === 'in-form-item'))).toBe(true);
});
it.each(reference.ssr)('renders $id feedback without browser globals or timers', entry => {
  vi.useFakeTimers();
  try {
    const sample = feedbackPickerSamples.find(sample => sample.id === entry.id)!;
    const { body } = render(FormFeedbackPickerCase, { props: { sample } });
    const prefix = sample.treePrefix ?? `${sample.rootPrefix ?? 'ant'}-picker`;
    expect(body.includes(`${prefix}-has-feedback`)).toBe(entry.view.root.some(flag => flag === 'has-feedback'));
    expect(body).not.toContain(`${prefix}-in-form-item`);
    if (entry.view.icon) {
      expect(body).toContain(entry.view.icon.className);
      for (const path of entry.view.icon.path) expect(body).toContain(`d="${path}"`);
    } else expect(body).not.toMatch(/class="[^"]*-item-feedback-icon(?:[ "-])/);
    expect(body).toContain(`data-form-status-read="control">${JSON.stringify(entry.view.status)}`);
    expect(entry.timers).toBe(0);
    expect(vi.getTimerCount()).toBe(0);
  } finally { vi.useRealTimers(); }
});
