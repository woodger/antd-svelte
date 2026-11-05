import { test, expect } from './test';
import { snapshotPopoverLifecycle } from './popover-lifecycle-metrics';
import type { PopoverLifecycleCase } from './fixtures/popover-lifecycle.types';
import reference from './fixtures/ant-design-popover-lifecycle-reference.json' with { type: 'json' };

test.use({ viewport: reference.reference.viewport, reducedMotion: 'reduce' });
const cases = reference.cases as readonly PopoverLifecycleCase[];

for (const source of [false, true]) {
  for (const sample of cases) {
    test(`Popover follows pinned ${sample.name} in ${source ? 'source' : 'native'} theme`,
      async ({ page }) => {
        await page.goto('/?fixture=popover-lifecycle');
        await page.getByLabel('Source lifecycle theme', { exact: true }).setChecked(source);
        await page.getByLabel('Popover lifecycle case', { exact: true }).selectOption(sample.name);
        await page.clock.install();
        const popup = page.locator('[data-ant-popover]');
        const original = await popup.elementHandle();
        let generatedId: string | undefined;

        for (const [index, frame] of sample.frames.entries()) {
          if (index) await page.getByRole('button', { name: 'Next lifecycle step', exact: true })
            .evaluate(node => (node as HTMLButtonElement).click());
          if (frame.action.kind === 'widget') {
            await page.getByLabel('Lifecycle draft', { exact: true }).evaluate((node, value) => {
              (node as HTMLInputElement).value = value;
            }, frame.action.value);
            await page.getByLabel('Lifecycle count', { exact: true })
              .evaluate(node => (node as HTMLButtonElement).click());
          }
          await page.clock.runFor(100);
          const expected = frame.snapshot;

          if (expected.visible) await expect(popup).toBeVisible();
          else await expect(popup).toBeHidden();
          if (expected.contentMounted) {
            const expectedId = expected.id === '<generated>'
              ? generatedId ??= (await popup.getAttribute('id'))! : expected.id;
            if (expected.id === '<generated>') expect(expectedId).toMatch(/^ant-popover-/);
            const nativeTokenBoundary = !source && frame.props.tokenZIndex !== undefined
              && frame.props.zIndex == null;
            const buttons = expected.buttons.map(button => ({
              ...button,
              // Native disabled блокирует также принудительно смонтированные кнопки.
              disabled: Boolean(frame.props.disabled || button.disabled)
            }));

            await expect.poll(() => page.evaluate(snapshotPopoverLifecycle, sample.mode)).toEqual({
              visible: expected.visible,
              id: expectedId,
              zIndex: nativeTokenBoundary ? sample.mode === 'popconfirm' ? '1060' : '1030'
                : expected.zIndex,
              inlineZIndex: expected.inlineZIndex,
              container: expected.container,
              body: expected.body,
              heading: expected.heading,
              buttons,
              icon: expected.icon,
              widget: expected.widget,
              portal: expected.portal
            });
          } else if (frame.props.destroyOnHidden
            || sample.mode === 'avatar' && frame.props.destroyOnHidden !== false) {
            await expect(popup.locator('[data-ant-popover-container]')).toBeEmpty();
          }
          await expect(page.getByLabel('Lifecycle events', { exact: true })).toHaveText('[]');
          await expect.poll(async () => Number(await page
            .getByLabel('Lifecycle getter calls', { exact: true }).textContent()) > 0)
            .toBe(expected.getterUsed);
          const id = (await popup.getAttribute('id'))!;
          const trigger = page.locator('[data-lifecycle-trigger]');
          const tokens = [...new Set(['existing-controls', ...id.split(/\s+/).filter(Boolean)])];
          await expect(trigger).toHaveAttribute('aria-controls', tokens.join(' '));
          await expect(trigger).toHaveAttribute('aria-expanded', String(expected.visible));
          expect(await popup.evaluate((node, before) => node === before, original)).toBe(true);
        }
      });
  }

  for (const mode of ['popover', 'popconfirm', 'avatar']) {
    test(`${mode} preserves focus and drafts while IDs and force rendering change in ${source ? 'source' : 'native'} theme`,
      async ({ page }) => {
        await page.goto('/?fixture=popover-lifecycle');
        await page.getByLabel('Source lifecycle theme', { exact: true }).setChecked(source);
        await page.getByLabel('Popover lifecycle case', { exact: true })
          .selectOption(`${mode}-state-force-true-destroy-true`);
        const next = page.getByRole('button', { name: 'Next lifecycle step', exact: true });
        for (let index = 0; index < 3; index++) {
          await next.evaluate(node => (node as HTMLButtonElement).click());
        }
        const popup = page.locator('[data-ant-popover]');
        const original = await popup.elementHandle();
        const draft = page.getByLabel('Lifecycle draft', { exact: true });
        await draft.fill('Kept lifecycle draft');
        await page.getByLabel('Lifecycle count', { exact: true })
          .evaluate(node => (node as HTMLButtonElement).click());
        await draft.evaluate((node: HTMLInputElement) => node.setSelectionRange(1, 6));
        const input = await draft.elementHandle();
        await page.getByLabel('Change lifecycle ID and layer', { exact: true }).dispatchEvent('click');

        await expect(popup).toHaveAttribute('id', 'state-changed-panel');
        await expect(popup).toHaveCSS('z-index', '1600');
        await expect(draft).toBeFocused();
        expect(await draft.evaluate((node: HTMLInputElement) => [
          node.selectionStart, node.selectionEnd
        ])).toEqual([1, 6]);
        expect(await draft.evaluate((node, old) => node === old, input)).toBe(true);
        await next.evaluate(node => (node as HTMLButtonElement).click());

        await expect(popup).toBeHidden();
        await expect(draft).toHaveValue('Kept lifecycle draft');
        await expect(page.locator('[data-lifecycle-trigger]')).toBeFocused();
        await next.evaluate(node => (node as HTMLButtonElement).click());

        await expect(draft).toHaveCount(0);
        await next.evaluate(node => (node as HTMLButtonElement).click());

        await expect(popup).toBeHidden();
        await expect(draft).toHaveValue('Draft');
        await expect(page.getByLabel('Lifecycle count', { exact: true })).toHaveText('0');
        expect(await popup.evaluate((node, old) => node === old, original)).toBe(true);
        await expect(page.getByLabel('Lifecycle events', { exact: true })).toHaveText('[]');
      });

    test(`${mode} retains caller controls tokens across ID changes and unmount in ${source ? 'source' : 'native'} theme`,
      async ({ page }) => {
        await page.goto('/?fixture=popover-lifecycle');
        await page.getByLabel('Source lifecycle theme', { exact: true }).setChecked(source);
        await page.getByLabel('Popover lifecycle case', { exact: true })
          .selectOption(`${mode}-custom-id`);
        const trigger = page.locator('[data-lifecycle-trigger]');
        const original = await trigger.elementHandle();
        await trigger.focus();
        await page.getByLabel('Existing controls ID', { exact: true }).dispatchEvent('click');

        await expect(page.locator('[data-ant-popover]')).toHaveAttribute('id', 'existing-controls');
        await expect(trigger).toHaveAttribute('aria-controls', 'existing-controls');
        await page.getByLabel('Existing controls ID', { exact: true }).dispatchEvent('click');

        await expect(trigger).toHaveAttribute('aria-controls', 'existing-controls first-tooltip-id');
        await expect(trigger).toBeFocused();
        await page.getByLabel('Mount lifecycle popup', { exact: true }).dispatchEvent('click');

        await expect(page.locator('[data-ant-popover]')).toHaveCount(0);
        await expect(page.locator('#popover-lifecycle-container')).toBeEmpty();
        expect(await original!.evaluate(node => node.getAttribute('aria-controls')))
          .toBe('existing-controls');
      });

    test(`${mode} keeps opaque Snippet captures reactive when hidden in ${source ? 'source' : 'native'} theme`,
      async ({ page }) => {
        await page.goto('/?fixture=popover-lifecycle');
        await page.getByLabel('Source lifecycle theme', { exact: true }).setChecked(source);
        await page.getByLabel('Popover lifecycle case', { exact: true })
          .selectOption(`${mode}-fresh-content-styles`);
        await page.getByLabel('Use captured Snippet', { exact: true }).dispatchEvent('click');
        const payload = page.locator('[data-captured-content]');
        await expect(payload).toHaveText('Initial content');
        const draft = await page.getByLabel('Lifecycle draft', { exact: true }).elementHandle();
        const next = page.getByRole('button', { name: 'Next lifecycle step', exact: true });
        await next.evaluate(node => (node as HTMLButtonElement).click());
        await next.evaluate(node => (node as HTMLButtonElement).click());

        await expect(page.locator('[data-ant-popover]')).toBeHidden();
        await expect(payload).toHaveText('Hidden content');
        await expect(page.locator(mode === 'popconfirm' ? '.ant-popconfirm-title' : '.ant-popover-title'))
          .toHaveText('Initial heading');
        expect(await page.getByLabel('Lifecycle draft', { exact: true })
          .evaluate((node, before) => node === before, draft)).toBe(true);
      });
  }

  test(`Popconfirm keeps its pending session across ID and layer updates in ${source ? 'source' : 'native'} theme`,
    async ({ page }) => {
      await page.goto('/?fixture=popover-lifecycle');
      await page.getByLabel('Source lifecycle theme', { exact: true }).setChecked(source);
      await page.getByLabel('Popover lifecycle case', { exact: true })
        .selectOption('popconfirm-state-force-true-destroy-true');
      const next = page.getByRole('button', { name: 'Next lifecycle step', exact: true });
      for (let index = 0; index < 3; index++) {
        await next.evaluate(node => (node as HTMLButtonElement).click());
      }
      const popup = page.locator('[data-ant-popover]');
      const draft = page.getByLabel('Lifecycle draft', { exact: true });
      await draft.fill('Pending lifecycle draft');
      const original = await draft.elementHandle();
      await popup.getByRole('button', { name: 'OK', exact: true })
        .evaluate(node => (node as HTMLButtonElement).click());
      const focusTarget = popup.locator('[data-ant-popconfirm-content]');

      await expect(focusTarget).toBeFocused();
      await expect(popup.getByRole('button', { name: 'OK', exact: true })).toBeDisabled();
      await page.getByLabel('Change lifecycle ID and layer', { exact: true }).dispatchEvent('click');

      await expect(popup).toHaveAttribute('id', 'state-changed-panel');
      await expect(popup).toHaveCSS('z-index', '1600');
      await expect(popup.getByRole('button', { name: 'OK', exact: true })).toBeDisabled();
      await expect(popup.getByRole('button', { name: 'Cancel', exact: true })).toBeDisabled();
      await expect(focusTarget).toBeFocused();
      await expect(draft).toHaveValue('Pending lifecycle draft');
      expect(await draft.evaluate((node, before) => node === before, original)).toBe(true);
      await expect(page.getByLabel('Lifecycle confirmation calls', { exact: true })).toHaveText('1');
      await expect(page.getByLabel('Lifecycle events', { exact: true })).toHaveText('[]');
      await page.getByRole('button', { name: 'Resolve lifecycle confirmation', exact: true })
        .evaluate(node => (node as HTMLButtonElement).click());

      await expect(page.getByLabel('Lifecycle events', { exact: true })).toHaveText('[false]');
      await expect(popup).toBeVisible();
      await expect(popup.getByRole('button', { name: 'OK', exact: true })).toBeEnabled();
      await next.evaluate(node => (node as HTMLButtonElement).click());

      await expect(popup).toBeHidden();
      await expect(page.locator('[data-lifecycle-trigger]')).toBeFocused();
    });
}
