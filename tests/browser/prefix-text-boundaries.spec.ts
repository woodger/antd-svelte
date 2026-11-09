import { test, expect } from './test';

test('Prefix styles do not insert text beside controls or alter user text during live updates', async ({
  page
}) => {
  await page.goto('/?fixture=prefix-text-boundaries');
  const password = page.getByLabel('Boundary password', { exact: true });
  await password.fill('retained password');
  await password.evaluate((node: HTMLInputElement) => { node.setSelectionRange(2, 7); });
  const original = await password.elementHandle();
  const initialWidth = await page.locator('[data-text-boundary="buttons"]')
    .evaluate(node => node.getBoundingClientRect().width);

  for (const prefix of ['next', '', 'suite']) {
    await page.getByRole('textbox', { name: 'Text boundary prefix', exact: true })
      .evaluate((node: HTMLInputElement, prefix) => {
        node.value = prefix;
        node.dispatchEvent(new Event('input', { bubbles: true }));
      }, prefix);

    await expect.poll(() => page.locator('[data-text-boundary]').evaluateAll(nodes =>
      nodes.flatMap(node => [...node.childNodes].filter(child =>
        child.nodeType === Node.TEXT_NODE && child.textContent !== ''
      ).map(child => ({ boundary: node.getAttribute('data-text-boundary'), text: child.textContent })))
    )).toEqual([]);
    await expect(page.locator('[data-user-boundary]')).toHaveText('Before A Action Z After');
    expect(await page.locator('[data-user-boundary]').evaluate(node =>
      [...node.childNodes].filter(child => child.nodeType === Node.TEXT_NODE && child.textContent)
        .map(child => child.textContent)
    )).toEqual([' A ', ' Z ']);
    await expect(password).toHaveValue('retained password');
    await expect(password).toBeFocused();
    expect(await password.evaluate((node, old) => node === old, original)).toBe(true);
    expect(await password.evaluate((node: HTMLInputElement) => [
      node.selectionStart, node.selectionEnd
    ])).toEqual([2, 7]);
    expect(await page.locator('[data-text-boundary="buttons"]')
      .evaluate(node => node.getBoundingClientRect().width)).toBe(initialWidth);
  }
});
