import { test, expect } from './test';
import reference from './fixtures/ant-design-descriptions-config-reference.json' with { type: 'json' };
import { snapshotDescriptionsConfiguration } from './descriptions-config-metrics';

for (const sample of reference.cases) {
  test(`Descriptions config matches source cells and style layers for ${sample.name}`,
    async ({ page }) => {
      await page.goto('/?fixture=descriptions-config');
      await page.getByRole('combobox', { name: 'Descriptions config preset', exact: true })
        .selectOption(sample.name);
      await page.mouse.move(1300, 1100);
      const expected = Object.fromEntries(Object.entries(sample.expected).map(([key, nodes]) =>
        [key, nodes.map(node => ({ ...node, classes: expect.arrayContaining(node.classes) }))]));

      await expect.poll(() => page.evaluate(snapshotDescriptionsConfiguration)).toEqual(expected);
      const snapshot = await page.evaluate(snapshotDescriptionsConfiguration);
      for (const [key, nodes] of Object.entries(sample.expected)) {
        for (const [index, node] of nodes.entries()) {
          expect(snapshot[key][index].classes).toHaveLength(node.classes.length);
        }
      }
    });
}

test('Descriptions configuration updates preserve first editor, cell identity and sibling scope',
  async ({ page }) => {
    await page.goto('/?fixture=descriptions-config');
    await page.getByRole('combobox', { name: 'Descriptions config preset', exact: true })
      .selectOption('context-functions');
    const form = page.getByRole('form', { name: 'Configured Descriptions form', exact: true });
    const root = form.locator('.ant-descriptions');
    const field = page.getByRole('textbox', { name: 'Descriptions configured draft', exact: true });
    await field.fill('Retained configured draft');
    await field.evaluate(node => (node as HTMLInputElement).setSelectionRange(2, 7, 'backward'));
    const previous = await field.elementHandle();
    const cell = root.locator('.ant-descriptions-item').first();
    const previousCell = await cell.elementHandle();
    const data = await form.evaluate(node => [...new FormData(node as HTMLFormElement)]);
    await page.getByRole('button', { name: 'Update Descriptions configuration', exact: true })
      .dispatchEvent('click');

    await expect(root).toHaveClass(/context-descriptions-updated/);
    await expect(root).toHaveCSS('opacity', '0.6');
    await expect(root).toHaveCSS('outline-offset', '7px');
    await page.getByRole('button', { name: 'Toggle configured Descriptions columns', exact: true })
      .dispatchEvent('click');
    await page.getByRole('button', { name: 'Toggle configured Descriptions size', exact: true })
      .dispatchEvent('click');

    await expect(root).toHaveClass(/context-descriptions-root-3-small-3/);
    await expect(root).toHaveCSS('opacity', '0.6');
    await expect(field).toBeFocused();
    await expect(field).toHaveValue('Retained configured draft');
    expect(await field.evaluate((node, old) => node === old, previous)).toBe(true);
    expect(await cell.evaluate((node, old) => node === old, previousCell)).toBe(true);
    expect(await field.evaluate(node => {
      const input = node as HTMLInputElement;
      return [input.selectionStart, input.selectionEnd, input.selectionDirection];
    })).toEqual([2, 7, 'backward']);
    expect(await form.evaluate(node => [...new FormData(node as HTMLFormElement)])).toEqual(data);
    await expect(page.locator('.outside-descriptions-config')).toHaveCSS('opacity', '1');
    await expect(page.locator('.outside-descriptions-config')).not.toHaveClass(/context-|local-/);
    await page.getByRole('button', { name: 'Update Descriptions configuration', exact: true })
      .dispatchEvent('click');

    await expect(root).not.toHaveClass(/context-descriptions-updated/);
    await expect(root).toHaveCSS('opacity', '0.65');
    await expect(field).toBeFocused();
  });
