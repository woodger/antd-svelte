import { test, expect } from './test';
import reference from './fixtures/ant-design-notification-prefix-reference.json' with { type: 'json' };
import { snapshotNotificationPrefix } from './notification-prefix-metrics';

test.use({ viewport: reference.reference.viewport });

for (const entry of reference.cases) {
  for (const scope of ['normal', 'nested', 'sibling'] as const) {
    test(`Notification prefixes match Source ${entry.sample.id}/${scope}`, async ({ page }) => {
      await page.goto('/?fixture=notification-prefix');
      await page.getByRole('combobox', { name: 'Notification prefix sample', exact: true })
        .selectOption(entry.sample.id);
      await page.getByRole('combobox', { name: 'Notification prefix scope', exact: true }).selectOption(scope);
      await page.getByLabel('Notification prefix draft', { exact: true }).focus();
      await page.mouse.move(1270, 5);

      await expect.poll(() => page.evaluate(snapshotNotificationPrefix)).toEqual(entry.nativeStyle[scope]);
    });
  }
}

for (const app of [false, true]) {
  test(`Notification prefixes retain shown surface/notice, focus/selection and callbacks in ${app ? 'App' : 'holder'}`, async ({ page }) => {
    await page.goto('/?fixture=notification-prefix');
    await page.getByRole('checkbox', { name: 'Live Notification prefix', exact: true }).check();
    if (app) await page.getByRole('checkbox', { name: 'App Notification prefix mode', exact: true }).check();
    const editor = page.getByLabel('Notification prefix draft', { exact: true });
    await editor.fill('Edited');
    await editor.evaluate((node: HTMLInputElement) => node.setSelectionRange(1, 4));
    await page.mouse.move(1270, 5);
    const notice = page.locator('.fixture-notification-prefix');
    const root = page.locator('.ant-notification-surface');
    const titleId = await notice.getAttribute('aria-labelledby');
    const descriptionId = await notice.getAttribute('aria-describedby');
    const oldNotice = await notice.elementHandle();
    const oldRoot = await root.elementHandle();
    const oldInput = await editor.elementHandle();

    for (const step of reference.refreshedTransitions) {
      await page.getByRole('textbox', { name: 'Live Notification prefix value', exact: true })
        .evaluate((node: HTMLInputElement, value) => {
          node.value = value;
          node.dispatchEvent(new Event('input', { bubbles: true }));
        }, step.prefix);

      await expect.poll(() => page.evaluate(snapshotNotificationPrefix)).toEqual(step.result);
      expect(await notice.evaluate((node, old) => node === old, oldNotice)).toBe(step.sameRoot);
      expect(await root.evaluate((node, old) => node === old, oldRoot)).toBe(true);
      expect(await editor.evaluate((node, old) => node === old, oldInput)).toBe(step.sameInput);
      await expect(editor).toBeFocused();
      await expect(notice).toHaveAttribute('aria-labelledby', titleId!);
      await expect(notice).toHaveAttribute('aria-describedby', descriptionId!);
      await expect(editor).toHaveValue(step.value);
      expect(await editor.evaluate((node: HTMLInputElement) => [node.selectionStart, node.selectionEnd]))
        .toEqual(step.selection);
      await expect(root).toHaveJSProperty('popover', 'manual');
      await expect(page.getByLabel('Notification prefix events', { exact: true })).toHaveText('');
    }
    await page.getByRole('textbox', { name: 'Local Notification prefix value', exact: true })
      .evaluate((node: HTMLInputElement) => {
        node.value = 'notice';
        node.dispatchEvent(new Event('input', { bubbles: true }));
      });

    await expect(root.locator('[data-ant-notification-root]')).toHaveClass(/\bnotice\b/);
    await expect(notice).toHaveClass(/\bnotice-notice\b/);
    await expect(editor).toBeFocused();
    await notice.getByRole('button', { name: 'Action', exact: true }).click();
    await expect(page.getByLabel('Notification prefix events', { exact: true })).toHaveText('action');
    await notice.getByRole('button', { name: 'Close', exact: true }).click();

    await expect(notice).toHaveCount(0);
    await expect(page.getByLabel('Notification prefix events', { exact: true })).toHaveText('action|close');
  });
}

for (const app of [false, true]) {
  test(`Notification prefix changes preserve the original automatic close deadline in ${app ? 'App' : 'holder'}`, async ({ page }) => {
    await page.clock.install();
    await page.goto('/?fixture=notification-prefix');
    await page.getByRole('checkbox', { name: 'Live Notification prefix', exact: true }).check();
    if (app) await page.getByRole('checkbox', { name: 'App Notification prefix mode', exact: true }).check();
    await page.getByRole('button', { name: 'Timed prefix Notification', exact: true }).click();
    await page.clock.runFor(1000);
    await page.getByRole('textbox', { name: 'Live Notification prefix value', exact: true }).fill('next');
    await page.clock.runFor(900);

    await expect(page.locator('.fixture-notification-prefix')).toBeVisible();
    await expect(page.getByLabel('Notification prefix events', { exact: true })).toHaveText('');
    await page.clock.runFor(500);

    await expect(page.locator('.fixture-notification-prefix')).toHaveCount(0);
    await expect(page.getByLabel('Notification prefix events', { exact: true })).toHaveText('close');
  });
}
