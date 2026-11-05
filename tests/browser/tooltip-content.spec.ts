import { test, expect } from './test';
import { contentCases } from './fixtures/tooltip-content-presets';
import reference from './fixtures/ant-design-tooltip-content-reference.json' with { type: 'json' };

for (const source of [false, true]) {
  for (const sample of contentCases) {
    test(`Tooltip renders pinned ${sample.name} content in ${source ? 'source' : 'native'} config`,
      async ({ page }) => {
        await page.goto('/?fixture=tooltip-content');
        await page.getByLabel('Source content config', { exact: true }).setChecked(source);
        await page.getByLabel('Tooltip content case', { exact: true }).selectOption(sample.name);
        const trigger = page.getByRole('button', { name: 'Content trigger', exact: true });
        const popup = page.locator('[data-ant-tooltip]');
        await trigger.click();

        const visible = sample.nativeWhitespaceBoundary ? false : sample.snapshot.visible;
        if (visible) {
          await expect(popup).toBeVisible();
          await expect(popup.locator('[data-ant-tooltip-container]'))
            .toHaveText(sample.snapshot.text ?? '');
          await expect(trigger).toHaveAccessibleDescription(sample.snapshot.text ?? '');
        } else {
          await expect(popup).toBeHidden();
          await expect(trigger).not.toHaveAttribute('aria-describedby');
        }
        await expect(page.getByLabel('Content events', { exact: true }))
          .toHaveText(JSON.stringify(sample.nativeWhitespaceBoundary ? [] : sample.snapshot.events));
        await expect(popup.locator('img, script')).toHaveCount(0);
      });
  }

  for (const sample of reference.caches) {
    test(`Tooltip matches pinned ${sample.name} cache in ${source ? 'source' : 'native'} config`,
      async ({ page }) => {
        await page.goto('/?fixture=tooltip-content');
        await page.getByLabel('Source content config', { exact: true }).setChecked(source);
        await page.getByLabel('Tooltip content mode', { exact: true }).selectOption('cache');
        await page.getByLabel('Tooltip cache case', { exact: true }).selectOption(sample.name);
        const popup = page.locator('[data-ant-tooltip]');
        const content = popup.locator('[data-ant-tooltip-container]');
        const original = await popup.elementHandle();

        for (const [index, frame] of sample.frames.entries()) {
          if (index) {
            // Programmatic props update preserves focus and avoids native outside dismissal.
            await page.getByRole('button', { name: 'Next cache step', exact: true })
              .evaluate(node => (node as HTMLButtonElement).click());
          }
          await expect(page.getByLabel('Cache step', { exact: true })).toHaveText(frame.step);
          if (frame.open) await expect(popup).toBeVisible();
          else await expect(popup).toBeHidden();

          if (frame.step !== 'initial') {
            await expect(content).toHaveText(frame.snapshot.text ?? '');
            if (frame.snapshot.className !== null) {
              await expect(content).toContainClass(frame.snapshot.className);
              await expect(content).toHaveCSS('color', frame.snapshot.color!);
            }
          }
          expect(await popup.evaluate((node, before) => node === before, original)).toBe(true);
          await expect(page.getByLabel('Cache events', { exact: true })).toHaveText('[]');
        }
      });
  }

  test(`Tooltip cache retains Snippet state and defers replacement in ${source ? 'source' : 'native'} config`,
    async ({ page }) => {
      await page.goto('/?fixture=tooltip-content');
      await page.getByLabel('Source content config', { exact: true }).setChecked(source);
      await page.getByLabel('Tooltip content mode', { exact: true }).selectOption('state');
      const popup = page.locator('[data-ant-tooltip]');
      const draft = page.getByLabel('Lifecycle draft', { exact: true });
      await draft.fill('Kept draft');
      await page.getByRole('button', { name: 'Lifecycle count', exact: true }).click();
      const previous = await draft.elementHandle();
      await page.getByLabel('State tooltip open', { exact: true }).evaluate(node => {
        const control = node as HTMLInputElement;
        control.checked = false;
        control.dispatchEvent(new Event('change', { bubbles: true }));
      });
      await expect(popup).toBeHidden();
      await page.getByLabel('Replace tooltip content', { exact: true }).check();
      await expect(popup.locator('input')).toHaveValue('Kept draft');
      await popup.getByRole('button', { name: 'Lifecycle count', exact: true, includeHidden: true })
        .evaluate(node => (node as HTMLButtonElement).click());
      await expect(popup.locator('button')).toHaveText('2');
      expect(await popup.locator('input').evaluate((node, before) => node === before, previous))
        .toBe(true);

      await page.getByLabel('State tooltip fresh', { exact: true }).check();
      await expect(popup.locator('input')).toHaveCount(0);
      await expect(popup.locator('[data-ant-tooltip-container]')).toHaveText('Replacement content');
    });
}

for (const mode of ['single', 'range', 'typography']) {
  for (const fresh of [false, true]) {
    test(`${mode} Tooltip keeps the source fresh=${fresh} content policy`, async ({ page }) => {
      await page.goto('/?fixture=tooltip-content');
      await page.getByLabel('Tooltip content mode', { exact: true }).selectOption('consumers');
      await page.getByLabel('Tooltip content consumer', { exact: true }).selectOption(mode);
      await page.getByLabel('Fresh consumer content', { exact: true }).setChecked(fresh);
      const root = page.locator('.tooltip-content-consumer');
      const anchor = mode === 'single' ? root.getByRole('slider')
        : root.locator(mode === 'typography' ? '.ant-typography' : '.ant-slider-handle').first();
      const popup = root.locator('[data-ant-tooltip]').first();
      await anchor.hover();
      await expect(popup).toBeVisible();
      const content = popup.locator('[data-ant-tooltip-container]');
      await expect(content).toHaveText('A');
      await page.getByRole('button', { name: 'Leave consumer', exact: true }).click();
      await expect(popup).toBeHidden();

      await page.getByRole('button', { name: 'Update consumer title', exact: true }).click();
      await expect(content).toHaveText(fresh ? 'B' : 'A');
      await anchor.hover();
      await expect(popup).toBeVisible();
      await expect(content).toHaveText('B');
    });
  }
}
