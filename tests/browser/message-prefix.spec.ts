import { test, expect } from './test';
import reference from './fixtures/ant-design-message-prefix-reference.json' with { type: 'json' };
import { snapshotMessagePrefix } from './message-prefix-metrics';

test.use({ viewport: reference.reference.viewport });

for (const entry of reference.cases) {
  for (const scope of ['normal', 'nested', 'sibling'] as const) {
    test(`Message prefixes match Source ${entry.sample.id}/${scope}`, async ({ page }) => {
      await page.goto('/?fixture=message-prefix');
      await page.getByRole('combobox', { name: 'Message prefix sample', exact: true })
        .selectOption(entry.sample.id);
      await page.getByRole('combobox', { name: 'Message prefix scope', exact: true }).selectOption(scope);
      await page.getByLabel('Message prefix draft', { exact: true }).focus();
      await page.mouse.move(1270, 5);

      await expect.poll(() => page.evaluate(snapshotMessagePrefix)).toEqual(entry.result[scope]);
    });
  }
}

test('Message prefixes retain shown surface/notice, outside focus/selection and dismissal callbacks', async ({ page }) => {
  await page.goto('/?fixture=message-prefix');
  await page.getByRole('checkbox', { name: 'Live Message prefix', exact: true }).check();
  const editor = page.getByLabel('Message prefix draft', { exact: true });
  await editor.fill('Edited');
  await editor.evaluate((node: HTMLInputElement) => node.setSelectionRange(1, 4));
  await page.mouse.move(1270, 5);
  const notice = page.locator('.fixture-message-prefix');
  const root = page.locator('[data-ant-message-root]');
  const oldNotice = await notice.elementHandle();
  const oldRoot = await root.elementHandle();
  const oldInput = await editor.elementHandle();

  for (const step of reference.refreshedTransitions) {
    await page.getByRole('textbox', { name: 'Live Message prefix value', exact: true })
      .evaluate((node: HTMLInputElement, value) => {
        node.value = value;
        node.dispatchEvent(new Event('input', { bubbles: true }));
      }, step.prefix);

    await expect.poll(() => page.evaluate(snapshotMessagePrefix)).toEqual(step.result);
    expect(await notice.evaluate((node, old) => node === old, oldNotice)).toBe(step.sameRoot);
    expect(await root.evaluate((node, old) => node === old, oldRoot)).toBe(true);
    expect(await editor.evaluate((node, old) => node === old, oldInput)).toBe(step.sameInput);
    await expect(editor).toBeFocused();
    await expect(editor).toHaveValue(step.value);
    expect(await editor.evaluate((node: HTMLInputElement) => [node.selectionStart, node.selectionEnd]))
      .toEqual(step.selection);
    await expect(root).toHaveJSProperty('popover', 'manual');
    await expect(page.getByLabel('Message prefix events', { exact: true })).toHaveText('');
  }
  await page.getByRole('textbox', { name: 'Local Message prefix value', exact: true })
    .evaluate((node: HTMLInputElement) => {
      node.value = 'toast';
      node.dispatchEvent(new Event('input', { bubbles: true }));
    });

  await expect(root).toHaveClass(/\btoast\b/);
  await expect(notice).toHaveClass(/\btoast-notice\b/);
  await expect(editor).toBeFocused();
  await page.getByRole('button', { name: 'Dismiss prefix Message', exact: true }).click();

  await expect(notice).toHaveCount(0);
  await expect(page.getByLabel('Message prefix events', { exact: true })).toHaveText('close');
});

test('Message prefix changes preserve the original automatic close deadline and handle', async ({ page }) => {
  await page.clock.install();
  await page.goto('/?fixture=message-prefix');
  await page.getByRole('checkbox', { name: 'Live Message prefix', exact: true }).check();
  await page.getByRole('button', { name: 'Timed prefix Message', exact: true }).click();
  await page.clock.runFor(1000);
  await page.getByRole('textbox', { name: 'Live Message prefix value', exact: true }).fill('next');
  await page.clock.runFor(900);

  await expect(page.locator('.fixture-message-prefix')).toBeVisible();
  await expect(page.getByLabel('Message prefix events', { exact: true })).toHaveText('');
  await page.clock.runFor(500);

  await expect(page.locator('.fixture-message-prefix')).toHaveCount(0);
  await expect(page.getByLabel('Message prefix events', { exact: true })).toHaveText('close|done:true');
});
