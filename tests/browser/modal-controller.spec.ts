import { test, expect } from './test';
import reference from './fixtures/ant-design-modal-controller-reference.json' with { type: 'json' };

test.beforeEach(async ({ page }) => {
  await page.goto('/?fixture=modal-controller');
  await page.getByRole('checkbox', { name: 'English locale', exact: true }).check();
});

for (const entry of reference.cases) {
  test(`Modal controller preserves source confirmation ${entry.sample.id}`, async ({ page }) => {
    await page.getByRole('combobox', { name: 'Confirmation sample', exact: true })
      .selectOption(entry.sample.id);
    await page.getByRole('button', { name: 'Open confirmation', exact: true }).click();
    const dialog = page.getByRole('dialog', { name: entry.before.title, exact: true });
    await expect(dialog).toBeVisible();
    const snapshot = () => dialog.evaluate(node => ({
      title: node.querySelector('.ant-modal-confirm-title')?.textContent,
      content: node.querySelector('.ant-modal-confirm-content')?.textContent,
      buttons: [...node.querySelectorAll('.ant-modal-confirm-btns button')]
        .map(button => button.textContent?.trim()),
      width: getComputedStyle(node).width,
      closable: Boolean(node.querySelector('.ant-modal-close'))
    }));
    await expect.poll(snapshot).toEqual(entry.before);
    await expect(dialog.getByRole('button', { name: 'OK', exact: true })).toBeFocused();

    if ('action' in entry.sample) {
      if (entry.sample.action === 'destroy') await page.keyboard.press('Control+Alt+d');
      else await dialog.getByRole('button', {
        name: entry.sample.action === 'ok' ? 'OK' : 'Cancel', exact: true
      }).click();
    }
    if (entry.pending) {
      await expect(dialog).toBeVisible();
      await expect(page.locator('#modal-controller-result')).toHaveText('pending');
      await expect(dialog.locator('.ant-btn-loading')).toHaveCount(entry.pending.loading ? 1 : 0);
      const key = 'manual' in entry.sample ? 'm' : 'reject' in entry.sample ? 'j' : 'r';
      await page.keyboard.press(`Control+Alt+${key}`);
    }
    const settled = entry.sample.id === 'destroy' ? false : entry.after.settled;
    await expect(page.locator('dialog[open]')).toHaveCount(entry.after.dialogs);
    await expect(page.locator('#modal-controller-result'))
      .toHaveText(settled === null ? 'pending' : String(settled));
    await expect(page.locator('.ant-btn-loading')).toHaveCount(entry.after.loading ? 1 : 0);
    if (entry.after.dialogs === 0) {
      await expect(page.getByRole('button', { name: 'Open confirmation', exact: true })).toBeFocused();
      const expectedEvents = [...entry.after.events];
      if (entry.sample.id === 'destroy') expectedEvents.push('result:false');
      await expect.poll(async () => (await page.locator('#modal-controller-events').textContent())
        ?.split('|').sort()).toEqual(expectedEvents.sort());
    }
  });
}

test('Modal controller retries rejected async actions and keeps Escape cancellation available',
  async ({ page }) => {
    await page.getByRole('combobox', { name: 'Confirmation sample', exact: true })
      .selectOption('async-reject');
    await page.getByRole('button', { name: 'Open confirmation', exact: true }).click();
    const dialog = page.getByRole('dialog', { name: 'Confirm title', exact: true });
    await dialog.getByRole('button', { name: 'OK', exact: true }).click();
    await page.keyboard.press('Control+Alt+j');
    await expect(dialog.locator('.ant-btn-loading')).toHaveCount(0);
    await dialog.getByRole('button', { name: 'OK', exact: true }).click();
    await expect(dialog.locator('.ant-btn-loading')).toHaveCount(1);
    await page.keyboard.press('Escape');
    await expect(page.locator('dialog[open]')).toHaveCount(0);
    await expect(page.locator('#modal-controller-result')).toHaveText('false');
    await page.keyboard.press('Control+Alt+r');
    await expect(page.locator('dialog[open]')).toHaveCount(0);
    await expect(page.locator('#modal-controller-events')).toContainText('cancel');
  });

