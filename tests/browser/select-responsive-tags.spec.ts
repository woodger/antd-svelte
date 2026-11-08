import { test, expect } from './test';
import reference from './fixtures/ant-design-select-responsive-tags-reference.json' with { type: 'json' };

for (const entry of reference.cases) {
  test(`Select responsive tags match source geometry for ${entry.sample.id}`, async ({ page }) => {
    await page.goto('/?fixture=select-responsive-tags');
    await page.getByRole('combobox', { name: 'Responsive tags sample', exact: true })
      .selectOption(entry.sample.id);
    const expected = ['long-rest-400', 'snippet-rest-400'].includes(entry.sample.id)
      ? reference.cases.find(sample => sample.sample.id === 'default-400')!.tags : entry.tags;

    await expect.poll(() => page.locator('[data-tag-count] .ant-select-selection-item:not([inert])')
      .evaluateAll(nodes => nodes.map(node => ({
        text: node.querySelector('.ant-select-selection-item-content')!.textContent,
        title: node.getAttribute('title'),
        disabled: node.classList.contains('ant-select-selection-item-disabled'),
        removable: Boolean(node.querySelector('.ant-select-selection-item-remove'))
      })))).toEqual(expected);
    await expect(page.getByRole('status', { name: 'Tag count values', exact: true }))
      .toHaveText(JSON.stringify(entry.sample.values));
    await expect(page.getByRole('status', { name: 'Tag count changes', exact: true }))
      .toHaveText('0');
  });
}

test('Responsive tags preserve typed fields and hand hidden focus to the same input during resize',
  async ({ page }) => {
    await page.goto('/?fixture=select-responsive-tags');
    await page.getByRole('combobox', { name: 'Responsive tags sample', exact: true })
      .selectOption('default-400');
    const input = page.getByRole('combobox', { name: 'Counted values', exact: true });
    const original = await input.elementHandle();
    await page.getByRole('button', { name: 'Удалить Zeta', exact: true }).focus();
    await page.getByRole('spinbutton', { name: 'Tag count width', exact: true })
      .evaluate((node: HTMLInputElement) => {
        node.value = '200';
        node.dispatchEvent(new Event('input', { bubbles: true }));
      });

    await expect(input).toBeFocused();
    expect(await input.evaluate((node, old) => node === old, original)).toBe(true);
    const visible = page.locator('[data-tag-count] .ant-select-selection-item:not([inert])');
    await expect(visible).toHaveText(['Alpha', '+ 3 ...']);
    await expect(page.getByRole('button', { name: 'Удалить Zeta', exact: true })).toHaveCount(0);
    const form = page.getByRole('form', { name: 'Tag count native form', exact: true });
    expect(await form.evaluate(node => new FormData(node as HTMLFormElement).getAll('tag-count')))
      .toEqual(['a', 'locked', '0', 'z']);
    await page.getByRole('spinbutton', { name: 'Tag count width', exact: true })
      .evaluate((node: HTMLInputElement) => {
        node.value = '400';
        node.dispatchEvent(new Event('input', { bubbles: true }));
      });
    await expect(visible).toHaveText(['Alpha', 'Locked', 'Zero', 'Zeta']);
    await expect(page.getByRole('status', { name: 'Tag count changes', exact: true })).toHaveText('0');
  });

test('Responsive tag measurement follows input text and releases resources across mount cycles',
  async ({ page }) => {
    await page.goto('/?fixture=select-responsive-tags');
    await page.getByRole('combobox', { name: 'Responsive tags sample', exact: true })
      .selectOption('default-400');
    const input = page.getByRole('combobox', { name: 'Counted values', exact: true });
    await input.fill('long search text takes space');
    await expect.poll(() => input.evaluate(node => node.getBoundingClientRect().width))
      .toBeGreaterThan(100);
    await expect(page.locator('[data-tag-count] [data-select-rest]:not([inert])')).toBeVisible();
    await input.fill('');
    await expect(page.locator('[data-tag-count] .ant-select-selection-item:not([inert])'))
      .toHaveText(['Alpha', 'Locked', 'Zero', 'Zeta']);
    const mounted = page.getByRole('checkbox', { name: 'Mount counted Select', exact: true });
    for (let cycle = 0; cycle < 3; cycle++) {
      await mounted.uncheck();
      await expect(input).toHaveCount(0);
      await page.getByRole('spinbutton', { name: 'Tag count width', exact: true }).fill('200');
      await mounted.check();
      await expect(page.locator('[data-tag-count] .ant-select-selection-item:not([inert])'))
        .toHaveText(['Alpha', '+ 3 ...']);
      await page.getByRole('spinbutton', { name: 'Tag count width', exact: true }).fill('400');
      await expect(page.locator('[data-tag-count] .ant-select-selection-item:not([inert])'))
        .toHaveText(['Alpha', 'Locked', 'Zero', 'Zeta']);
    }
    await page.getByRole('checkbox', { name: 'Right to left', exact: true }).check();
    await input.click();
    await expect(page.getByRole('listbox', { name: 'Counted values', exact: true }))
      .toHaveCSS('direction', 'rtl');
    await page.getByRole('checkbox', { name: 'Disable all components', exact: true }).check();
    await expect(input).toBeDisabled();
    await expect(page.locator('[data-tag-count] .ant-select-selection-item-remove')).toHaveCount(0);
  });
