import { test, expect } from './test';
import reference from './fixtures/ant-design-select-tag-render-reference.json' with { type: 'json' };

for (const entry of reference.cases) {
  test(`Select tagRender matches source metadata and events for ${entry.sample.id}`,
    async ({ page }) => {
      await page.goto('/?fixture=select-tag-render');
      await page.getByRole('combobox', { name: 'Tag renderer sample', exact: true })
        .selectOption(entry.sample.id);
      const input = page.getByRole('combobox', { name: 'Custom rendered tags', exact: true });
      if ('focus' in entry.sample) await input.focus();
      if ('text' in entry.sample) await input.fill(entry.sample.text!);
      if ('keys' in entry.sample) {
        for (const key of entry.sample.keys!) await input.press(key);
      }
      if ('clicks' in entry.sample) {
        for (let index = 0; index < entry.sample.clicks!; index++) {
          await page.locator('[data-custom-label]').first().click();
        }
      }
      if ('close' in entry.sample) {
        await page.getByRole('button', { name: `Close ${entry.sample.close}`, exact: true }).click();
      }
      const expected = structuredClone(entry.result);
      if (entry.sample.id === 'disabled-click') expected.events = [];
      // Native single показывает закрытый label в input; Source использует отдельный span.
      if (entry.sample.id === 'single-ignore') expected.query = 'Alpha';

      await expect.poll(() => page.evaluate(() => {
        const input = document.querySelector<HTMLInputElement>('[data-tag-render] input')!;
        return {
          values: JSON.parse(document.querySelector('[aria-label="Tag render values"]')!.textContent!),
          events: JSON.parse(document.querySelector('[aria-label="Tag render events"]')!.textContent!),
          query: input.value,
          open: document.querySelector('[data-tag-render] .ant-select')!
            .classList.contains('ant-select-open'),
          focus: document.activeElement === input,
          tags: [...document.querySelectorAll<HTMLElement>('[data-custom-tag]')]
            .filter(node => !node.closest('[inert]')).map(node => ({
              ...JSON.parse(node.dataset.customTag!),
              label: node.querySelector('[data-custom-label]')!.textContent
            }))
        };
      })).toEqual(expected);
    });
}

test('Select tagRender composes native Tag close and can switch without losing input or search',
  async ({ page }) => {
    await page.goto('/?fixture=select-tag-render');
    await page.getByRole('checkbox', { name: 'Use native Tag renderer', exact: true }).check();
    const input = page.getByRole('combobox', { name: 'Custom rendered tags', exact: true });
    await input.focus();
    await page.getByRole('button', { name: 'Native close string:a', exact: true }).click();
    await expect(page.getByRole('status', { name: 'Tag render values', exact: true }))
      .toHaveText('[0]');
    await expect(input).toBeFocused();
    await input.fill('query');
    const original = await input.elementHandle();
    const before = await page.getByRole('status', { name: 'Tag render events', exact: true })
      .textContent();
    await page.getByRole('checkbox', { name: 'Restore default tag renderer', exact: true })
      .evaluate((node: HTMLInputElement) => {
        node.checked = true;
        node.dispatchEvent(new Event('change', { bubbles: true }));
      });

    expect(await input.evaluate((node, old) => node === old, original)).toBe(true);
    await expect(input).toBeFocused();
    await expect(input).toHaveValue('query');
    await expect(page.locator('[data-tag-render] .ant-select-selection-item-content'))
      .toHaveText('Zero');
    await expect(page.getByRole('status', { name: 'Tag render events', exact: true }))
      .toHaveText(before!);
  });

test('Responsive tagRender receives a summary and restores ordinary metadata after widening',
  async ({ page }) => {
    await page.goto('/?fixture=select-tag-render');
    await page.getByRole('checkbox', { name: 'Responsive custom tags', exact: true }).check();
    const tags = page.locator('[data-custom-tag]').filter({ visible: true });
    const readTags = () => tags.evaluateAll(nodes => nodes
      .filter(node => !node.closest('[inert]'))
      .map(node => JSON.parse((node as HTMLElement).dataset.customTag!)));
    await page.getByRole('spinbutton', { name: 'Custom tag width', exact: true }).fill('120');

    await expect.poll(readTags)
      .toEqual([expect.objectContaining({ isMaxTag: true, closable: false, disabled: false })]);
    await page.getByRole('spinbutton', { name: 'Custom tag width', exact: true }).fill('400');
    await expect.poll(async () => (await readTags()).map(info => info.value))
      .toEqual(['a', 0]);
    await expect(page.getByRole('status', { name: 'Tag render values', exact: true }))
      .toHaveText('["a",0]');
    await expect(page.getByRole('status', { name: 'Tag render events', exact: true }))
      .toHaveText('[]');
  });
