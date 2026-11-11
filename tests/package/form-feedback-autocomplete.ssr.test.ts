import { render } from 'svelte/server';
import { expect, it, vi } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import FormFeedbackAutoCompleteCase from '../browser/fixtures/FormFeedbackAutoCompleteCase.svelte';
import { feedbackAutoCompleteSamples } from '../browser/fixtures/form-feedback-autocomplete-cases';
import reference from '../browser/fixtures/ant-design-form-feedback-autocomplete-reference.json';

it('pins independent AutoComplete feedback captures including actual custom Input composition', () => {
  expect(reference.reference).toMatchObject({ version: registry.upstream.version,
    revision: registry.upstream.revision, archiveSha256: registry.upstream.archiveSha256, errors: [] });
  expect(reference.cases.map(entry => entry.id)).toEqual(feedbackAutoCompleteSamples.map(sample => sample.id));
  for (const id of ['input-error', 'textarea-error']) {
    const entry = reference.cases.find(entry => entry.id === id)!;
    expect(entry.initial.icons).toHaveLength(2);
    expect(entry.initial.suffix?.icons).toBe(1);
  }
  expect(reference.reference.warnings.every(entry => entry.id === 'nested-form'
    || entry.message.includes('When Input is focused, dynamic add or remove prefix / suffix'))).toBe(true);
});
it.each(reference.ssr)('renders $id feedback without DOM, validation or timers', entry => {
  vi.useFakeTimers();
  try {
    const sample = feedbackAutoCompleteSamples.find(sample => sample.id === entry.id)!;
    const { body } = render(FormFeedbackAutoCompleteCase, { props: { sample } });
    const icons = body.match(/class="[^"]*-item-feedback-icon [^"]*"/g) ?? [];
    expect(icons).toHaveLength(entry.view.icons.length);
    for (const icon of entry.view.icons) {
      expect(body).toContain(icon.className);
      for (const path of icon.paths) expect(body).toContain(`d="${path}"`);
    }
    expect(body).toContain(`data-form-status-read="control">${JSON.stringify(entry.view.status)}`);
    expect(entry.timers).toBe(0);
    expect(vi.getTimerCount()).toBe(0);
  } finally { vi.useRealTimers(); }
});
