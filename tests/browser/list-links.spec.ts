import { test, expect } from './test';
import reference from './fixtures/ant-design-list-links-reference.json' with { type: 'json' };

test.use({ viewport: reference.viewport });

for (const sample of reference.cases) {
  test(`Listy links match source colors and decorations for ${sample.name}`, async ({ page }) => {
    await page.goto('/?fixture=list-links');
    await page.getByLabel('List links preset', { exact: true }).selectOption(sample.name);

    for (const [kind, states] of Object.entries(sample.links)) {
      const link = page.locator(`#list-link-${kind}`);
      await page.mouse.move(1180, 980);
      await expect(link).toHaveCSS('color', states.normal.color);
      await expect(link).toHaveCSS('text-decoration-line', states.normal.decoration);
      await link.hover();
      await expect(link).toHaveCSS('color', states.hover.color);
      await expect(link).toHaveCSS('text-decoration-line', states.hover.decoration);
      await page.mouse.down();
      await expect(link).toHaveCSS('color', states.active.color);
      await expect(link).toHaveCSS('text-decoration-line', states.active.decoration);
      await page.mouse.move(1180, 980);
      await page.mouse.up();
      await page.keyboard.press('Tab');
      await link.focus();
      await expect(link).toHaveCSS('color', states.focus.color);
      await expect(link).toHaveCSS('text-decoration-line', states.focus.decoration);
      await expect(link).toHaveCSS('outline-style', 'solid');
      await expect(link).toBeFocused();
      await link.evaluate(node => node.blur());
    }
    await expect(page.locator('#outside-list-links')).toHaveCSS('text-decoration-line', 'underline');
  });
}

for (const source of [false, true]) {
  test(`Listy links preserve keyboard navigation and callbacks in ${source ? 'source' : 'native'} theme`,
    async ({ page }) => {
      await page.goto('/?fixture=list-links');
      await page.getByLabel('Source list links', { exact: true }).setChecked(source);

      for (const [index, kind] of ['row'].entries()) {
        const link = page.locator(`#list-link-${kind}`);
        await expect(link).toHaveCSS('text-decoration-line', 'none');
        await link.focus();
        await link.press('Enter');

        await expect(page).toHaveURL(new RegExp(`#${kind}$`));
        await expect(page.getByLabel('List link clicks', { exact: true }))
          .toHaveText(String(index + 1));
        await expect(link).toBeFocused();
      }
      await page.getByLabel('Mount list links', { exact: true }).uncheck();

      await expect(page.locator('#list-link-row')).toHaveCount(0);
      await expect(page.locator('#outside-list-links')).toHaveCSS('text-decoration-line', 'underline');
    });
}

test('Listy link tokens update without replacing the focused native anchor', async ({ page }) => {
  await page.goto('/?fixture=list-links');
  const link = page.locator('#list-link-row');
  const original = await link.elementHandle();
  await page.keyboard.press('Tab');
  await link.focus();

  await page.getByRole('button', { name: 'Update list link tokens', exact: true })
    .dispatchEvent('click');

  const expected = reference.cases.find(sample => sample.name === 'custom')!.links.row.focus;
  await expect(link).toHaveCSS('color', expected.color);
  await expect(link).toHaveCSS('text-decoration-line', expected.decoration);
  expect(await link.evaluate((node, old) => node === old, original)).toBe(true);
  await expect(link).toBeFocused();
  await expect(page.getByLabel('List link clicks', { exact: true })).toHaveText('0');
  await expect(page.locator('#outside-list-links')).toHaveCSS('text-decoration-line', 'underline');
});
