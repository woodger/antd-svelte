import type { Page } from '@playwright/test';
import { test, expect } from './test';
import reference from './fixtures/ant-design-tree-select-trigger-reference.json' with { type: 'json' };
import type { TreeSelectTriggerAction } from './fixtures/tree-select-trigger-cases';
import { readTreeSelectTrigger } from './tree-select-trigger-metrics';

const input = (page: Page) => page.getByRole('combobox', { name: 'Trigger selection', exact: true });
async function mount(page: Page, id: string) {
  await page.goto('/?fixture=tree-select-trigger');
  await page.getByRole('combobox', { name: 'TreeSelect trigger sample', exact: true }).selectOption(id);
  await expect(page.locator('[data-trigger-ref]')).toHaveAttribute('data-trigger-ref', 'true');
  await page.mouse.move(0, 0);
}
async function apply(page: Page, action: TreeSelectTriggerAction, index = 0) {
  if (action === 'focus') await input(page).focus();
  else if (action === 'focus-clear') await page.locator('[data-trigger-control] button').focus();
  else if (action === 'outside') await page.getByRole('button', { name: 'Outside trigger', exact: true }).click();
  else if (action === 'click-input') await input(page).click();
  else if (action === 'click-root') await page.locator('[data-trigger-control] .ant-select').click({ position: { x: 1, y: 1 } });
  else if (action === 'mouse-enter') await page.locator('[data-trigger-control] .ant-select').hover();
  else if (action === 'mouse-leave') await page.mouse.move(0, 0);
  else if (action.startsWith('down:')) await page.keyboard.down(action.slice(5));
  else if (action.startsWith('up:')) await page.keyboard.up(action.slice(3));
  else {
    await page.getByRole('combobox', { name: 'Trigger action', exact: true }).selectOption(String(index));
    await page.getByRole('button', { name: 'Apply trigger action', exact: true }).dispatchEvent('click');
  }
}

for (const entry of reference.cases) {
  test(`TreeSelect trigger follows Source for ${entry.id}`, async ({ page }) => {
    await mount(page, entry.id);
    const read = () => page.evaluate(readTreeSelectTrigger);
    await expect.poll(read).toEqual(entry.initial);
    for (const [index, step] of entry.steps.entries()) {
      await apply(page, step.action as TreeSelectTriggerAction, index);
      await expect.poll(read, { message: step.action }).toEqual(step.view);
    }
  });
}

test('TreeSelect opens once for Space while retaining the raw duplicate Source callback observation', async ({ page }) => {
  const source = reference.observations.find(entry => entry.id === 'readonly-space')!;
  expect(source.steps[1].view.events.filter((event: unknown[]) => event[0] === 'open')).toEqual([['open', true], ['open', true]]);
  await mount(page, source.id);
  await input(page).focus();
  await page.keyboard.down(' ');
  await expect(input(page)).toHaveAttribute('aria-expanded', 'true');
  await expect(input(page)).toBeFocused();
  const view = await page.evaluate(readTreeSelectTrigger);
  expect(view.events).toEqual([['focus', 'DIV'], ['input-key', ' ', 'INPUT', false],
    ['open', true], ['root-key', ' ', 'DIV', true]]);
  await page.keyboard.up(' ');
});

test('TreeSelect preserves native key cancellation and input event targets', async ({ page }) => {
  await mount(page, 'native-key-cancel');
  await input(page).focus();
  await input(page).press('ArrowDown');
  await expect(input(page)).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('[data-trigger-events]')).toHaveText(JSON.stringify([
    ['focus', 'DIV'], ['input-key', 'ArrowDown', 'INPUT', true],
    ['root-key', 'ArrowDown', 'DIV', true], ['root-key-up', 'ArrowDown', 'DIV', false]
  ]));
  await expect(page.locator('[data-trigger-native-events]')).toHaveText(JSON.stringify([
    'focus:INPUT', 'down:ArrowDown:INPUT', 'up:ArrowDown:INPUT'
  ]));
});

test('TreeSelect gives native attributes priority over the input aliases', async ({ page }) => {
  await mount(page, 'native-attributes');
  await expect(input(page)).not.toBeFocused();
  await expect(input(page)).toHaveAttribute('tabindex', '7');
  await expect(input(page)).toHaveAttribute('maxlength', '2');
  await input(page).focus();
  await input(page).pressSequentially('Alpha');
  await expect(input(page)).toHaveValue('Al');
});

test('TreeSelect keeps the field and focus while showAction and autofocus props rerender', async ({ page }) => {
  await mount(page, 'autofocus');
  const element = await input(page).elementHandle();
  await expect(input(page)).toBeFocused();
  await apply(page, 'update');
  expect(await input(page).evaluate((current, previous) => current === previous, element)).toBe(true);
  await expect(input(page)).toBeFocused();
  expect((await page.evaluate(readTreeSelectTrigger)).events).toEqual([['focus', 'DIV']]);
  await page.getByRole('button', { name: 'Blur trigger ref', exact: true }).dispatchEvent('click');
  await expect(input(page)).not.toBeFocused();
  await page.getByRole('button', { name: 'Focus trigger ref', exact: true }).dispatchEvent('click');
  await expect(input(page)).toBeFocused();
});

test('TreeSelect cancels a deferred keyboard close and clears both DOM refs on unmount', async ({ page }) => {
  await mount(page, 'default');
  await input(page).focus();
  await input(page).press('ArrowDown');
  await input(page).evaluate(node => {
    node.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
    document.querySelector<HTMLButtonElement>('[data-trigger-unmount]')!.click();
  });
  await expect(page.locator('[data-trigger-ref]')).toHaveAttribute('data-trigger-ref', 'false');
  await expect(page.locator('[popover]')).toHaveCount(0);
  const events = (await page.locator('[data-trigger-events]').textContent())!;
  expect(JSON.parse(events).filter((event: unknown[]) => event[0] === 'open')).toEqual([['open', true]]);
  await expect(page.locator('[data-trigger-events]')).toHaveText(events);
});

test('TreeSelect publishes one original root key event when its popup is mounted inside the control', async ({ page }) => {
  await mount(page, 'native-inline-portal');
  await expect(page.locator('[data-trigger-control] .ant-select [popover]:popover-open')).toHaveCount(1);
  await input(page).focus();
  await input(page).press('ArrowDown');
  expect((await page.evaluate(readTreeSelectTrigger)).events).toEqual([
    ['focus', 'DIV'], ['input-key', 'ArrowDown', 'INPUT', true],
    ['root-key', 'ArrowDown', 'DIV', true], ['root-key-up', 'ArrowDown', 'DIV', false]
  ]);
  await expect(input(page)).toBeFocused();
});
