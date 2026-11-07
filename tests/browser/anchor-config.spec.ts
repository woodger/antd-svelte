import { test, expect } from './test';
import reference from './fixtures/ant-design-anchor-config-reference.json' with { type: 'json' };
import { snapshotAnchorConfiguration } from './anchor-config-metrics';

test.use({ viewport: reference.reference.viewport });

for (const sample of reference.cases) {
  test(`Anchor config matches source slots and indicator geometry for ${sample.name}`,
    async ({ page }) => {
      await page.goto('/?fixture=anchor-config');
      await page.getByRole('combobox', { name: 'Anchor config preset', exact: true })
        .selectOption(sample.name);
      await page.mouse.move(1300, 1100);

      await expect.poll(() => page.evaluate(snapshotAnchorConfiguration)).toEqual(sample.expected);
    });
}

test('Anchor indicator follows a mutated provider class without remounting its focused link',
  async ({ page }) => {
    await page.goto('/?fixture=anchor-config');
    await page.getByRole('button', { name: 'Use Anchor class configuration', exact: true }).click();
    const root = page.locator('.anchor-config-main .ant-anchor-wrapper');
    const link = root.getByRole('link', { name: 'Second', exact: true });
    await expect(link).toHaveClass(/-title-active/);
    await link.focus();
    const previous = await link.elementHandle();
    await page.getByRole('button', { name: 'Expand Anchor class layout', exact: true })
      .dispatchEvent('click');

    await expect(root).toHaveClass(/context-anchor-layout/);
    await expect(link).toHaveCSS('padding-top', '18px');
    await expect.poll(() => root.evaluate(node => {
      const title = node.querySelector<HTMLElement>('.ant-anchor-link-title-active')!;
      const ink = node.querySelector<HTMLElement>('.ant-anchor-ink')!;
      return [ink.style.top === `${title.offsetTop + title.clientHeight / 2}px`, ink.style.height];
    })).toEqual([true, '58px']);
    expect(await link.evaluate((node, old) => node === old, previous)).toBe(true);
    await expect(link).toBeFocused();
  });

for (const preset of ['context-functions', 'functions-horizontal']) {
  test(`Anchor style updates retain measured indicator, native links and focus for ${preset}`,
    async ({ page }) => {
      await page.goto('/?fixture=anchor-config');
      await page.getByRole('combobox', { name: 'Anchor config preset', exact: true })
        .selectOption(preset);
      const root = page.locator('.anchor-config-main .ant-anchor-wrapper');
      const link = root.getByRole('link', { name: 'Second', exact: true });
      const indicator = root.locator('.ant-anchor-ink');
      await expect(link).toHaveClass(/-title-active/);
      await link.focus();
      await link.press('Enter');
      const previousRoot = await root.elementHandle();
      const previousLink = await link.elementHandle();
      const previousInk = await indicator.elementHandle();
      const changes = await page.getByLabel('Configured Anchor changes', { exact: true }).textContent();
      await page.getByRole('button', { name: 'Update Anchor layout styles', exact: true })
        .dispatchEvent('click');

      await expect(root).toHaveCSS('opacity', '0.6');
      await expect(link).toHaveCSS('padding-top', '20px');
      await expect.poll(() => root.evaluate(node => {
        const title = node.querySelector<HTMLElement>('.ant-anchor-link-title-active')!;
        const ink = node.querySelector<HTMLElement>('.ant-anchor-ink')!;
        const horizontal = node.classList.contains('ant-anchor-wrapper-horizontal');
        return horizontal
          ? [ink.style.left === `${title.offsetLeft}px`, ink.style.width === `${title.clientWidth}px`]
          : [ink.style.top === `${title.offsetTop + title.clientHeight / 2}px`,
            ink.style.height === `${title.clientHeight}px`];
      })).toEqual([true, true]);
      const geometry = await indicator.getAttribute('style');
      await page.getByRole('button', { name: 'Recolor Anchor indicator', exact: true })
        .dispatchEvent('click');

      await expect(indicator).toHaveCSS('background-color', 'rgb(212, 56, 13)');
      await expect.poll(() => indicator.evaluate((node, original) => {
        const previous = document.createElement('span');
        previous.setAttribute('style', original!);
        return (['top', 'height', 'left', 'width'] as const).every(key =>
          (node as HTMLElement).style[key] === previous.style[key]);
      }, geometry)).toBe(true);
      await page.getByRole('button', { name: 'Update local Anchor styles', exact: true })
        .dispatchEvent('click');

      await expect(link).toHaveCSS('padding-top', '12px');
      await expect.poll(() => root.evaluate(node => {
        const title = node.querySelector<HTMLElement>('.ant-anchor-link-title-active')!;
        const ink = node.querySelector<HTMLElement>('.ant-anchor-ink')!;
        return node.classList.contains('ant-anchor-wrapper-horizontal')
          ? ink.style.width === `${title.clientWidth}px`
          : ink.style.height === `${title.clientHeight}px`;
      })).toBe(true);
      expect(await root.evaluate((node, old) => node === old, previousRoot)).toBe(true);
      expect(await link.evaluate((node, old) => node === old, previousLink)).toBe(true);
      expect(await indicator.evaluate((node, old) => node === old, previousInk)).toBe(true);
      await expect(link).toBeFocused();
      await expect(page).toHaveURL(/#anchor-config-two$/);
      await expect(page.getByLabel('Configured Anchor clicks', { exact: true })).toHaveText('1');
      await expect(page.getByLabel('Configured Anchor changes', { exact: true })).toHaveText(changes!);
      await expect(page.locator('.outside-anchor-config')).toHaveCSS('opacity', '1');
      await expect(page.locator('.outside-anchor-config')).not.toHaveClass(/context-|local-/);
      await root.getByRole('link', { name: 'First', exact: true }).focus();
      await root.getByRole('link', { name: 'First', exact: true }).press('Enter');

      await expect(page).toHaveURL(/#anchor-config-one$/);
      await expect(page.getByLabel('Configured Anchor clicks', { exact: true })).toHaveText('2');
      await expect(page.getByLabel('Configured Anchor changes', { exact: true }))
        .toHaveText(JSON.stringify([...JSON.parse(changes!), '#anchor-config-one']));
      await expect(link).toHaveClass(/-title-active/);
    });
}
