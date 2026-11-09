import { test, expect } from './test';
import reference from './fixtures/ant-design-upload-prefix-reference.json' with { type: 'json' };
import { snapshotUploadPrefix } from './upload-prefix-metrics';

test.use({ viewport: reference.reference.viewport });

for (const entry of reference.cases) {
  for (const scope of ['normal', 'nested', 'sibling'] as const) {
    test(`Upload prefixes match Source ${entry.sample.id}/${scope}`, async ({ page }) => {
      await page.goto('/?fixture=upload-prefix');
      await page.getByRole('combobox', { name: 'Upload prefix sample', exact: true })
        .selectOption(entry.sample.id);
      await page.getByRole('combobox', { name: 'Upload prefix scope', exact: true }).selectOption(scope);
      await page.mouse.move(1270, 890);

      await expect.poll(() => page.evaluate(snapshotUploadPrefix)).toEqual(entry.result[scope]);
    });
  }
}

test('Upload prefixes retain wrapper, file input, focused filename and native refs', async ({ page }) => {
  await page.goto('/?fixture=upload-prefix');
  await page.getByRole('checkbox', { name: 'Live Upload prefix', exact: true }).check();
  const root = page.locator('.fixture-upload-prefix');
  const input = root.locator('input[type=file]');
  const filename = root.getByRole('link', { name: 'note.txt', exact: true });
  await filename.focus();
  const oldRoot = await root.elementHandle();
  const oldInput = await input.elementHandle();
  const oldLink = await filename.elementHandle();

  for (const step of reference.transitions) {
    await page.getByRole('textbox', { name: 'Live Upload prefix value', exact: true })
      .evaluate((node: HTMLInputElement, value) => {
        node.value = value;
        node.dispatchEvent(new Event('input', { bubbles: true }));
      }, step.prefix);

    await expect.poll(() => page.evaluate(snapshotUploadPrefix)).toEqual(step.result);
    expect(await root.evaluate((node, old) => node === old, oldRoot)).toBe(step.sameRoot);
    expect(await input.evaluate((node, old) => node === old, oldInput)).toBe(step.sameInput);
    expect(await filename.evaluate((node, old) => node === old, oldLink)).toBe(step.sameLink);
    await expect(filename).toBeFocused();
    await expect(page.getByLabel('Upload prefix refs', { exact: true })).toHaveText('connected');
    await expect(page.getByLabel('Upload prefix events', { exact: true })).toHaveText('');
  }
});

test('Upload local prefixes keep an active request and publish completion/removal once', async ({ page }) => {
  await page.goto('/?fixture=upload-prefix');
  await page.getByRole('checkbox', { name: 'Live Upload prefix', exact: true }).check();
  const root = page.locator('.fixture-upload-prefix');
  const input = root.locator('input[type=file]');
  await input.setInputFiles({ name: 'draft.txt', mimeType: 'text/plain', buffer: Buffer.from('Draft') });
  const oldInput = await input.elementHandle();
  const filename = root.getByRole('link', { name: 'note.txt', exact: true });
  await filename.focus();
  const oldFilename = await root.getByText('draft.txt', { exact: true }).elementHandle();
  await expect(page.getByLabel('Upload prefix events', { exact: true }))
    .toHaveText('change:draft.txt:uploading|request:draft.txt');
  await page.getByRole('textbox', { name: 'Local Upload prefix value', exact: true })
    .evaluate((node: HTMLInputElement) => {
      node.value = 'files';
      node.dispatchEvent(new Event('input', { bubbles: true }));
    });

  await expect(root).toHaveClass(/\bfiles-wrapper\b/);
  expect(await input.evaluate((node, old) => node === old, oldInput)).toBe(true);
  expect(await root.getByText('draft.txt', { exact: true }).evaluate((node, old) => node === old, oldFilename))
    .toBe(true);
  await expect(filename).toBeFocused();
  await expect(page.getByLabel('Upload prefix events', { exact: true }))
    .toHaveText('change:draft.txt:uploading|request:draft.txt');
  await page.getByRole('button', { name: 'Complete prefix Upload', exact: true }).click();

  await expect(root.locator('.files-list-item-done')).toHaveCount(2);
  await expect(page.getByLabel('Upload prefix events', { exact: true }))
    .toHaveText('change:draft.txt:uploading|request:draft.txt|change:draft.txt:done');
  await root.locator('[data-ant-upload-item-container]').filter({ hasText: 'draft.txt' })
    .getByRole('button', { name: 'Remove file', exact: true }).click();

  await expect(root.getByText('draft.txt', { exact: true })).toHaveCount(0);
  await expect(page.getByLabel('Upload prefix events', { exact: true }))
    .toHaveText('change:draft.txt:uploading|request:draft.txt|change:draft.txt:done|remove:draft.txt|change:draft.txt:removed');
});
