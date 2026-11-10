import { test, expect } from './test';
import reference from './fixtures/ant-design-tree-virtual-reference.json' with { type: 'json' };
import { readTreeVirtual } from './tree-virtual-metrics';

for (const [index, entry] of reference.cases.entries()) {
  test(`Tree virtual list and scrolling match Source for ${entry.sample.id}`, async ({ page }) => {
    await page.goto('/?fixture=tree-virtual');
    await page.getByRole('combobox', { name: 'Tree virtual sample', exact: true })
      .selectOption(String(index));
    const prefix = `${'prefix' in entry.sample ? entry.sample.prefix : 'ant'}-tree`;

    await expect.poll(() => page.evaluate(readTreeVirtual, prefix)).toEqual(entry.initial);

    for (const [stepIndex, step] of entry.steps.entries()) {
      if (step.action.kind === 'scroll') {
        await page.getByRole('combobox', { name: 'Tree virtual action', exact: true })
          .selectOption(String(stepIndex));
        await page.getByRole('button', { name: 'Scroll virtual tree', exact: true }).click();
      } else if (step.action.kind === 'update') {
        await page.getByRole('button', { name: 'Update virtual tree', exact: true }).click();
      } else if ('value' in step.action && typeof step.action.value === 'string') {
        await page.getByRole('tree', { name: 'Virtual tree', exact: true }).press(step.action.value);
      }

      await expect.poll(() => page.evaluate(readTreeVirtual, prefix)).toEqual(step.result);
    }
  });
}
