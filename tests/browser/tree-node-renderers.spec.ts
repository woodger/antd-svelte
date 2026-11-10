import { test, expect } from './test';
import reference from './fixtures/ant-design-tree-node-renderers-reference.json' with { type: 'json' };
import { readTreeNodeRenderers } from './tree-node-renderers-metrics';

for (const [index, entry] of reference.cases.entries()) {
  test(`Tree node renderers and hover events match Source for ${entry.sample.id}`,
    async ({ page }) => {
      await page.goto('/?fixture=tree-node-renderers');
      await page.getByRole('combobox', { name: 'Tree renderer sample', exact: true })
        .selectOption(String(index));
      const prefix = `${'prefix' in entry.sample ? entry.sample.prefix : 'ant'}-tree`;

      await expect.poll(() => page.evaluate(readTreeNodeRenderers, prefix)).toEqual(entry.initial);

      for (const step of entry.steps) {
        if (step.action === 'hover') {
          await page.locator(`.${prefix}-title`).filter({ hasText: /^Root$/ }).hover({ force: true });
        } else if (step.action === 'leave') {
          await page.mouse.move(1000, 600);
        } else {
          await page.locator(`.${prefix}-switcher`).first().click();
        }

        await expect.poll(() => page.evaluate(readTreeNodeRenderers, prefix)).toEqual(step.result);
      }
    });
}

test('Tree updates node renderers without replacing focus, selection, IDs or its native root',
  async ({ page }) => {
    await page.goto('/?fixture=tree-node-renderers');
    await page.getByText('Root', { exact: true }).click();
    const tree = page.getByRole('tree');
    await tree.press('Home');
    const active = await tree.getAttribute('aria-activedescendant');
    const root = await page.locator('[data-ant-tree-root]').elementHandle();
    const selected = await page.locator('.ant-tree-node-selected').elementHandle();

    await page.getByRole('combobox', { name: 'Node switcher', exact: true })
      .selectOption('element');

    await expect(page.locator('[data-renderer="node"]')).toHaveText(['N', 'N']);
    await expect(tree).toBeFocused();
    await expect(tree).toHaveAttribute('aria-activedescendant', active!);
    await expect(page.locator('.ant-tree-node-selected')).toHaveText('Root');
    expect(await root!.evaluate(node => node === document.querySelector('[data-ant-tree-root]')))
      .toBe(true);
    expect(await selected!.evaluate(node => node === document.querySelector('.ant-tree-node-selected')))
      .toBe(true);
  });

test('Tree hover callbacks use current selection and exclude switcher pointer movement',
  async ({ page }) => {
    await page.goto('/?fixture=tree-node-renderers');
    await page.getByText('Root', { exact: true }).click();
    await page.mouse.move(1000, 600);
    const before = JSON.parse(await page.locator('[data-tree-renderer-events]').innerText());

    await page.locator('[data-ant-tree-switcher]').first().hover();
    await page.mouse.move(1000, 600);

    await expect(page.locator('[data-tree-renderer-events]')).toHaveText(JSON.stringify(before));

    await page.getByText('Root', { exact: true }).hover();

    await expect.poll(async () => {
      const events = JSON.parse(await page.locator('[data-tree-renderer-events]').innerText());
      return events.at(-1);
    }).toMatchObject({ kind: 'enter', type: 'mouseenter', node: { key: 'root', selected: true } });
  });

test('Tree stops hover callbacks after unmount and preserves an external editor', async ({ page }) => {
  await page.goto('/?fixture=tree-node-renderers');
  const content = await page.getByText('Root', { exact: true })
    .locator('..').elementHandle();
  await page.getByRole('checkbox', { name: 'Mount renderer tree', exact: true }).uncheck();
  const before = await page.locator('[data-tree-renderer-events]').innerText();
  const editor = page.getByRole('textbox', { name: 'Renderer editor', exact: true });
  await editor.fill('Retained draft');

  await content!.evaluate(node => {
    node.dispatchEvent(new MouseEvent('mouseenter'));
    node.dispatchEvent(new MouseEvent('mouseleave'));
  });

  await expect(page.locator('[data-tree-renderer-events]')).toHaveText(before);
  await expect(page.locator('[data-tree-renderer-ref]')).toHaveText('none');
  await expect(editor).toBeFocused();
  await expect(editor).toHaveValue('Retained draft');
});
