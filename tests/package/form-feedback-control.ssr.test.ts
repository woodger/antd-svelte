import { render } from 'svelte/server';
import { expect, it, vi } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import FormFeedbackControlCase from '../browser/fixtures/FormFeedbackControlCase.svelte';
import { feedbackControlSamples } from '../browser/fixtures/form-feedback-control-cases';
import reference from '../browser/fixtures/ant-design-form-feedback-control-reference.json';

it('pins independent Source feedback captures for inputs and selection', () => {
  expect(reference.reference).toMatchObject({ version: registry.upstream.version,
    revision: registry.upstream.revision, archiveSha256: registry.upstream.archiveSha256, errors: [] });
  expect(reference.cases.map(entry => entry.id)).toEqual(feedbackControlSamples.map(sample => sample.id));
  expect(reference.reference.warnings.every(item => item.id.endsWith('-nested-form')
    || item.message.includes('When Input is focused, dynamic add or remove prefix / suffix'))).toBe(true);
  expect(reference.reference.serverWarnings.every(item => item.id.endsWith('-nested-form'))).toBe(true);
});
it.each(reference.ssr)('renders $id feedback without browser globals or timers', entry => {
  vi.useFakeTimers();
  try {
    const sample = feedbackControlSamples.find(sample => sample.id === entry.id)!;
    const { body } = render(FormFeedbackControlCase, { props: { sample } });
    if (entry.view.icon) {
      expect(body).toContain(entry.view.icon.className);
      for (const path of entry.view.icon.path ?? []) expect(body).toContain(`d="${path}"`);
      expect(body.replace(/<!--[\s\S]*?-->/g, '').replace(/<[^>]*>/g, '')).toContain(entry.view.icon.text!);
    } else expect(body).not.toMatch(/class="[^"]*-item-feedback-icon(?:[ "-])/);
    expect(body).toContain(`data-form-status-read="control">${JSON.stringify(entry.view.status)}`);
    expect(entry.timers).toBe(0);
    expect(vi.getTimerCount()).toBe(0);
  } finally { vi.useRealTimers(); }
});
