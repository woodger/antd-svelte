import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createMessage, messageHolderKey } from './message.model.svelte.js';
import {
  createNotification,
  notificationHolderKey,
  notificationOptionsKey
} from './notification.model.svelte.js';
import type { NoticeClock } from './notice-queue.model.svelte.js';

const clock: NoticeClock = {
  now: () => Date.now(),
  schedule(callback, milliseconds) {
    const timer = setTimeout(callback, milliseconds);
    return () => clearTimeout(timer);
  }
};

beforeEach(() => { vi.useFakeTimers(); });
afterEach(() => { vi.useRealTimers(); });

describe('Notice defaults for reactive App configuration', () => {
  it('applies duration changes to new messages without resetting an existing deadline', () => {
    const message = createMessage({ duration: 3 });
    const runtime = message[messageHolderKey];
    runtime.connect(clock);
    runtime.setVisible(true);
    message.info('Existing');
    runtime.mounted(runtime.notices[0].id);
    vi.advanceTimersByTime(1000);
    runtime.configure({ duration: 5 });
    message.info('New');
    runtime.mounted(runtime.notices[1].id);
    vi.advanceTimersByTime(2000);

    expect(runtime.notices.map(notice => notice.closing)).toEqual([true, false]);
    vi.advanceTimersByTime(3000);

    expect(runtime.notices.map(notice => notice.closing)).toEqual([true, true]);
  });

  it('keeps queued messages until the next insertion enforces an updated maxCount', () => {
    const message = createMessage({ duration: 0 });
    const runtime = message[messageHolderKey];
    runtime.connect(clock);
    message.info('First');
    message.info('Second');
    for (const notice of runtime.notices) runtime.mounted(notice.id);
    runtime.configure({ duration: 0, maxCount: 1 });

    expect(runtime.notices.map(notice => notice.closing)).toEqual([false, false]);
    message.info('Third');

    expect(runtime.notices.map(notice => [notice.content, notice.closing])).toEqual([
      ['First', true], ['Second', true], ['Third', false]
    ]);
  });

  it('restores message defaults when a previously configured field becomes undefined', () => {
    const message = createMessage({ duration: 0, maxCount: 1 });
    const runtime = message[messageHolderKey];
    runtime.connect(clock);
    runtime.setVisible(true);
    runtime.configure({ duration: undefined, maxCount: undefined });
    message.info('First');
    message.info('Second');
    for (const notice of runtime.notices) runtime.mounted(notice.id);

    expect(runtime.notices).toHaveLength(2);
    vi.advanceTimersByTime(2999);
    expect(runtime.notices.every(notice => !notice.closing)).toBe(true);
    vi.advanceTimersByTime(1);
    expect(runtime.notices.every(notice => notice.closing)).toBe(true);
  });

  it('changes placement for new notifications and preserves local overrides', () => {
    const notification = createNotification({ placement: 'topLeft', duration: 0 });
    const runtime = notification[notificationHolderKey];
    runtime.connect(clock);
    notification.info({ title: 'Existing' });
    notification[notificationOptionsKey]({ placement: 'bottomRight', duration: false });
    notification.info({ title: 'New' });
    notification.info({ title: 'Local', placement: 'bottomLeft' });

    expect(runtime.notices.map(notice => notice.placement)).toEqual([
      'topLeft', 'bottomRight', 'bottomLeft'
    ]);
  });

  it('maps notification false duration and resets unspecified configuration to defaults', () => {
    const notification = createNotification({ duration: 1, placement: 'bottomLeft' });
    const runtime = notification[notificationHolderKey];
    runtime.connect(clock);
    runtime.setVisible(true);
    notification[notificationOptionsKey]({ duration: false });
    notification.info({ title: 'Persistent' });
    runtime.mounted(runtime.notices[0].id);
    notification[notificationOptionsKey]({});
    notification.info({ title: 'Default' });
    runtime.mounted(runtime.notices[1].id);
    vi.advanceTimersByTime(4500);

    expect(runtime.notices.map(notice => [notice.placement, notice.closing])).toEqual([
      ['topRight', false], ['topRight', true]
    ]);
  });

  it('changes pauseOnHover for future notices without changing existing hover behavior', () => {
    const message = createMessage({ duration: 1, pauseOnHover: true });
    const runtime = message[messageHolderKey];
    runtime.connect(clock);
    runtime.setVisible(true);
    message.info('Paused');
    runtime.mounted(runtime.notices[0].id);
    runtime.hover(runtime.notices[0].id, true);
    runtime.configure({ duration: 1, pauseOnHover: false });
    message.info('Running');
    runtime.mounted(runtime.notices[1].id);
    runtime.hover(runtime.notices[1].id, true);
    vi.advanceTimersByTime(1000);

    expect(runtime.notices.map(notice => notice.closing)).toEqual([false, true]);
  });
});
