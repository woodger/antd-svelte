import { test, expect } from './test';
import reference from './fixtures/ant-design-card-config-reference.json' with { type: 'json' };
import { snapshotCardConfiguration } from './card-config-metrics';

for (const sample of reference.cases) {
  test(`Card and Meta configuration match source semantic parts for ${sample.name}`,
    async ({ page }) => {
      await page.goto('/?fixture=card-config');
      await page.getByRole('combobox', { name: 'Card config preset', exact: true })
        .selectOption(sample.name);
      await page.mouse.move(1300, 1100);

      await expect.poll(() => page.evaluate(snapshotCardConfiguration)).toEqual(sample.expected);
    });
}

for (const part of ['body', 'Meta']) {
  test(`Card configuration updates retain the ${part} editor, tabs and sibling scope`,
    async ({ page }) => {
      await page.goto('/?fixture=card-config');
      await page.getByRole('combobox', { name: 'Card config preset', exact: true })
        .selectOption('context-functions');
      await page.getByLabel('Enable configured Card tabs', { exact: true }).check();
      const tab = page.getByRole('tab', { name: 'Two', exact: true });
      await tab.click();
      const field = page.getByRole('textbox', { name: `Card ${part} draft`, exact: true });
      await field.fill('Kept configured draft');
      await field.evaluate(node => (node as HTMLInputElement).setSelectionRange(1, 5, 'backward'));
      const previous = await field.elementHandle();
      const root = page.getByRole('form', { name: 'Configured Card form', exact: true });
      const card = root.locator('.ant-card');
      const meta = root.locator('.ant-card-meta');
      const previousCard = await card.elementHandle();
      const previousMeta = await meta.elementHandle();
      const data = await root.evaluate(node => [...new FormData(node as HTMLFormElement)]);
      await page.getByRole('button', { name: 'Update Card configuration', exact: true })
        .dispatchEvent('click');

      await expect(card).toHaveClass(/context-card-updated/);
      await expect(meta).toHaveClass(/context-meta-updated/);
      await expect(card).toHaveCSS('opacity', '0.6');
      await expect(meta).toHaveCSS('outline-offset', '7px');
      await page.getByRole('button', { name: 'Toggle configured Card size', exact: true })
        .dispatchEvent('click');

      await expect(card).toHaveClass(/context-card-root-small-borderless/);
      await expect(card).toHaveCSS('opacity', '0.6');
      await page.getByRole('button', { name: 'Toggle configured Meta title', exact: true })
        .dispatchEvent('click');

      await expect(meta).toHaveClass(/context-meta-root-untitled/);
      await expect(root.locator('.ant-card-meta-title')).toHaveCount(0);
      await expect(field).toBeFocused();
      await expect(field).toHaveValue('Kept configured draft');
      expect(await field.evaluate((node, old) => node === old, previous)).toBe(true);
      expect(await card.evaluate((node, old) => node === old, previousCard)).toBe(true);
      expect(await meta.evaluate((node, old) => node === old, previousMeta)).toBe(true);
      expect(await field.evaluate(node => {
        const input = node as HTMLInputElement;
        return [input.selectionStart, input.selectionEnd, input.selectionDirection];
      })).toEqual([1, 5, 'backward']);
      expect(await root.evaluate(node => [...new FormData(node as HTMLFormElement)])).toEqual(data);
      await expect(tab).toHaveAttribute('aria-selected', 'true');
      await expect(page.getByLabel('Configured Card changes', { exact: true })).toHaveText('1');
      await expect(page.locator('.outside-card-config')).toHaveCSS('opacity', '1');
      await expect(page.locator('.outside-card-config')).not.toHaveClass(/context-|local-/);
      await page.getByRole('button', { name: 'Update Card configuration', exact: true })
        .dispatchEvent('click');

      await expect(card).not.toHaveClass(/context-card-updated/);
      await expect(meta).not.toHaveClass(/context-meta-updated/);
      await expect(card).toHaveCSS('opacity', '0.65');
      await expect(meta).toHaveCSS('opacity', '0.8');
      await expect(field).toBeFocused();
    });
}
