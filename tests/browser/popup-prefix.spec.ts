import { test, expect } from './test';
import reference from './fixtures/ant-design-popup-prefix-reference.json' with { type: 'json' };
import { snapshotPopupPrefix } from './popup-prefix-metrics';

function expectedSnapshot(result: typeof reference.cases[number]['result']) {
  // Raw textContent хранит React output; Svelte whitespace между slots не сравнивается.
  return Object.fromEntries(Object.entries(result).map(([scope, entry]) => [scope, {
    ...entry,
    popups: entry.popups.map(
      (popup: typeof reference.cases[number]['result']['normal']['popups'][number]) => {
        const { text: _text, ...rest } = popup;
        return rest;
      }
    )
  }]));
}

for (const entry of reference.cases) {
  test(`Shared popup and Slider prefixes match source for ${entry.sample.id}`, async ({ page }) => {
    await page.goto('/?fixture=popup-prefix');
    await page.getByRole('combobox', { name: 'Popup prefix sample', exact: true })
      .selectOption(entry.sample.id);

    await expect.poll(() => page.evaluate(snapshotPopupPrefix))
      .toEqual(expectedSnapshot(entry.result));
  });
}

for (const kind of ['tooltip', 'popover', 'popconfirm', 'single', 'range']) {
  test(`Live ${kind} prefixes preserve open popups and focused drafts`, async ({ page }) => {
    await page.goto('/?fixture=popup-prefix');
    await page.getByRole('combobox', { name: 'Popup prefix sample', exact: true })
      .selectOption(`${kind}-global`);
    // Как в UMD transitions: внешний pointerdown отдельно проверяется в lifecycle suites.
    await page.getByRole('checkbox', { name: 'Live popup prefix', exact: true })
      .evaluate((node: HTMLInputElement) => {
        node.checked = true;
        node.dispatchEvent(new Event('change', { bubbles: true }));
      });
    const initial = reference.cases.find(entry => entry.sample.id === `${kind}-global`)!;
    await expect.poll(() => page.evaluate(snapshotPopupPrefix))
      .toEqual(expectedSnapshot(initial.result));
    const scope = page.locator('[data-popup-prefix-scope="normal"]');
    const control = scope.locator('[data-prefix-widget] > :first-child');
    const oldControl = await control.elementHandle();
    const popupSelector = kind === 'popover' || kind === 'popconfirm'
      ? '[data-prefix-portal] [popover][role="dialog"]'
      : '[data-prefix-portal] [popover][role="tooltip"]';
    const popups = scope.locator(popupSelector);
    await expect(popups).toHaveCount(kind === 'range' ? 2 : 1);
    const oldPopups = await popups.elementHandles();
    const input = page.getByRole('textbox', { name: 'normal widget draft', exact: true });
    const oldInput = await input.elementHandle();
    await input.fill('kept draft');
    await input.evaluate((node: HTMLInputElement) => { node.setSelectionRange(1, 5); });

    for (const step of reference.transitions.filter(step => step.kind === kind)) {
      await page.getByRole('textbox', { name: 'Live popup prefix value', exact: true })
        .evaluate((node: HTMLInputElement, prefix) => {
          node.value = prefix;
          node.dispatchEvent(new Event('input', { bubbles: true }));
        }, step.prefix);

      await expect.poll(() => page.evaluate(snapshotPopupPrefix))
        .toEqual(expectedSnapshot(step.result));
      expect(await control.evaluate((node, old) => node === old, oldControl)).toBe(step.sameControl);
      for (let index = 0; index < oldPopups.length; index++) {
        expect(await popups.nth(index).evaluate((node, old) => node === old, oldPopups[index]))
          .toBe(step.popupsRetained);
      }
      expect(await input.evaluate((node, old) => node === old, oldInput)).toBe(step.sameInput);
      await expect(input).toHaveValue(step.value);
      expect(await input.evaluate(node => node === document.activeElement)).toBe(step.focused);
      expect(await input.evaluate((node: HTMLInputElement) => [
        node.selectionStart, node.selectionEnd
      ])).toEqual(step.selection);
    }

    if (kind === 'single' || kind === 'range') {
      const slider = scope.getByRole('slider').first();
      await slider.focus();
      await page.keyboard.press('ArrowRight');

      await expect(slider).toHaveAttribute('aria-valuenow', '26');
      await expect(slider).toBeFocused();
      await expect(popups.first()).toContainText('26');
    }
  });
}
