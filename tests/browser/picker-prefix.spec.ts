import { test, expect } from './test';
import reference from './fixtures/ant-design-picker-prefix-reference.json' with { type: 'json' };
import { snapshotPickerPrefix } from './picker-prefix-metrics';

test.use({ viewport: reference.reference.viewport });
test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date('2024-09-15T03:00:00.000Z'));
});

for (const entry of reference.cases) {
  for (const scope of ['normal', 'nested', 'sibling'] as const) {
    test(`Picker prefixes match Source ${entry.sample.id}/${scope}`, async ({ page }) => {
      await page.goto('/?fixture=picker-prefix');
      await page.getByRole('combobox', { name: 'Picker prefix sample', exact: true })
        .selectOption(entry.sample.id);
      await page.getByRole('combobox', { name: 'Picker prefix scope', exact: true })
        .selectOption(scope);
      await page.mouse.move(10, 890);

      await expect.poll(() => page.evaluate(snapshotPickerPrefix)).toEqual(entry.result[scope]);
    });
  }
}

for (const kind of ['date', 'range', 'time', 'time-range']) {
  test(`Picker prefixes retain open ${kind} draft, caret, focus, refs and IDs`, async ({ page }) => {
    await page.goto('/?fixture=picker-prefix');
    await page.getByRole('checkbox', { name: 'Live picker prefix', exact: true }).check();
    await page.getByRole('combobox', { name: 'Live picker kind', exact: true }).selectOption(kind);
    const root = page.locator('.fixture-picker-prefix');
    const input = root.locator('input').first();
    const popup = page.locator('.fixture-picker-prefix-popup');
    const oldRoot = await root.elementHandle();
    const oldInput = await input.elementHandle();
    const oldPopup = await popup.elementHandle();
    const id = await input.getAttribute('id');
    const controls = await input.getAttribute('aria-controls');
    await input.fill('draft');
    await input.evaluate((node: HTMLInputElement) => node.setSelectionRange(1, 4, 'backward'));

    for (const step of reference.transitions.filter(step => step.kind === kind)) {
      await page.getByRole('textbox', { name: 'Live picker prefix value', exact: true })
        .evaluate((node: HTMLInputElement, value) => {
          node.value = value;
          node.dispatchEvent(new Event('input', { bubbles: true }));
        }, step.prefix);

      await expect.poll(() => page.evaluate(snapshotPickerPrefix)).toEqual(step.result);
      expect(await root.evaluate((node, old) => node === old, oldRoot)).toBe(true);
      expect(await popup.evaluate((node, old) => node === old, oldPopup)).toBe(true);
      expect(await input.evaluate((node, old) => node === old, oldInput)).toBe(true);
      await expect(input).toBeFocused();
      await expect(input).toHaveValue(step.value);
      if (id) await expect(input).toHaveAttribute('id', id);
      if (controls) await expect(input).toHaveAttribute('aria-controls', controls);
      expect(await input.evaluate((node: HTMLInputElement) =>
        [node.selectionStart, node.selectionEnd, node.selectionDirection])).toEqual(step.selection);
      await expect(page.getByLabel('Picker prefix ref', { exact: true })).toHaveText('true');
      if (kind.includes('range')) {
        await expect(page.getByLabel('Picker prefix range refs', { exact: true })).toHaveText('true');
      }
      await expect(page.getByLabel('Picker prefix events', { exact: true })).toHaveText('');
    }
  });

  test(`Picker ${kind} local prefixes preserve default styling and native popup cleanup`,
    async ({ page }) => {
      await page.goto('/?fixture=picker-prefix');
      await page.getByRole('checkbox', { name: 'Live picker prefix', exact: true }).check();
      await page.getByRole('combobox', { name: 'Live picker kind', exact: true }).selectOption(kind);
      await page.getByRole('checkbox', { name: 'Source prefix picker theme', exact: true })
        .dispatchEvent('click');
      await page.getByRole('checkbox', { name: 'Portal prefix picker', exact: true })
        .dispatchEvent('click');
      const popup = page.locator('#picker-prefix-portal .fixture-picker-prefix-popup');
      const root = page.locator('.fixture-picker-prefix');
      const input = root.locator('input').first();
      await input.fill('draft');
      const oldPopup = await popup.elementHandle();
      const oldInput = await input.elementHandle();
      await page.mouse.move(10, 890);
      await page.evaluate(() => Promise.all(document.getAnimations()
        .filter(animation => animation.effect?.getComputedTiming().iterations !== Infinity)
        .map(animation => animation.finished.catch(() => {}))));
      const before = await page.evaluate(snapshotPickerPrefix);

      await page.getByRole('textbox', { name: 'Local picker prefix value', exact: true })
        .evaluate((node: HTMLInputElement) => {
          node.value = 'choices';
          node.dispatchEvent(new Event('input', { bubbles: true }));
        });

      await expect.poll(() => page.evaluate(snapshotPickerPrefix)).toEqual(before);
      await expect(root).toHaveClass(/\bchoices\b/);
      expect(await popup.evaluate((node, old) => node === old, oldPopup)).toBe(true);
      expect(await input.evaluate((node, old) => node === old, oldInput)).toBe(true);
      await expect(input).toBeFocused();
      await expect(input).toHaveValue('draft');
      await expect(page.getByLabel('Picker prefix events', { exact: true })).toHaveText('');
      await page.getByRole('checkbox', { name: 'Mount prefix picker', exact: true })
        .dispatchEvent('click');

      await expect(popup).toHaveCount(0);
      expect(await oldPopup!.evaluate(node => node.isConnected)).toBe(false);
    });
}

