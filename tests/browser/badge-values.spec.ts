import type { Page } from '@playwright/test';
import { test, expect } from './test';
import { snapshotBadgeApi as snapshot } from './badge-api-metrics';
import reference from './fixtures/ant-design-badge-values-reference.json' with { type: 'json' };

test.use({ viewport: { width: 1200, height: 1000 } });
test.beforeEach(async ({ page }) => {
  await page.goto('/?fixture=badge-values');
});

async function select(page: Page, name: string) {
  await page.getByLabel('Badge values reference', { exact: true }).selectOption(name);
  await page.evaluate(async () => {
    await document.fonts.ready;
    for (let index = 0; index < 5; index++) await new Promise(requestAnimationFrame);
  });
}

for (const sample of reference.cases) {
  test(`Badge scalar values match upstream for ${sample.name}`, async ({ page }) => {
    await select(page, sample.name);

    expect(await snapshot(page, true)).toEqual(sample.snapshot);

    if ('changed' in sample) {
      await page.getByRole('button', { name: 'Change badge value props', exact: true }).click();

      expect(await snapshot(page, true)).toEqual(sample.changed);

      await page.getByRole('button', { name: 'Change badge value props', exact: true }).click();

      expect(await snapshot(page, true)).toEqual(sample.restored);
    }
  });
}
