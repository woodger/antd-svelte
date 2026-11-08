import { test, expect } from './test';
import reference from './fixtures/ant-design-masonry-prefix-reference.json' with { type: 'json' };
import isolated from './fixtures/ant-design-masonry-prefix-isolated.json' with { type: 'json' };
import { snapshotMasonryPrefix } from './masonry-prefix-metrics';

for (const entry of reference.cases) {
  test(`Masonry prefixes keep source geometry for ${entry.sample.id}`, async ({ page }) => {
    await page.goto('/?fixture=masonry-prefix');
    await page.getByRole('combobox', { name: 'Masonry prefix sample', exact: true })
      .selectOption(entry.sample.id);
    const expected = structuredClone(entry.result);
    // Default RTL stylesheet пересекается с этим alias; fresh source сохраняет LTR.
    if (entry.sample.id === 'rtl-alias') {
      expected.normal = isolated.cases[0].result.normal;
      expected.nested = isolated.cases[0].result.normal;
    }

    await expect.poll(() => page.evaluate(snapshotMasonryPrefix)).toEqual(expected);
  });
}

test('Masonry prefix updates preserve layout DOM and the focused item editor', async ({ page }) => {
  await page.goto('/?fixture=masonry-prefix');
  await page.getByRole('checkbox', { name: 'Live Masonry prefix', exact: true }).check();
  const scope = page.locator('[data-masonry-prefix-scope="normal"]');
  const root = scope.locator(':scope > div');
  const oldRoot = await root.elementHandle();
  const tiles = root.locator(':scope > div');
  await expect(tiles).toHaveCount(5);
  const oldTiles = await tiles.elementHandles();
  const input = page.getByRole('textbox', { name: 'normal item 0', exact: true });
  const oldInput = await input.elementHandle();
  await input.fill('kept draft');
  await input.evaluate((node: HTMLInputElement) => { node.setSelectionRange(1, 5); });

  for (const step of reference.transitions) {
    await page.getByRole('textbox', { name: 'Live Masonry prefix value', exact: true })
      .evaluate((node: HTMLInputElement, prefix) => {
        node.value = prefix;
        node.dispatchEvent(new Event('input', { bubbles: true }));
      }, step.prefix);

    await expect.poll(() => page.evaluate(snapshotMasonryPrefix)).toEqual(step.result);
    expect(await root.evaluate((node, old) => node === old, oldRoot)).toBe(step.sameRoot);
    for (let index = 0; index < oldTiles.length; index++) {
      expect(await tiles.nth(index).evaluate((node, old) => node === old, oldTiles[index]))
        .toBe(step.rootsRetained);
    }
    expect(await input.evaluate((node, old) => node === old, oldInput)).toBe(step.sameInput);
    await expect(input).toHaveValue(step.value);
    expect(await input.evaluate(node => node === document.activeElement)).toBe(step.focused);
    expect(await input.evaluate((node: HTMLInputElement) => [
      node.selectionStart, node.selectionEnd
    ])).toEqual(step.selection);
  }
});

test('Masonry changes motion classes without replacing a leaving item', async ({ page }) => {
  await page.goto('/?fixture=masonry-prefix');
  await page.getByRole('checkbox', { name: 'Live Masonry prefix', exact: true }).check();
  await page.getByRole('checkbox', { name: 'Masonry prefix motion', exact: true }).check();
  const scope = page.locator('[data-masonry-prefix-scope="normal"]');
  const leaving = scope.locator('div:has(> [data-masonry-tile="4"])');
  const oldItem = await leaving.elementHandle();
  await page.getByRole('button', { name: 'Remove last prefixed tile', exact: true }).click();
  await expect(leaving).toHaveClass(/suite-masonry-item-fade-leave-active/);
  await leaving.evaluate(node => node.getAnimations().forEach(animation => animation.pause()));

  await page.getByRole('textbox', { name: 'Live Masonry prefix value', exact: true })
    .evaluate((node: HTMLInputElement) => {
      node.value = 'next';
      node.dispatchEvent(new Event('input', { bubbles: true }));
    });

  await expect(leaving).toHaveClass(/next-masonry-item-fade-leave-active/);
  expect(await leaving.evaluate((node, old) => node === old, oldItem)).toBe(true);
  await leaving.evaluate(node => {
    node.getAnimations().forEach(animation => animation.finish());
    node.dispatchEvent(new TransitionEvent('transitionend', {
      bubbles: true, propertyName: 'opacity'
    }));
  });
  await expect(leaving).toHaveCount(0);
  await expect(scope.locator('[data-masonry-tile]')).toHaveCount(4);
});
