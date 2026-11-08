import { test, expect } from './test';
import type { Page } from '@playwright/test';
import reference from './fixtures/ant-design-structure-prefix-reference.json' with { type: 'json' };
import { snapshotStructurePrefix } from './structure-prefix-metrics';

async function affixTargets(page: Page) {
  await page.locator('[data-affix-prefix-target]').evaluateAll(nodes => {
    for (const node of nodes) {
      node.scrollTop = 20;
      node.dispatchEvent(new Event('scroll'));
    }
  });
  await expect(page.locator('[data-prefix-widget="affix"] [class*="-affix"]')).toHaveCount(3);
}

for (const entry of reference.cases) {
  test(`Shared Alert Collapse and Affix prefixes match source for ${entry.sample.id}`,
    async ({ page }) => {
      await page.goto('/?fixture=structure-prefix');
      await page.getByRole('combobox', { name: 'Structure prefix sample', exact: true })
        .selectOption(entry.sample.id);
      await affixTargets(page);

      await expect.poll(() => page.evaluate(snapshotStructurePrefix)).toEqual(entry.result);
    });
}

test('Structure prefix updates preserve pinned nodes and the expanded panel editor',
  async ({ page }) => {
    await page.goto('/?fixture=structure-prefix');
    await page.getByRole('checkbox', { name: 'Live structure prefix', exact: true }).check();
    await affixTargets(page);
    const scope = page.locator('[data-structure-prefix-scope="normal"]');
    const roots = scope.locator(
      '[data-prefix-widget="affix"] [class*="-affix"], [data-prefix-widget]:not([data-prefix-widget="affix"]) > :first-child'
    );
    const oldRoots = await roots.elementHandles();
    const input = page.getByRole('textbox', { name: 'normal panel draft', exact: true });
    const oldInput = await input.elementHandle();
    await input.fill('kept panel');
    await input.evaluate((node: HTMLInputElement) => { node.setSelectionRange(1, 4); });

    for (const step of reference.transitions) {
      await page.getByRole('textbox', { name: 'Live structure prefix value', exact: true })
        .evaluate((node: HTMLInputElement, prefix) => {
          node.value = prefix;
          node.dispatchEvent(new Event('input', { bubbles: true }));
        }, step.prefix);

      await expect.poll(() => page.evaluate(snapshotStructurePrefix)).toEqual(step.result);
      await expect(roots).toHaveCount(3);
      for (let index = 0; index < oldRoots.length; index++) {
        expect(await roots.nth(index).evaluate((node, old) => node === old, oldRoots[index]))
          .toBe(step.rootsRetained);
      }
      expect(await input.evaluate((node, old) => node === old, oldInput)).toBe(step.sameInput);
      await expect(input).toHaveValue(step.value);
      expect(await input.evaluate(node => node === document.activeElement)).toBe(step.focused);
      expect(await input.evaluate((node: HTMLInputElement) => [
        node.selectionStart, node.selectionEnd
      ])).toEqual(step.selection);
    }

    await scope.getByRole('button', { name: 'Second', exact: true }).click();

    await expect(scope.getByRole('button', { name: 'Second', exact: true }))
      .toHaveAttribute('aria-expanded', 'true');
    await expect(input).toHaveValue('kept panel');
  });
