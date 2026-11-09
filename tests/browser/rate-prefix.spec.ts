import type { Page } from '@playwright/test';
import { test, expect } from './test';
import reference from './fixtures/ant-design-rate-prefix-reference.json' with { type: 'json' };
import { snapshotRatePrefix } from './rate-prefix-metrics';

test.use({ viewport: reference.reference.viewport });

for (const entry of reference.cases) {
  test(`Rate prefixes match source styles and state for ${entry.sample.id}`, async ({ page }) => {
    await page.goto('/?fixture=rate-prefix');
    await page.getByRole('combobox', { name: 'Rate prefix sample', exact: true })
      .selectOption(entry.sample.id);

    await expect.poll(() => page.evaluate(snapshotRatePrefix)).toEqual(entry.result);
  });
}

async function setPrefix(page: Page, value: string, local = false) {
  await page.getByRole('textbox', {
    name: local ? 'Local Rate prefix value' : 'Live Rate prefix value', exact: true
  }).evaluate((node: HTMLInputElement, value) => {
    node.value = value;
    node.dispatchEvent(new Event('input', { bubbles: true }));
  }, value);
}

test('Rate prefix updates retain nodes, value, character, focus and keyboard selection', async ({
  page
}) => {
  await page.goto('/?fixture=rate-prefix');
  await page.getByRole('checkbox', { name: 'Live Rate prefix', exact: true }).check();
  const scope = page.locator('[data-rate-prefix-scope="normal"]');
  const root = scope.getByRole('radiogroup', { name: 'normal rating', exact: true });
  const oldRate = await root.elementHandle();
  const first = root.getByRole('radio', { name: '1', exact: true });
  const oldStar = await first.elementHandle();
  await root.focus();
  await page.keyboard.press('ArrowRight');
  const editor = scope.getByRole('textbox', { name: 'normal rate draft', exact: true });
  const oldEditor = await editor.elementHandle();
  await editor.fill('kept draft');
  await editor.evaluate((node: HTMLInputElement) => { node.setSelectionRange(1, 5); });

  for (const step of reference.transitions) {
    await setPrefix(page, step.prefix);

    await expect.poll(() => page.evaluate(snapshotRatePrefix)).toEqual(step.result);
    expect(await root.evaluate((node, old) => node === old, oldRate)).toBe(step.sameRate);
    expect(await first.evaluate((node, old) => node === old, oldStar)).toBe(step.sameStar);
    expect(await editor.evaluate((node, old) => node === old, oldEditor)).toBe(step.sameEditor);
    await expect(editor).toHaveValue(step.value);
    expect(await editor.evaluate(node => node === document.activeElement)).toBe(step.focused);
    expect(await editor.evaluate((node: HTMLInputElement) => [
      node.selectionStart, node.selectionEnd
    ])).toEqual(step.selection);
    expect(await scope.evaluate(node => new FormData(node as HTMLFormElement).get('draft')))
      .toBe(step.formValue);
    await expect(scope.getByLabel('normal rate events')).toHaveText('3');
    await expect(scope.getByLabel('normal rate ref')).toHaveText('mounted');
  }
  await setPrefix(page, 'review', true);

  await expect(root).toHaveClass(/review/);
  await expect(editor).toBeFocused();
  await root.focus();
  await page.keyboard.press('ArrowRight');

  await expect(root.locator('.review-star-half')).toHaveCount(1);
  await expect(scope.getByLabel('normal rate events')).toHaveText('3|3.5');
  await expect(root).toHaveCSS('outline-style', 'dashed');

  const star = root.getByRole('radio', { name: '5', exact: true });
  const box = (await star.locator('..').boundingBox())!;
  await page.mouse.click(box.x + box.width / 4, box.y + box.height / 2);
  await page.mouse.click(box.x + box.width / 4, box.y + box.height / 2);

  await expect(scope.getByLabel('normal rate events')).toHaveText('3|3.5|4.5|0');
  await expect(root.locator('.review-star-full')).toHaveCount(0);
});

test('Rate local prefix keeps Tooltip composition and character contexts independent', async ({
  page
}) => {
  await page.goto('/?fixture=rate-prefix');
  const select = page.getByRole('combobox', { name: 'Rate prefix sample', exact: true });
  await select.selectOption('tooltips');
  const root = page.locator('[data-rate-prefix-scope="normal"] .fixture-rate-prefix');
  await root.getByRole('radio', { name: '4', exact: true }).hover();

  await expect(page.getByRole('tooltip')).toHaveText('Four');

  await select.selectOption('character');

  await expect(root.locator('[data-character-prefix="review-star"]')).toHaveCount(10);
  await expect(root.locator('.review-star-half')).toHaveCount(1);
});
