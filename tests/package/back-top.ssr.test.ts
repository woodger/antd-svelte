import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import { BackTop } from 'antd-svelte';

describe('deprecated BackTop public package SSR', () => {
  it('keeps a hidden empty root at the default visibility threshold', () => {
    const { body, head } = render(BackTop);

    expect(body).toContain('ant-back-top-css-var');
    expect(body).toContain('hidden');
    expect(body).toContain('inert');
    expect(body).not.toContain('<button');
    expect(head).toContain('data-ant-svelte-theme="ant-svelte-back-top-');
    expect(head).toContain('@media (max-width: 768px)');
    expect(head).toContain('@media (max-width: 480px)');
  });

  it('renders the default native action at threshold zero without invoking target or callbacks', () => {
    const target = vi.fn(() => { throw new Error('Target must not run during SSR'); });
    const onClick = vi.fn();
    vi.useFakeTimers();
    try {
      const { body } = render(BackTop, { props: {
        visibilityHeight: 0, target, onClick, duration: 123,
        class: 'owned-root', rootClassName: 'second-root', id: 'ssr-top'
      } });

      expect(body).toContain('<button');
      expect(body).toContain('type="button"');
      expect(body).toContain('aria-label="Наверх"');
      expect(body).toContain('owned-root second-root');
      expect(body).toContain('id="ssr-top"');
      expect(body).not.toContain('visibilityHeight');
      expect(body).not.toContain('duration=');
      expect(target).not.toHaveBeenCalled();
      expect(onClick).not.toHaveBeenCalled();
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });
});
