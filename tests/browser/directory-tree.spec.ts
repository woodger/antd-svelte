import { test, expect } from './test';
import reference from './fixtures/ant-design-directory-tree-reference.json' with { type: 'json' };
import { readDirectoryTree } from './directory-tree-metrics';

for (const [index, entry] of reference.cases.entries()) {
  test(`DirectoryTree matches Source selection, icons and styles for ${entry.sample.id}`,
    async ({ page }) => {
      await page.goto('/?fixture=directory-tree');
      await page.getByRole('combobox', { name: 'Directory sample', exact: true })
        .selectOption(String(index));
      const prefix = `${'prefix' in entry.sample && entry.sample.prefix ? entry.sample.prefix : 'ant'}-tree`;

      await expect.poll(() => page.evaluate(readDirectoryTree, prefix)).toEqual(entry.initial);

      for (const step of entry.steps) {
        const target = page.getByText(step.action.title, { exact: true });
        const modifier = 'modifier' in step.action ? step.action.modifier : undefined;
        const modifiers: ('Control' | 'Meta' | 'Shift')[] =
          modifier === 'Control' || modifier === 'Meta' || modifier === 'Shift' ? [modifier] : [];
        const force = Boolean('disabled' in entry.sample && entry.sample.disabled);
        if ('double' in step.action && step.action.double) await target.dblclick({ modifiers, force });
        else await target.click({ modifiers, force });

        await expect.poll(() => page.evaluate(readDirectoryTree, prefix)).toEqual(step.result);
      }
    });
}

test('DirectoryTree control release preserves the accepted keys and keeps Shift selection usable',
  async ({ page }) => {
    await page.goto('/?fixture=directory-tree');
    await page.getByRole('combobox', { name: 'Directory sample', exact: true })
      .selectOption(String(reference.cases.findIndex(entry => entry.sample.id === 'controlled-accept')));
    await page.getByText('Folder 0', { exact: true }).click();
    await page.getByText('A', { exact: true }).click();

    await page.getByRole('checkbox', { name: 'Controlled directory keys', exact: true }).uncheck();

    await expect(page.locator('.ant-tree-node-selected')).toHaveText('A');
    await page.getByText('Z', { exact: true }).click({ modifiers: ['Shift'] });

    await expect(page.locator('.ant-tree-node-selected')).toHaveText(['A', 'B', 'D', 'Other', 'Z']);
  });

test('DirectoryTree control release does not accept previously rejected selections or expansions',
  async ({ page }) => {
    await page.goto('/?fixture=directory-tree');
    await page.getByRole('combobox', { name: 'Directory sample', exact: true })
      .selectOption(String(reference.cases.findIndex(entry => entry.sample.id === 'controlled-hold')));
    await page.getByRole('checkbox', { name: 'Multiple directory selection', exact: true }).check();
    await page.getByText('Folder 0', { exact: true }).click();
    await page.getByText('Z', { exact: true }).click();

    await page.getByRole('checkbox', { name: 'Controlled directory keys', exact: true }).uncheck();

    await expect(page.locator('.ant-tree-node-selected')).toHaveCount(0);
    await expect(page.getByText('A', { exact: true })).toHaveCount(0);

    await page.getByText('Other', { exact: true }).click({ modifiers: ['Shift'] });

    await expect(page.locator('.ant-tree-node-selected')).toHaveText(['Other', 'Z']);
    await expect(page.getByText('X', { exact: true })).toHaveCount(0);
  });

test('DirectoryTree keeps keyboard selection sticky and delegates branch navigation to Tree',
  async ({ page }) => {
    await page.goto('/?fixture=directory-tree');
    const tree = page.getByRole('tree');
    await tree.focus();
    await tree.press('Home');
    await tree.press('ArrowDown');
    await tree.press(' ');
    await tree.press(' ');

    await expect(page.locator('.ant-tree-node-selected')).toHaveText('A');
    await expect(tree).toBeFocused();

    await tree.press('ArrowDown');
    await tree.press('Enter');

    await expect(page.locator('.ant-tree-node-selected')).toHaveText('B');

    await tree.press('Home');
    await tree.press('Enter');

    await expect(page.getByText('A', { exact: true })).toHaveCount(0);
    await expect(tree).toBeFocused();
  });

test('DirectoryTree updates icon and block defaults without replacing its root or selected row',
  async ({ page }) => {
    await page.goto('/?fixture=directory-tree');
    await page.getByText('A', { exact: true }).click();
    const root = await page.locator('[data-ant-tree-root]').elementHandle();
    const selected = await page.locator('.ant-tree-node-selected').elementHandle();

    await page.getByRole('checkbox', { name: 'Block directory rows', exact: true }).uncheck();
    await page.getByRole('checkbox', { name: 'Custom directory icon', exact: true }).check();

    await expect(page.locator('[data-ant-tree-root]')).not.toHaveClass(/ant-tree-block-node/);
    await expect(page.locator('[data-ant-tree-root]')).toHaveClass(/directory-user-array/);
    await expect(page.locator('[data-ant-tree-root]')).toHaveClass(/directory-user-object/);
    await expect(page.locator('.ant-tree-node-selected [data-custom-directory-icon]'))
      .toHaveText('closed:a');
    expect(await root!.evaluate(node => node === document.querySelector('[data-ant-tree-root]')))
      .toBe(true);
    expect(await selected!.evaluate(node => node === document.querySelector('.ant-tree-node-selected')))
      .toBe(true);

    await page.getByRole('checkbox', { name: 'Show directory icons', exact: true }).uncheck();

    await expect(page.locator('[data-ant-tree-root]')).toHaveClass(/ant-tree-icon-hide/);
    await expect(page.locator('.ant-tree-node-selected')).toHaveText('A');
  });

test('DirectoryTree forwards native focus refs and clears them on unmount', async ({ page }) => {
  await page.goto('/?fixture=directory-tree');
  await expect(page.locator('[data-directory-ref]')).toHaveText('DIV');

  await page.getByRole('button', { name: 'Focus directory', exact: true }).click();

  await expect(page.getByRole('tree')).toBeFocused();
  await page.getByRole('button', { name: 'Blur directory', exact: true })
    .evaluate((node: HTMLButtonElement) => node.click());

  await expect(page.getByRole('tree')).not.toBeFocused();
  await page.getByRole('checkbox', { name: 'Mount DirectoryTree', exact: true }).uncheck();
  const editor = page.getByRole('textbox', { name: 'Directory editor', exact: true });
  await editor.fill('Retained draft');

  await expect(page.locator('[data-directory-ref]')).toHaveText('none');
  await expect(page.getByRole('tree')).toHaveCount(0);
  await expect(editor).toBeFocused();
  await expect(editor).toHaveValue('Retained draft');
});
