import { test, expect } from './test';

test.beforeEach(async ({ page }) => {
  await page.goto('/?fixture=theme-tokens');
  await expect(page.getByRole('heading', { name: 'Source design tokens', exact: true }))
    .toBeVisible();
});

test(
  'theme calculates light defaults through the public package in a browser',
  async ({ page }) => {
    await expect(page.getByLabel('Token primary result', { exact: true })).toHaveText('#1677ff');
    await expect(page.getByLabel('Token font result', { exact: true })).toHaveText('14');
    await expect(page.getByLabel('Token height result', { exact: true })).toHaveText('32');
    await expect(page.getByTestId('token-preview')).toHaveCSS('background-color', 'rgb(255, 255, 255)');

    const full = JSON.parse(await page.getByLabel('Full design tokens', { exact: true }).innerText());

    expect(Object.keys(full)).toHaveLength(536);
    expect(full.blue1).toBe('#e6f4ff');
    expect(full['blue-1']).toBe('#e6f4ff');
  }
);

test(
  'theme dark compact composition updates source colors and density together',
  async ({ page }) => {
    await page.getByLabel('Token algorithm', { exact: true }).selectOption('dark-compact');

    await expect(page.getByLabel('Token primary result', { exact: true })).toHaveText('#1668dc');
    await expect(page.getByLabel('Token font result', { exact: true })).toHaveText('12');
    await expect(page.getByLabel('Token height result', { exact: true })).toHaveText('28');
    await expect(page.getByTestId('token-preview')).toHaveCSS('background-color', 'rgb(20, 20, 20)');
    await expect(page.getByTestId('token-preview')).toHaveCSS('font-size', '12px');
  }
);

test(
  'theme custom primary uses the same source seed across algorithm changes',
  async ({ page }) => {
    await page.getByLabel('Token primary', { exact: true }).fill('#189cff');

    await expect(page.getByLabel('Token primary result', { exact: true })).toHaveText('#189cff');

    await page.getByLabel('Token algorithm', { exact: true }).selectOption('compact');

    await expect(page.getByLabel('Token primary result', { exact: true })).toHaveText('#189cff');
    await expect(page.getByLabel('Token font result', { exact: true })).toHaveText('12');
  }
);

test(
  'theme source motion and focus tokens are independent switches',
  async ({ page }) => {
    await page.getByLabel('Token motion', { exact: true }).uncheck();

    await expect(page.getByLabel('Token duration result', { exact: true })).toHaveText('0s');
    await expect(page.getByLabel('Token focus result', { exact: true })).toHaveText('3');

    await page.getByLabel('Token focus outline', { exact: true }).uncheck();

    await expect(page.getByLabel('Token focus result', { exact: true })).toHaveText('0');

    await page.getByLabel('Token motion', { exact: true }).check();

    await expect(page.getByLabel('Token duration result', { exact: true })).toHaveText('0.3s');
    await expect(page.getByLabel('Token focus result', { exact: true })).toHaveText('0');
  }
);

test(
  'theme keeps the source raw font size and derives its paired metrics',
  async ({ page }) => {
    await page.getByLabel('Token font size', { exact: true }).fill('15');

    await expect(page.getByLabel('Token font result', { exact: true })).toHaveText('15');
    await expect(page.getByTestId('token-preview')).toHaveCSS('font-size', '15px');

    const full = JSON.parse(await page.getByLabel('Full design tokens', { exact: true }).innerText());

    expect(full.fontHeight).toBe(23);
    expect(full.lineHeight).toBe(23 / 15);
    expect(full.fontSizeSM).toBe(12);
  }
);