for (const sample of ['datetime', 'datetime-range']) {
  test(`Picker ${sample} prefix updates retain pending time, focused cell and confirmation`,
    async ({ page }) => {
      await page.goto('/?fixture=picker-prefix');
      await page.getByRole('checkbox', { name: 'Live picker prefix', exact: true }).check();
      await page.getByRole('combobox', { name: 'Live picker kind', exact: true })
        .selectOption(sample);
      const popup = page.locator('.fixture-picker-prefix-popup');
      const minute = popup.getByRole('button', { name: 'minute 35', exact: true });
      await minute.click();
      const oldMinute = await minute.elementHandle();
      const oldPopup = await popup.elementHandle();
      await minute.focus();

      await page.getByRole('textbox', { name: 'Local picker prefix value', exact: true })
        .evaluate((node: HTMLInputElement) => {
          node.value = 'choices';
          node.dispatchEvent(new Event('input', { bubbles: true }));
        });
      await expect(popup).toHaveClass(/\bchoices-dropdown\b/);
      expect(await popup.evaluate((node, old) => node === old, oldPopup)).toBe(true);
      expect(await minute.evaluate((node, old) => node === old, oldMinute)).toBe(true);
      await expect(minute).toBeFocused();
      await expect(minute).toHaveAttribute('aria-pressed', 'true');
      await expect(page.getByLabel('Picker prefix events', { exact: true })).toHaveText('');
      await popup.getByRole('button', { name: 'OK', exact: true }).click();
      if (sample === 'datetime-range') {
        await expect(page.getByLabel('Picker prefix events', { exact: true })).toHaveText('');
        await popup.getByRole('button', { name: 'OK', exact: true }).click();
      }

      await expect(page.getByLabel('Picker prefix events', { exact: true }))
        .toContainText('2024-09-15T12:35:56.700Z');
    });
}

for (const kind of ['date', 'range']) {
  test(`Picker ${kind} still reformats its value after preserving a prefix-only draft`, async ({ page }) => {
    await page.goto('/?fixture=picker-prefix');
    await page.getByRole('checkbox', { name: 'Live picker prefix', exact: true }).check();
    await page.getByRole('combobox', { name: 'Live picker kind', exact: true }).selectOption(kind);
    const input = page.locator('.fixture-picker-prefix input').first();
    await input.fill('draft');
    await page.getByRole('textbox', { name: 'Live picker prefix value', exact: true })
      .evaluate((node: HTMLInputElement) => {
        node.value = 'next';
        node.dispatchEvent(new Event('input', { bubbles: true }));
      });
    await expect(input).toHaveValue('draft');

    await page.getByRole('button', { name: 'Use slash picker format', exact: true })
      .dispatchEvent('click');

    await expect(input).toHaveValue('2024/09/15');
    await expect(page.getByLabel('Picker prefix events', { exact: true })).toHaveText('');
  });
}
