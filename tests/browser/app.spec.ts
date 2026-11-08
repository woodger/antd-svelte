import { test, expect } from './test';
import reference from './fixtures/ant-design-app-reference.json' with { type: 'json' };

test.beforeEach(async ({ page }) => {
  await page.goto('/?fixture=app');
});

for (const entry of reference.cases.filter(entry => entry.sample.id !== 'global-prefix')) {
  test(`App root styles and API match source for ${entry.sample.id}`, async ({ page }) => {
    await page.getByRole('combobox', { name: 'App sample', exact: true })
      .selectOption(entry.sample.id);
    const child = page.locator('#app-child');
    const snapshot = () => child.evaluate((node, sample) => {
      const root = node.parentElement!;
      const style = getComputedStyle(root);
      const prefix = ('prefix' in sample ? sample.prefix : undefined) || 'ant-app';
      return {
        tag: root.tagName.toLowerCase(), root: root.classList.contains(prefix),
        rtl: root.classList.contains(`${prefix}-rtl`),
        contextClass: root.classList.contains('context-app'),
        localClass: root.classList.contains('local-app'),
        color: style.color, fontSize: style.fontSize, lineHeight: style.lineHeight,
        fontFamily: style.fontFamily, direction: style.direction, paddingTop: style.paddingTop,
        ...JSON.parse(node.getAttribute('data-app-api')!)
      };
    }, entry.sample);

    await expect.poll(snapshot).toEqual(entry.result);
  });
}

test('App keeps APIs and existing notices while applying updated count and placement to new calls',
  async ({ page }) => {
    const message = page.getByRole('button', { name: 'primary message', exact: true });
    const notification = page.getByRole('button', { name: 'primary notification', exact: true });
    for (let index = 0; index < 3; index++) {
      await message.click();
      await notification.click();
    }
    await expect(page.locator('.ant-message-notice')).toHaveCount(2);
    await expect(page.locator('.ant-notification-notice')).toHaveCount(2);
    await page.getByRole('spinbutton', { name: 'App maxCount', exact: true }).fill('1');
    await page.getByRole('combobox', { name: 'App notification placement', exact: true })
      .selectOption('topRight');

    await expect(page.locator('#app-identity')).toHaveText('true');
    await expect(page.locator('.ant-message-notice')).toHaveCount(2);
    await expect(page.locator('.ant-notification-bottomLeft .ant-notification-notice'))
      .toHaveCount(2);
    await message.click();
    await notification.click();
    await expect(page.locator('.ant-message-notice')).toHaveCount(1);
    await expect(page.locator('.ant-message-notice')).toContainText('Message 4');
    await expect(page.locator('.ant-notification-topRight .ant-notification-notice'))
      .toHaveCount(1);
    await expect(page.locator('.ant-notification-notice')).toContainText('Notification 4');
  });

test('App merges nested options and isolates its queues', async ({ page }) => {
  await page.getByRole('checkbox', { name: 'Nested App', exact: true }).check();
  for (const scope of ['primary', 'nested']) {
    for (let index = 0; index < 3; index++) {
      await page.getByRole('button', { name: `${scope} message`, exact: true }).click();
      await page.getByRole('button', { name: `${scope} notification`, exact: true }).click();
    }
  }

  await expect(page.locator('.ant-message-notice')).toHaveCount(4);
  await expect(page.locator('.ant-notification-notice')).toHaveCount(4);
  await expect.poll(() => page.locator('.ant-message:popover-open').evaluateAll(nodes =>
    nodes.map(node => getComputedStyle(node).getPropertyValue('--notification-top')).sort()
  )).toEqual(['40px', '64px']);
  await page.getByRole('spinbutton', { name: 'App maxCount', exact: true }).fill('1');
  for (const scope of ['primary', 'nested']) {
    await page.getByRole('button', { name: `${scope} message`, exact: true }).click();
  }
  await expect(page.locator('.ant-message-notice')).toHaveCount(2);
});

test('App updates modal context without replacing its dialog or losing focus', async ({ page }) => {
  const opener = page.getByRole('button', { name: 'primary modal', exact: true });
  await opener.click();
  const dialog = page.getByRole('dialog', { name: 'primary confirmation', exact: true });
  const original = await dialog.elementHandle();
  const focused = dialog.getByRole('button', { name: 'Подтвердить', exact: true });
  await expect(focused).toBeFocused();
  for (const name of ['English locale', 'Right to left']) {
    await page.getByRole('checkbox', { name, exact: true, includeHidden: true })
      .evaluate((node: HTMLInputElement) => {
        node.checked = true;
        node.dispatchEvent(new Event('change', { bubbles: true }));
      });
  }

  expect(await dialog.evaluate((node, old) => node === old, original)).toBe(true);
  await expect(dialog).toHaveAttribute('dir', 'rtl');
  await expect(dialog.getByRole('button', { name: 'OK', exact: true })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-app-result="primary"]')).toHaveText('false');
  await expect(opener).toBeFocused();
});

test('App switches root tags and fragment mode while keeping its APIs usable', async ({ page }) => {
  for (const value of ['section', 'fragment', 'div']) {
    await page.getByRole('combobox', { name: 'App root', exact: true })
      .selectOption({ label: value });
    await expect(page.locator('#app-native-tag')).toHaveText(value === 'fragment' ? 'none' : value);
    await expect(page.locator('#app-identity')).toHaveText('true');
    await page.getByRole('button', { name: 'primary modal', exact: true }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Подтвердить', exact: true })
      .click();

    await expect(page.locator('[data-app-result="primary"]')).toHaveText('true');
  }
});

test('App releases holders and modality when removed', async ({ page }) => {
  await page.getByRole('button', { name: 'primary message', exact: true }).click();
  await page.getByRole('button', { name: 'primary notification', exact: true }).click();
  await page.getByRole('button', { name: 'primary modal', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Control+Alt+h');

  await expect(page.locator('dialog')).toHaveCount(0);
  await expect(page.locator('.ant-message-notice')).toHaveCount(0);
  await expect(page.locator('.ant-notification-notice')).toHaveCount(0);
  await expect(page.locator('html')).not.toHaveCSS('overflow', 'hidden');
});
