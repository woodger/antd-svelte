import type { Page } from '@playwright/test';
import { test, expect } from './test';
import reference from './fixtures/ant-design-tree-select-root-reference.json' with { type: 'json' };
import type { TreeSelectRootAction } from './fixtures/tree-select-root-cases';
import { readTreeSelectRoot } from './tree-select-root-metrics';

function nativeRootView<View extends { events: readonly unknown[][] }>(id: string, action: string, view: View) {
  if (id !== 'composite-unmount' || action !== 'unmount') return view;
  // React снимает synthetic callbacks до удаления DOM. Chromium доставляет
  // Native focusout ещё подключённому input, до cleanup регистрации.
  // Эта граница Svelte DOM отражена отдельно; raw Source остаётся неизменным.
  return { ...view, events: [...view.events,
    ['generated:blur', 'INPUT', false, 'INPUT', null],
    ['own:blur', 'INPUT', false, 'INPUT', null]
  ] };
}

async function apply(page: Page, action: TreeSelectRootAction) {
  const field = page.locator('[data-tree-select-root-host] [data-root-probe]');
  const child = page.locator('[data-root-child]');
  if (action === 'click') await field.click();
  else if (action === 'click-only') await field.evaluate(node => (node as HTMLElement).click());
  else if (action === 'outside') await page.getByRole('button', { name: 'Outside root', exact: true }).click();
  else if (action === 'focus' || action === 'child-focus') await (action === 'focus' ? field : child).focus();
  else if (action === 'blur') await field.evaluate(node => (node as HTMLElement).blur());
  else if (action === 'ref-focus' || action === 'ref-blur') await page.getByRole('button', {
    name: action === 'ref-focus' ? 'Root ref focus' : 'Root ref blur', exact: true
  }).dispatchEvent('click');
  else if (action === 'unmount') await page.getByRole('button', { name: 'Unmount root', exact: true }).dispatchEvent('click');
  else if (action === 'type' || action === 'child-type') await (action === 'type' ? field : child).fill('Draft query');
  else {
    const key = action === 'enter' || action === 'child-enter' ? 'Enter' : action === 'space' ? 'Space' : 'ArrowDown';
    await (action === 'child-enter' ? child : field).focus();
    await page.keyboard.down(key);
    // Как в независимом Source trace: отложенное закрытие завершается до keyup.
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    await page.keyboard.up(key);
  }
}

for (const entry of reference.cases) {
  test(`TreeSelect components.root follows Source for ${entry.id}`, async ({ page }) => {
    await page.goto('/?fixture=tree-select-root');
    await page.getByRole('combobox', { name: 'TreeSelect root sample', exact: true }).selectOption(entry.id);
    await expect(page.locator('[data-tree-select-root-host]')).toHaveAttribute('data-root-ready', 'true');
    await page.mouse.move(0, 0);
    const read = () => page.evaluate(readTreeSelectRoot);
    await expect.poll(read).toEqual(entry.initial);
    const field = page.locator('[data-tree-select-root-host] [data-root-probe]');
    const original = await field.elementHandle();
    for (const step of entry.steps) {
      const unmountBoundary = entry.id === 'composite-unmount' && step.action === 'unmount';
      if (unmountBoundary) expect(step.view.events.filter(event =>
        event[0] === 'generated:blur' || event[0] === 'own:blur')).toEqual([]);
      await apply(page, step.action as TreeSelectRootAction);
      const expected = nativeRootView(entry.id, step.action, step.view);
      await expect.poll(read, { message: step.action }).toEqual(expected);
      if (step.sameField) expect(await field.evaluate((node, previous) => node === previous, original)).toBe(true);
      await expect(page.locator('[data-root-native-editor]')).toHaveText('');
      if (unmountBoundary) {
        await page.evaluate(() => new Promise<void>(resolve =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
        expect(await read()).toEqual(expected);
        await expect(page.locator('[popover]')).toHaveCount(0);
      }
    }
  });
}

test('TreeSelect root keeps custom DOM during updates and restores default bindings and FormData', async ({ page }) => {
  await page.goto('/?fixture=tree-select-root-lifecycle');
  const refs = page.locator('[data-root-life-refs]');
  const button = page.getByRole('button', { name: 'Lifecycle root', exact: true });
  await expect(refs).toHaveText('{"native":"BUTTON","input":null}');
  const original = await button.elementHandle();
  await page.getByRole('button', { name: 'Focus live root', exact: true }).dispatchEvent('click');
  await expect(button).toBeFocused();
  await page.getByRole('button', { name: 'Update live root', exact: true }).dispatchEvent('click');
  await expect(button).toHaveAttribute('data-live', '1');
  await expect(button).toHaveAttribute('title', 'Updated root title');
  await expect(button).toBeFocused();
  expect(await button.evaluate((node, previous) => node === previous, original)).toBe(true);
  const values = () => page.locator('[data-root-life-form]')
    .evaluate((form: HTMLFormElement) => new FormData(form).getAll('root-choice'));
  expect(await values()).toEqual(['a']);
  await button.click();
  await page.locator('[popover]:popover-open .ant-tree-title').filter({ hasText: /^Beta$/ }).click();
  expect(await values()).toEqual(['b']);
  await page.getByRole('button', { name: 'Use default root', exact: true }).dispatchEvent('click');
  await expect(refs).toHaveText('{"native":"DIV","input":"INPUT"}');
  const input = page.getByRole('combobox', { name: 'Lifecycle root', exact: true });
  await expect(input).toHaveValue('Beta');
  await page.getByRole('button', { name: 'Focus live root', exact: true }).dispatchEvent('click');
  await expect(input).toBeFocused();
  await page.getByRole('button', { name: 'Use custom root', exact: true }).dispatchEvent('click');
  await expect(refs).toHaveText('{"native":"BUTTON","input":null}');
  expect(await values()).toEqual(['b']);
  await page.getByRole('button', { name: 'Focus live root', exact: true }).dispatchEvent('click');
  await expect(button).toBeFocused();
  await page.getByRole('button', { name: 'Unmount live root', exact: true }).dispatchEvent('click');
  await expect(refs).toHaveText('{"native":null,"input":null}');
  await expect(page.locator('[popover]')).toHaveCount(0);
});