test('Modal controller preserves its native dialog and draft through title theme locale and RTL updates',
  async ({ page }) => {
    await page.getByRole('combobox', { name: 'Confirmation sample', exact: true })
      .selectOption('context');
    await page.getByRole('button', { name: 'Open confirmation', exact: true }).click();
    const dialog = page.getByRole('dialog');
    const input = dialog.getByRole('textbox', { name: 'Confirmation draft', exact: true });
    await input.fill('kept draft');
    await input.evaluate((node: HTMLInputElement) => { node.setSelectionRange(1, 5); });
    const original = await input.elementHandle();
    await page.keyboard.press('Control+Alt+u');
    await page.keyboard.press('Control+Alt+t');
    for (const name of ['English locale', 'Right to left']) {
      await page.getByRole('checkbox', { name, exact: true, includeHidden: true })
        .evaluate((node: HTMLInputElement) => {
          node.checked = !node.checked;
          node.dispatchEvent(new Event('change', { bubbles: true }));
        });
    }

    await expect(dialog).toHaveAttribute('aria-labelledby', /ant-modal-confirm-title/);
    await expect(dialog).toHaveAttribute('dir', 'rtl');
    await expect(dialog.locator('.ant-modal-container')).toHaveCSS('background-color', 'rgb(18, 52, 86)');
    await expect(dialog.getByRole('button', { name: 'Подтвердить', exact: true })).toBeVisible();
    expect(await input.evaluate((node, old) => node === old, original)).toBe(true);
    await expect(input).toHaveValue('kept draft');
    await expect(input).toBeFocused();
    expect(await input.evaluate((node: HTMLInputElement) => [
      node.selectionStart, node.selectionEnd
    ])).toEqual([1, 5]);
    await expect.poll(() => dialog.evaluate(node => node.matches(':modal'))).toBe(true);
  });

test('Modal controller settles holder removal during async work and ignores late completion',
  async ({ page }) => {
    await page.getByRole('combobox', { name: 'Confirmation sample', exact: true })
      .selectOption('async-ok');
    const opener = page.getByRole('button', { name: 'Open confirmation', exact: true });
    await opener.click();
    await page.getByRole('dialog').getByRole('button', { name: 'OK', exact: true }).click();
    await page.keyboard.press('Control+Alt+h');
    await expect(page.locator('dialog')).toHaveCount(0);
    await expect(page.locator('#modal-controller-result')).toHaveText('false');
    await page.keyboard.press('Control+Alt+r');
    await expect(page.locator('#modal-controller-events')).toHaveText('ok|result:false');
    await expect(opener).toBeFocused();
  });

test('Modal controller restores the underlying confirmation after closing a nested dialog',
  async ({ page }) => {
    await page.getByRole('button', { name: 'Open confirmation', exact: true }).click();
    const first = page.getByRole('dialog', { name: 'Confirm title', exact: true });
    await expect(first.getByRole('button', { name: 'OK', exact: true })).toBeFocused();
    await page.keyboard.press('Control+Alt+n');
    const nested = page.getByRole('dialog', { name: 'Nested confirmation', exact: true });
    await expect(nested).toBeVisible();
    await nested.getByRole('button', { name: 'OK', exact: true }).click();

    await expect(first).toBeVisible();
    await expect(first.getByRole('button', { name: 'OK', exact: true })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(page.locator('dialog')).toHaveCount(0);
  });

test('Modal controller isolates sibling holder themes and preserves the underlying dialog',
  async ({ page }) => {
    await page.getByRole('button', { name: 'Open confirmation', exact: true }).click();
    const first = page.getByRole('dialog', { name: 'Confirm title', exact: true });
    const original = await first.elementHandle();
    await page.keyboard.press('Control+Alt+t');
    await expect(first.locator('.ant-modal-container'))
      .toHaveCSS('background-color', 'rgb(18, 52, 86)');
    await page.keyboard.press('Control+Alt+b');
    const sibling = page.getByRole('dialog', { name: 'Sibling confirmation', exact: true });
    await expect(sibling.locator('.ant-modal-container'))
      .toHaveCSS('background-color', 'rgb(171, 205, 239)');
    await sibling.getByRole('button', { name: 'OK', exact: true }).click();

    expect(await first.evaluate((node, old) => node === old, original)).toBe(true);
    await expect(first.locator('.ant-modal-container'))
      .toHaveCSS('background-color', 'rgb(18, 52, 86)');
    await expect(first.getByRole('button', { name: 'OK', exact: true })).toBeFocused();
    await page.keyboard.press('Escape');
  });

test('Modal controller replaces its instance without reusing stale dialog handlers', async ({ page }) => {
  const opener = page.getByRole('button', { name: 'Open confirmation', exact: true });
  await opener.click();
  await page.keyboard.press('Control+Alt+s');
  await expect(page.locator('dialog')).toHaveCount(0);
  await expect(page.locator('#modal-controller-result')).toHaveText('false');
  await expect(opener).toBeFocused();
  await opener.click();
  await page.getByRole('dialog').getByRole('button', { name: 'OK', exact: true }).click();

  await expect(page.locator('#modal-controller-result')).toHaveText('true');
  await expect(page.locator('#modal-controller-events')).toContainText('ok');
});
