import { test, expect } from './test';
import reference from './fixtures/ant-design-select-prefix-reference.json' with { type: 'json' };
import { snapshotSelectPrefix } from './select-prefix-metrics';

test.use({ viewport: reference.reference.viewport });

for (const entry of reference.cases) {
  for (const scope of ['normal', 'nested', 'sibling'] as const) {
    test(`Select prefixes match Source ${entry.sample.id}/${scope}`, async ({ page }) => {
      await page.goto('/?fixture=select-prefix');
      await page.getByRole('combobox', { name: 'Select prefix sample', exact: true })
        .selectOption(entry.sample.id);
      await page.getByRole('combobox', { name: 'Select prefix scope', exact: true }).selectOption(scope);
      if ('opened' in entry.sample && entry.sample.opened) {
        await page.getByRole('combobox', { name: 'Prefix choices', exact: true }).click();
      }
      await page.mouse.move(1270, 890);

      await expect.poll(() => page.evaluate(snapshotSelectPrefix)).toEqual(entry.result[scope]);
    });
  }
}

test('Select prefix updates preserve open popup, search selection, IDs, form values and callbacks', async ({ page }) => {
  await page.goto('/?fixture=select-prefix');
  await page.getByRole('checkbox', { name: 'Live Select prefix', exact: true }).check();
  const control = page.getByRole('combobox', { name: 'Prefix choices', exact: true });
  await control.fill('draft');
  await control.evaluate((node: HTMLInputElement) => node.setSelectionRange(1, 4, 'backward'));
  const root = page.locator('[data-ant-select-control]');
  const popup = page.getByRole('listbox', { name: 'Prefix choices', exact: true });
  const option = page.getByRole('option', { name: 'Alpha', exact: true });
  const oldRoot = await root.elementHandle();
  const oldInput = await control.elementHandle();
  const oldPopup = await popup.elementHandle();
  const oldOption = await option.elementHandle();
  const id = await control.getAttribute('id');

  for (const step of reference.transitions) {
    await page.getByRole('textbox', { name: 'Live Select prefix value', exact: true })
      .evaluate((node: HTMLInputElement, value) => {
        node.value = value;
        node.dispatchEvent(new Event('input', { bubbles: true }));
      }, step.prefix);

    await expect.poll(() => page.evaluate(snapshotSelectPrefix)).toEqual(step.result);
    expect(await root.evaluate((node, old) => node === old, oldRoot)).toBe(true);
    expect(await control.evaluate((node, old) => node === old, oldInput)).toBe(true);
    expect(await popup.evaluate((node, old) => node === old, oldPopup)).toBe(true);
    expect(await option.evaluate((node, old) => node === old, oldOption)).toBe(true);
    await expect(control).toHaveAttribute('id', id!);
    await expect(control).toBeFocused();
    await expect(control).toHaveValue(step.value);
    expect(await control.evaluate((node: HTMLInputElement) =>
      [node.selectionStart, node.selectionEnd, node.selectionDirection])).toEqual(step.selection);
    await expect(page.getByLabel('Select prefix events', { exact: true })).toHaveText('search:draft');
    expect(await page.locator('form').evaluate(node =>
      new FormData(node as HTMLFormElement).getAll('choices')))
      .toEqual(['b']);
  }
  await control.press('End');
  await control.press('Enter');

  await expect(page.getByLabel('Select prefix events', { exact: true })).toContainText('change:c');
  expect(await page.locator('form').evaluate(node =>
    new FormData(node as HTMLFormElement).getAll('choices')))
    .toEqual(['c']);
});

test('Select local/global prefixes preserve portalled multiple tags, focus and native reset', async ({ page }) => {
  await page.goto('/?fixture=select-prefix');
  await page.getByRole('checkbox', { name: 'Live Select prefix', exact: true }).check();
  await page.getByRole('checkbox', { name: 'Multiple prefix Select', exact: true }).check();
  await page.getByRole('checkbox', { name: 'Portal prefix Select', exact: true }).check();
  const control = page.getByRole('combobox', { name: 'Prefix choices', exact: true });
  await control.fill('held');
  const popup = page.getByRole('listbox', { name: 'Prefix choices', exact: true });
  const oldPopup = await popup.elementHandle();
  const tag = page.getByRole('button', { name: 'Remove Beta', exact: true });
  const oldTag = await tag.elementHandle();

  for (const [field, value] of [['Local Select prefix value', 'choices'],
    ['Live Select prefix value', 'next']] as const) {
    await page.getByRole('textbox', { name: field, exact: true })
      .evaluate((node: HTMLInputElement, value) => {
        node.value = value;
        node.dispatchEvent(new Event('input', { bubbles: true }));
      }, value);

    expect(await popup.evaluate((node, old) => node === old, oldPopup)).toBe(true);
    expect(await tag.evaluate((node, old) => node === old, oldTag)).toBe(true);
    await expect(control).toBeFocused();
    await expect(control).toHaveValue('held');
    await expect(popup).toBeVisible();
    await expect(page.locator('[data-select-prefix-portal]')).toContainText('Alpha');
  }
  await tag.click();

  expect(await page.locator('form').evaluate(node =>
    new FormData(node as HTMLFormElement).getAll('choices')))
    .toEqual([]);
  await page.locator('form').evaluate(node => (node as HTMLFormElement).reset());

  expect(await page.locator('form').evaluate(node =>
    new FormData(node as HTMLFormElement).getAll('choices')))
    .toEqual([]);
  await expect(page.getByLabel('Select prefix events', { exact: true })).toHaveText('search:held|change:');
});

test('Select prefixes preserve default styling and compact geometry while the popup stays open', async ({ page }) => {
  await page.goto('/?fixture=select-prefix');
  await page.getByRole('checkbox', { name: 'Live Select prefix', exact: true }).check();
  await page.getByRole('checkbox', { name: 'Source theme prefix Select', exact: true }).uncheck();
  await page.getByRole('checkbox', { name: 'Compact prefix Select', exact: true }).check();
  await page.getByRole('textbox', { name: 'Live Select prefix value', exact: true }).fill('ant');
  const control = page.getByRole('combobox', { name: 'Prefix choices', exact: true });
  await control.fill('default');
  await page.mouse.move(1270, 890);
  await page.evaluate(async () => {
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    await Promise.all(document.getAnimations()
      .filter(animation => animation.effect?.getComputedTiming().iterations !== Infinity)
      .map(animation => animation.finished.catch(() => {})));
  });
  const original = await control.elementHandle();
  const before = await page.evaluate(snapshotSelectPrefix);
  const container = page.locator('.fixture-select-prefix');
  const corners = await container.evaluate(node => {
    const css = getComputedStyle(node);

    return [css.borderStartStartRadius, css.borderEndEndRadius, css.marginInlineEnd];
  });

  await page.getByRole('textbox', { name: 'Live Select prefix value', exact: true })
    .evaluate((node: HTMLInputElement) => {
      node.value = 'other';
      node.dispatchEvent(new Event('input', { bubbles: true }));
    });

  await expect.poll(() => page.evaluate(snapshotSelectPrefix)).toEqual(before);
  expect(await control.evaluate((node, old) => node === old, original)).toBe(true);
  await expect(control).toBeFocused();
  expect(await container.evaluate(node => {
    const css = getComputedStyle(node);

    return [css.borderStartStartRadius, css.borderEndEndRadius, css.marginInlineEnd];
  })).toEqual(corners);
});
