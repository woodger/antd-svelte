import { test, expect } from './test';
import reference from './fixtures/ant-design-target-container-reference.json' with { type: 'json' };
import { snapshotTargetContainer } from './target-container-metrics';

test.use({ viewport: reference.viewport });

for (const sample of reference.cases) {
  test(`Target container inheritance matches source Affix and Anchor behavior for ${sample.name}`,
    async ({ page }) => {
      await page.goto('/?fixture=target-container');
      await page.getByLabel('Target container preset', { exact: true }).selectOption(sample.name);

      await expect.poll(() => page.evaluate(snapshotTargetContainer)).toEqual(sample.initial);
      await page.evaluate(() => {
        for (const name of ['a', 'b']) document.getElementById(`target-${name}`)!.scrollTop = 180;
        window.scrollTo(0, 1800);
      });

      await expect.poll(() => page.evaluate(snapshotTargetContainer)).toEqual(sample.scrolled);
    });
}

test('Changing the inherited target retains consumer DOM, focus, form values and explicit overrides',
  async ({ page }) => {
    await page.goto('/?fixture=target-container');
    const normal = page.locator('[data-target-consumer="normal"]');
    const content = normal.locator('.target-affix > div').last();
    const input = normal.getByRole('textbox', { name: 'Target draft normal', exact: true });
    const link = normal.getByRole('link', { name: 'One', exact: true });
    await expect(content).toHaveCSS('position', 'fixed');
    const oldContent = await content.elementHandle();
    const oldInput = await input.elementHandle();
    const oldLink = await link.elementHandle();
    await input.fill('Target draft');
    await input.focus();
    await input.evaluate(node => (node as HTMLInputElement).setSelectionRange(1, 8));
    await page.getByRole('button', { name: 'Use target B', exact: true }).dispatchEvent('click');
    // Native сразу достигает source updatePosition frame; stale geometry записана отдельно.
    await expect.poll(() => page.evaluate(snapshotTargetContainer))
      .toEqual(reference.retarget.afterManualUpdate);
    expect(await content.evaluate((node, old) => node === old, oldContent)).toBe(true);
    expect(await input.evaluate((node, old) => node === old, oldInput)).toBe(true);
    expect(await link.evaluate((node, old) => node === old, oldLink)).toBe(true);
    await expect(input).toHaveValue('Target draft');
    await expect(input).toBeFocused();
    expect(await input.evaluate(node => {
      const element = node as HTMLInputElement;
      return [element.selectionStart, element.selectionEnd];
    })).toEqual([1, 8]);
    expect(await page.getByRole('form', { name: 'Target consumer form', exact: true })
      .evaluate(node => new FormData(node as HTMLFormElement).getAll('normal'))).toEqual(['Target draft']);
    await expect(normal.getByLabel('Target changes normal', { exact: true })).toHaveText('[true]');
    await expect(normal.getByLabel('Target ref normal', { exact: true })).toHaveText('mounted');
    await expect(normal.getByLabel('Target anchors normal', { exact: true }))
      .toHaveText(/"#b-1"\]$/);
  });

test('Affix detaches the previous inherited target and measures only after the current target event',
  async ({ page }) => {
    await page.goto('/?fixture=target-container');
    const normal = page.locator('[data-target-consumer="normal"] .target-affix > div').last();
    await expect(normal).toHaveCSS('top', '507px');
    await page.getByRole('button', { name: 'Use target B', exact: true }).dispatchEvent('click');
    await expect(normal).toHaveCSS('top', '807px');
    await page.evaluate(async () => {
      document.getElementById('target-b')!.style.top = '820px';
      const previous = document.getElementById('target-a')!;
      previous.scrollTop = 180;
      previous.dispatchEvent(new Event('scroll'));
      await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() =>
        resolve())));
    });

    await expect(normal).toHaveCSS('top', '807px');
    await page.locator('#target-b').evaluate(node => {
      node.scrollTop = 10;
      node.dispatchEvent(new Event('scroll'));
    });

    await expect(normal).toHaveCSS('top', '827px');
  });

test('Anchor scrolls the inherited container and releases consumers after switching to window',
  async ({ page }) => {
    await page.goto('/?fixture=target-container');
    const normal = page.locator('[data-target-consumer="normal"]');
    const active = normal.locator('.ant-anchor-link-title-active');
    await normal.getByRole('link', { name: 'Two', exact: true }).click();

    await expect(active).toHaveAttribute('href', '#a-2');
    await expect.poll(() => page.locator('#target-a').evaluate(node => node.scrollTop)).toBe(160);
    expect(await page.locator('#target-b').evaluate(node => node.scrollTop)).toBe(0);
    await page.getByRole('button', { name: 'Use window target', exact: true }).dispatchEvent('click');

    await expect(normal.getByRole('link', { name: 'One', exact: true })).toHaveAttribute('href', '#window-1');
    const content = normal.locator('.target-affix > div').last();
    await expect(content).toHaveCSS('position', 'static');
    const previous = await content.elementHandle();
    await page.getByLabel('Mount target consumers', { exact: true }).dispatchEvent('click');
    await page.evaluate(async () => {
      for (const name of ['a', 'b']) document.getElementById(`target-${name}`)!
        .dispatchEvent(new Event('scroll'));
      window.scrollTo(0, 200);
      await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() =>
        resolve())));
    });

    expect(await previous!.evaluate(node => node.isConnected)).toBe(false);
    await expect(normal).toHaveCount(0);
    await expect(page.locator('[data-target-consumer="outside"] .target-affix .ant-affix'))
      .toHaveCount(1);
  });
