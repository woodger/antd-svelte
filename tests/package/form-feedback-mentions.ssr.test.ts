import { render } from 'svelte/server';
import { expect, it, vi } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import FormFeedbackMentionsCase from '../browser/fixtures/FormFeedbackMentionsCase.svelte';
import { mentionsFeedbackSamples } from '../browser/fixtures/form-feedback-mentions-cases';
import reference from '../browser/fixtures/ant-design-form-feedback-mentions-reference.json';

it('pins independent Mentions and Transfer feedback observations to the official Source', () => {
  expect(reference.reference).toMatchObject({ version: registry.upstream.version, revision: registry.upstream.revision,
    archiveSha256: registry.upstream.archiveSha256, errors: [] });
  expect(reference.cases.map(entry => entry.id)).toEqual(mentionsFeedbackSamples.map(sample => sample.id));
  expect(reference.cases).toHaveLength(49);
  expect(reference.cases.reduce((count, entry) => count + entry.steps.length, 0)).toBe(42);
  expect(reference.ssr).toHaveLength(11);
});
it.each(reference.ssr)('renders $id feedback without a browser or timers', entry => {
  vi.useFakeTimers();
  try {
    const sample = mentionsFeedbackSamples.find(sample => sample.id === entry.id)!;
    const { body } = render(FormFeedbackMentionsCase, { props: { sample } });
    const iconClasses = body.match(/class="[^"]*-item-feedback-icon(?:[ "-])/g) ?? [];
    expect(iconClasses).toHaveLength(entry.view.icons.length);
    for (const icon of entry.view.icons) {
      expect(body).toContain(icon.classes);
      for (const path of icon.paths) expect(body).toContain(`d="${path}"`);
      expect(body.replace(/<!--[\s\S]*?-->/g, '').replace(/<[^>]*>/g, '')).toContain(icon.text!);
    }
    expect(body).toContain(`data-form-status-read="control">${JSON.stringify(entry.view.status)}`);
    expect(body).toContain('data-feedback-root-ref="false"');
    expect(entry.timers).toBe(0);
    expect(vi.getTimerCount()).toBe(0);
  } finally { vi.useRealTimers(); }
});
