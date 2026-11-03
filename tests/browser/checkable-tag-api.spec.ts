import { test, expect } from './test';
import reference from './fixtures/ant-design-checkable-tag-api-reference.json' with { type: 'json' };
import type { CheckableTagApiCase } from './fixtures/checkable-tag-api-presets';

test.beforeEach(async ({ page }) => {
  await page.goto('/?fixture=checkable-tag-api');
  await expect(page.getByRole('heading', { name: 'CheckableTag callbacks and DOM' })).toBeVisible();
});

for (const sample of reference.cases as CheckableTagApiCase[]) {
  test(`CheckableTag matches source callback order for ${sample.name}`, async ({ page }) => {
    await page.getByRole('combobox', { name: 'CheckableTag reference' }).selectOption(sample.name);
    const tag = page.getByRole('button', { name: 'API tag', exact: true });
    const prevented: boolean[] = [];

    for (const step of sample.steps) {
      prevented.push(await tag.evaluate((node, step) => {
        const event = step.kind === 'click'
          ? new MouseEvent('click', { bubbles: true, cancelable: true })
          : new KeyboardEvent('keydown', {
            bubbles: true,
            cancelable: true,
            key: step.key,
            repeat: step.repeat
          });
        if (step.cancelled) event.preventDefault();
        node.dispatchEvent(event);
        return event.defaultPrevented;
      }, step));
    }

    expect(prevented).toEqual(sample.prevented);
    await expect(page.getByRole('status', { name: 'Checkable API events' }))
      .toHaveText(JSON.stringify(sample.events));
    await expect(page.getByRole('status', { name: 'Checkable API checked' }))
      .toHaveText(String(sample.final.checked));
    await expect(tag).toHaveCount(sample.final.mounted ? 1 : 0);
    if (sample.final.mounted)
      await expect(tag).toHaveAttribute('aria-pressed', String(sample.final.checked));
    else
      await expect(page.getByRole('status', { name: 'Checkable API ref' })).toHaveText('empty');
  });
}

test(
  'CheckableTag gives native callback aliases priority without duplicating change',
  async ({ page }) => {
    await page.getByRole('checkbox', { name: 'Native CheckableTag callbacks' }).check();
    const tag = page.getByRole('button', { name: 'API tag', exact: true });

    await tag.click();
    await tag.press('Space');

    await expect(page.getByRole('status', { name: 'Checkable API events' })).toHaveText(
      JSON.stringify(['change:true', 'onclick:api', 'onkeydown: :false', 'change:true'])
    );
    await expect(tag).toHaveAttribute('aria-pressed', 'false');
  }
);

test(
  'CheckableTag preserves cancellation of an already prevented native click',
  async ({ page }) => {
    const tag = page.getByRole('button', { name: 'API tag', exact: true });

    await tag.evaluate(node => {
      const event = new MouseEvent('click', { bubbles: true, cancelable: true });
      event.preventDefault();
      node.dispatchEvent(event);
    });

    await expect(tag).toHaveAttribute('aria-pressed', 'false');
    await expect(page.getByRole('status', { name: 'Checkable API events' })).toHaveText('[]');
  }
);

test(
  'CheckableTag keeps its element ref focus and attributes across owner updates',
  async ({ page }) => {
    const tag = page.getByRole('button', { name: 'API tag', exact: true });
    const original = await tag.elementHandle();

    await expect(tag).toHaveAttribute('title', 'API <tag>');
    await expect(tag).toHaveAttribute('data-checkable-root', 'api');
    await expect(tag).toHaveAttribute('type', 'button');
    await expect(tag).toHaveClass(/api-checkable/);
    await expect(tag).toHaveCSS('letter-spacing', '1px');
    await expect(page.getByRole('status', { name: 'Checkable API ref' })).toHaveText('button');
    await page.getByRole('button', { name: 'Set API checked', exact: true }).click();
    await page.getByRole('button', { name: 'Focus API tag', exact: true }).click();

    await expect(tag).toBeFocused();
    await expect(tag).toHaveAttribute('aria-pressed', 'true');
    expect(await tag.evaluate((node, original) => node === original, original)).toBe(true);
    await expect(page.getByRole('status', { name: 'Checkable API events' })).toHaveText('[]');

    await tag.press('Enter');

    await expect(page.getByRole('status', { name: 'Checkable API events' })).toHaveText(
      JSON.stringify(['key:Enter:false', 'change:false', 'click:api'])
    );
  }
);

test(
  'CheckableTag inherits disabled and direction while honoring explicit local direction',
  async ({ page }) => {
    const tag = page.getByRole('button', { name: 'API tag', exact: true });
    await page.getByRole('checkbox', { name: 'Right to left', exact: true }).check();

    await expect(tag).toHaveAttribute('dir', 'rtl');

    await page.getByRole('checkbox', { name: 'Right to left', exact: true }).uncheck();
    await page.getByRole('checkbox', { name: 'Local CheckableTag RTL', exact: true }).check();
    await page.getByRole('checkbox', { name: 'Disable all components', exact: true }).check();

    await expect(tag).toHaveAttribute('dir', 'rtl');
    await expect(tag).toBeDisabled();

    await page.getByRole('combobox', { name: 'CheckableTag reference' })
      .selectOption('controlled-clicks');
    await tag.evaluate(node => (node as HTMLButtonElement).click());

    await expect(page.getByRole('status', { name: 'Checkable API events' })).toHaveText('[]');
  }
);

test(
  'CheckableTag releases its ref and restores focus when the owner removes the button',
  async ({ page }) => {
    const tag = page.getByRole('button', { name: 'API tag', exact: true });
    await page.getByRole('combobox', { name: 'CheckableTag reference' })
      .selectOption('change-unmount');
    await tag.click();

    await expect(tag).toHaveCount(0);
    await expect(page.getByRole('status', { name: 'Checkable API ref' })).toHaveText('empty');
    await expect(page.getByRole('button', { name: 'After API tag', exact: true })).toBeFocused();

    await page.getByRole('button', { name: 'Toggle API mount', exact: true }).click();
    await page.getByRole('button', { name: 'Focus API tag', exact: true }).click();

    await expect(tag).toBeFocused();
    await expect(page.getByRole('status', { name: 'Checkable API ref' })).toHaveText('button');
  }
);
