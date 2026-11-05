import type { Page } from '@playwright/test';
import { test, expect } from './test';
import reference from './fixtures/ant-design-popover-actions-reference.json' with { type: 'json' };
import type { PopoverActionCase } from './fixtures/popover-actions.types';

const cases = reference.cases as readonly PopoverActionCase[];

async function pauseClock(page: Page) {
  await page.clock.install({ time: new Date('2026-01-01T00:00:00Z') });
  await page.clock.pauseAt(new Date('2026-01-01T00:00:01Z'));
}

async function send(page: Page, event: string) {
  return page.locator('#popover-action-case').evaluate((host, event) => {
    const trigger = host.querySelector<HTMLElement>('#action-trigger,.ant-avatar-group-more')!;
    if (event === 'focus') trigger.focus();
    else if (event === 'blur') trigger.blur();
    else if (event === 'focusOutside') host.querySelector<HTMLElement>('#action-outside')!.focus();
    else if (event === 'popupFocus') {
      document.getElementById('action-popup-input')?.focus();
    } else if (event === 'click') trigger.click();
    else if (event === 'touch') {
      trigger.dispatchEvent(new TouchEvent('touchstart', { bubbles: true, cancelable: true }));
    } else if (event === 'contextMenu') {
      trigger.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true }));
    } else if (event === 'escape') {
      document.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'Escape', bubbles: true, cancelable: true
      }));
    } else if (event === 'confirm' || event === 'cancel') {
      const text = event === 'confirm' ? 'Confirm action' : 'Cancel action';
      [...document.querySelectorAll<HTMLButtonElement>('[data-ant-popconfirm-buttons] button')]
        .find(node => node.textContent?.trim() === text)?.click();
    } else if (event.startsWith('outside')) {
      document.body.dispatchEvent(event === 'outsidePointer'
        ? new PointerEvent('pointerdown', { bubbles: true })
        : new MouseEvent(event === 'outsideContext' ? 'contextmenu' : 'mousedown', { bubbles: true }));
    } else if (event.startsWith('popup')) {
      document.querySelector('[data-ant-popover]')?.dispatchEvent(new PointerEvent(
        event === 'popupEnter' ? 'pointerenter' : 'pointerleave', { pointerType: 'mouse' }
      ));
    } else trigger.parentElement!.dispatchEvent(new PointerEvent(
      event === 'enter' ? 'pointerenter' : 'pointerleave', { pointerType: 'mouse' }
    ));
    return (host as HTMLElement & { actionEvents: readonly boolean[]; }).actionEvents;
  }, event);
}

for (const source of [false, true]) {
  for (const sample of cases) {
    test(`${sample.name} matches source actions in ${source ? 'source' : 'native'} config`,
      async ({ page }) => {
        await page.goto('/?fixture=popover-actions');
        await page.getByLabel('Source Popover actions', { exact: true }).setChecked(source);
        await page.getByLabel('Popover action case', { exact: true }).selectOption(sample.name);
        await pauseClock(page);
        const popup = page.locator('[data-ant-popover]');
        const trigger = page.locator('#action-trigger,.ant-avatar-group-more');
        await page.clock.runFor(300);

        for (const [index, frame] of sample.frames.entries()) {
          if (index) {
            await page.getByRole('button', { name: 'Next action step', exact: true })
              .evaluate(node => (node as HTMLButtonElement).click());
            if (frame.action.kind === 'event') {
              const immediate = await send(page, frame.action.event!);
              // Native blur без relatedTarget ждёт microtask для проверки удаления DOM.
              const expected = frame.action.event === 'blur'
                ? sample.frames[index - 1].snapshot.events : frame.syncEvents;
              expect(immediate).toEqual(expected);
              if (frame.action.event === 'blur') {
                const afterMicrotask = await page.locator('#popover-action-case')
                  .evaluate(node => (node as HTMLElement & {
                    actionEvents: readonly boolean[];
                  }).actionEvents);
                expect(afterMicrotask).toEqual(frame.syncEvents);
              }
            } else if (frame.action.kind === 'advance') await page.clock.runFor(frame.action.ms!);
          }
          await page.clock.runFor(100);

          if (frame.snapshot.visible) await expect(popup).toBeVisible();
          else await expect(popup).toBeHidden();
          await expect(page.getByLabel('Popover action events', { exact: true }))
            .toHaveText(JSON.stringify(frame.snapshot.events));
          await expect(page.getByLabel('Popover action commands', { exact: true }))
            .toHaveText(JSON.stringify(frame.snapshot.commands));
          expect(await trigger.evaluate(node => node.classList.contains('ant-popover-open')))
            .toBe(frame.snapshot.openClass);
        }
      });
  }

  for (const item of reference.cleanup) {
    test(`${item.mode} disposes ${item.pending ? 'pending' : 'visible'} focus in ${source ? 'source' : 'native'} config`,
      async ({ page }) => {
        await page.goto('/?fixture=popover-actions');
        await page.getByLabel('Source Popover actions', { exact: true }).setChecked(source);
        const name = item.pending ? 'focus-delay-without-hide' : 'focus-delays-independent';
        await page.getByLabel('Popover action case', { exact: true })
          .selectOption(`${item.mode}-${name}`);
        await pauseClock(page);
        expect(await send(page, 'focus')).toEqual(item.focused);
        await page.getByLabel('Mount action popup', { exact: true }).evaluate(node => {
          const control = node as HTMLInputElement;
          control.checked = false;
          control.dispatchEvent(new Event('change', { bubbles: true }));
        });
        await page.clock.runFor(1500);

        await expect(page.getByLabel('Popover action events', { exact: true }))
          .toHaveText(JSON.stringify(item.settled));
        await expect(page.locator('[data-ant-popover]')).toHaveCount(item.popupCount);
      });
  }
}
