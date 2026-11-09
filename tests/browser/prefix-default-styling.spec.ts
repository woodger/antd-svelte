import { test, expect } from './test';
import { snapshotPickerPrefix } from './picker-prefix-metrics';
import { snapshotCalendarPrefix } from './calendar-prefix-metrics';
import { snapshotColorPickerPrefix } from './color-picker-prefix-metrics';

test.use({ viewport: { width: 1280, height: 900 } });

for (const component of ['date', 'range', 'time', 'time-range', 'calendar', 'color-picker']) {
  for (const theme of ['light-blue', 'dark-green', 'compact-purple']) {
    test(`${component} retains canonical ${theme} default styling with a shared prefix`,
      async ({ page }) => {
        await page.clock.setFixedTime(new Date('2024-09-15T03:00:00.000Z'));
        await page.goto('/?fixture=prefix-default-styling');
        await page.getByRole('combobox', { name: 'Default styling component', exact: true })
          .selectOption(component);
        await page.getByRole('combobox', { name: 'Default styling theme', exact: true })
          .selectOption(theme);
        if (!['calendar', 'color-picker'].includes(component)) {
          await page.locator('.fixture-picker-prefix input').first().focus();
        }
        await page.mouse.move(10, 890);
        await page.evaluate(() => Promise.all(document.getAnimations()
          .filter(animation => animation.effect?.getComputedTiming().iterations !== Infinity)
          .map(animation => animation.finished.catch(() => {}))));
        const snapshot = async () => {
          if (component === 'calendar') return page.evaluate(snapshotCalendarPrefix);
          if (component === 'color-picker') return page.evaluate(snapshotColorPickerPrefix);

          return page.evaluate(snapshotPickerPrefix);
        };
        const canonical = await snapshot();

        await page.getByRole('textbox', { name: 'Default styling prefix', exact: true })
          .evaluate((node: HTMLInputElement) => {
            node.value = 'suite';
            node.dispatchEvent(new Event('input', { bubbles: true }));
          });

        await expect.poll(snapshot).toEqual(canonical);
      });
  }
}
