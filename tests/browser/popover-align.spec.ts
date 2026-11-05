import { test, expect } from './test';
import { snapshotPopoverAlignment } from './popover-align-metrics';
import type { PopoverAlignmentHost } from './fixtures/popover-align.types';
import reference from './fixtures/ant-design-popover-align-reference.json' with { type: 'json' };

test.use({ viewport: reference.reference.viewport });

for (const source of [false, true]) {
  for (const sample of reference.cases) {
    test(`Popover alignment matches pinned ${sample.name} in ${source ? 'source' : 'native'} config`,
      async ({ page }) => {
        await page.goto('/?fixture=popover-align');
        await page.getByLabel('Source alignment config', { exact: true }).evaluate((node, checked) => {
          const control = node as HTMLInputElement;
          control.checked = checked;
          control.dispatchEvent(new Event('change', { bubbles: true }));
        }, source);
        await page.getByLabel('Popover alignment case', { exact: true }).selectOption(sample.name);
        const root = page.locator('#popover-align-case');
        const popup = page.locator('[data-ant-popover]:not([hidden])');
        const expected = ({ calls: _calls, ...snapshot }: typeof sample.initial) => snapshot;

        await expect(popup).toBeVisible();
        await expect.poll(() => page.evaluate(snapshotPopoverAlignment))
          .toEqual(expected(sample.initial));
        await expect(page.getByLabel('Alignment calls', { exact: true }))
          .toHaveText(String(sample.initial.calls));

        if (sample.patch) {
          const input = page.getByLabel('Alignment draft', { exact: true });
          await input.fill('Kept alignment draft');
          await input.evaluate((node: HTMLInputElement) => node.setSelectionRange(2, 7));
          const original = await input.elementHandle();
          await page.getByRole('button', { name: 'Change alignment props', exact: true })
            .evaluate(node => (node as HTMLButtonElement).click());

          await expect.poll(() => page.evaluate(snapshotPopoverAlignment))
            .toEqual(expected(sample.changed!));
          await expect(input).toHaveValue('Kept alignment draft');
          await expect(input).toBeFocused();
          expect(await input.evaluate((node, before) => node === before, original)).toBe(true);
          expect(await input.evaluate((node: HTMLInputElement) => [
            node.selectionStart, node.selectionEnd
          ])).toEqual([2, 7]);
        }

        if (sample.resize) {
          const before = await root.evaluate(node => (node as PopoverAlignmentHost).alignCalls);
          await page.getByRole('button', { name: 'Resize alignment popup', exact: true })
            .evaluate(node => (node as HTMLButtonElement).click());

          await expect.poll(() => page.evaluate(snapshotPopoverAlignment))
            .toEqual(expected(sample.resize!.snapshot));
          await expect.poll(() => root.evaluate(node => (node as PopoverAlignmentHost).alignCalls))
            .toBe(before + sample.resize.delta);
        }
      });
  }
}

for (const mode of ['popover', 'popconfirm', 'avatar']) {
  test(`${mode} cancels alignment work on unmount`, async ({ page }) => {
    await page.goto('/?fixture=popover-align');
    await page.getByLabel('Popover alignment case', { exact: true })
      .selectOption(`${mode}-reactive-align`);
    const root = page.locator('#popover-align-case');
    await expect(page.locator('[data-ant-popover]:not([hidden])')).toBeVisible();
    await expect(page.getByLabel('Alignment calls', { exact: true })).toHaveText('2');
    const total = page.getByLabel('Total alignment calls', { exact: true });
    const before = Number(await total.textContent());
    await page.getByLabel('Mount alignment popup', { exact: true }).uncheck();
    await page.evaluate(async () => {
      window.dispatchEvent(new Event('resize'));
      await new Promise(requestAnimationFrame);
      await new Promise(requestAnimationFrame);
    });

    await expect(root).toHaveCount(0);
    await expect(page.locator('[data-ant-popover]')).toHaveCount(0);
    await expect(total).toHaveText(String(before));

    await page.getByLabel('Mount alignment popup', { exact: true }).check();

    await expect(page.getByLabel('Alignment calls', { exact: true })).toHaveText('2');
    await expect(total).toHaveText(String(before + 2));
    await expect(page.locator('[data-ant-popover]:not([hidden])')).toBeVisible();
  });
}
