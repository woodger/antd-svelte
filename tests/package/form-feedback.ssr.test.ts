import { render } from 'svelte/server';
import { expect, it, vi } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import FormFeedbackCase from '../browser/fixtures/FormFeedbackCase.svelte';
import FormFeedbackNoConsumer from '../browser/fixtures/FormFeedbackNoConsumer.svelte';
import { feedbackSamples } from '../browser/fixtures/form-feedback-cases';
import reference from '../browser/fixtures/ant-design-form-feedback-reference.json';

it('pins independent Form feedback captures and retains the Source useStatus diagnostic at reset boundaries', () => {
  expect(reference.reference).toMatchObject({ version: registry.upstream.version,
    revision: registry.upstream.revision, archiveSha256: registry.upstream.archiveSha256, errors: [] });
  expect(reference.cases).toHaveLength(45);
  expect(reference.cases.reduce((sum, entry) => sum + entry.steps.length, 0)).toBe(31);
  expect(reference.ssr).toHaveLength(12);
  expect(reference.reference.warnings.map(item => item.id)).toEqual(['nested-form']);
  expect(reference.reference.serverWarnings.map(item => item.id)).toEqual(['nested-form']);
});

it('evaluates feedbackIcons for a styled item even when its child does not consume feedback', () => {
  const icons = vi.fn(() => ({}));
  const { body } = render(FormFeedbackNoConsumer, { props: { icons } });
  expect(body).toContain('Plain child');
  expect(reference.reference.noConsumer).toEqual([{ status: 'error', errors: [], warnings: [] }]);
  expect(icons).toHaveBeenCalledWith(reference.reference.noConsumer[0]);
});

it.each(reference.ssr)('renders $id feedback and status without browser globals or timers', entry => {
  vi.useFakeTimers();
  try {
    const sample = feedbackSamples.find(sample => sample.id === entry.id)!;
    const { body } = render(FormFeedbackCase, { props: { sample } });
    const root = /<div(?=[^>]*data-ant-tree-choice-control)[^>]*>/.exec(body)![0];
    const prefix = sample.treePrefix ?? `${sample.rootPrefix ?? 'ant'}-select`;
    for (const flag of entry.view.root) expect(root).toContain(`${prefix}-${flag}`);
    expect(root.includes(`${prefix}-has-feedback`)).toBe(entry.view.root.includes('has-feedback'));
    const icon = entry.view.icon;
    if (icon) {
      expect(body).toContain(icon.className);
      for (const path of icon.path ?? []) expect(body).toContain(`d="${path}"`);
      if (icon.custom) {
        expect(body).toContain('data-feedback-info=');
        const text = body.replace(/<!--[\s\S]*?-->/g, '').replace(/<[^>]*>/g, '');
        expect(text).toContain(icon.text!);
      }
    } else expect(body).not.toMatch(/class="[^"]*-item-feedback-icon(?:[ "-])/);
    expect(body).toContain(`data-form-status-read="control">${JSON.stringify(entry.view.status)}`);
    expect(body).toContain('data-feedback-ref="false"');
    expect(body).not.toContain('popover="manual"');
    expect(entry.timers).toBe(0);
    expect(vi.getTimerCount()).toBe(0);
  } finally { vi.useRealTimers(); }
});
