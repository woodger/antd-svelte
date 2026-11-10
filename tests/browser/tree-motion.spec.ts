import { test, expect } from './test';
import reference from './fixtures/ant-design-tree-motion-reference.json' with { type: 'json' };
import { treeMotionSamples, type TreeMotionAction } from './fixtures/tree-motion-cases';
import { readTreeMotion } from './tree-motion-metrics';

for (const sample of reference.cases) test(`Tree motion matches Source for ${sample.id}`, async ({ page }) => {
  await page.clock.install({ time: new Date('2026-11-10T12:00:00Z') });
  await page.clock.pauseAt(new Date('2026-11-10T12:00:01Z'));
  await page.goto('/?fixture=tree-motion');
  await page.getByLabel('Tree motion case').selectOption(sample.id);
  await page.clock.runFor(32);
  const config = treeMotionSamples.find(s => s.id === sample.id)!;
  const prefix = config.localPrefix ?? `${config.prefix ?? 'ant'}-tree`;
  const read = async () => ({ view: await page.evaluate(readTreeMotion, prefix),
    events: JSON.parse(await page.locator('[data-tree-motion-events]').innerText()) });
  expect(await read()).toEqual(sample.initial);
  for (const step of sample.steps) {
    const action = step.action as TreeMotionAction;
    if (action.kind === 'toggle') {
      await page.locator(`[data-tree-motion-key="${action.key}"]`)
        .locator('xpath=ancestor::*[@role="treeitem"][1]')
        .locator('[data-ant-tree-switcher]').dispatchEvent('click');
    } else if (action.kind === 'frame') {
      await page.clock.runFor(action.milliseconds ?? 80);
      await page.evaluate(() => document.getAnimations().forEach(animation => animation.pause()));
    } else if (action.kind === 'end') {
      await page.evaluate(({ prefix, property }) => document.querySelector(`.${prefix}-treenode-motion`)
        ?.dispatchEvent(new TransitionEvent('transitionend', { bubbles: true, propertyName: property })),
      { prefix, property: action.property });
      await page.clock.runFor(1);
    } else if (action.kind === 'keys') {
      await page.getByRole('button', { name: 'Expand both', exact: true }).dispatchEvent('click');
    } else await page.getByRole('button', { name: 'Resolve prepare', exact: true }).dispatchEvent('click');
    expect(await read(), JSON.stringify(action)).toEqual({ view: step.view, events: step.events });
  }
});
