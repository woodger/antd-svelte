import { createRawSnippet } from 'svelte';
import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import { Tour, type TourProps, type TourStepProps } from 'antd-svelte';

describe('Tour public package', () => {
  it.each([undefined, true, false])(
    'keeps portal layers and step content out of SSR with open=%s',
    open => {
      const steps: readonly TourStepProps[] = Object.freeze([
        { title: 'Client title', description: 'Client description', target: null }
      ]);
      const props: TourProps = { steps, open };

      const body = render(Tour, { props }).body;

      expect(body).not.toMatch(/<(?:div|svg|button)\b/);
      expect(body).not.toContain('Client title');
      expect(body).not.toContain('Client description');
    }
  );

  it('does not resolve DOM targets, containers or panel snippets on the server', () => {
    const target = vi.fn(() => {
      throw new Error('Target requires the browser');
    });
    const container = vi.fn(() => {
      throw new Error('Container requires the browser');
    });
    const panel = vi.fn(() => {
      throw new Error('Panel requires the browser');
    });
    const content = createRawSnippet(panel);
    const props: TourProps = {
      open: true,
      getPopupContainer: container,
      steps: [{ title: content, description: content, cover: content, target }]
    };

    render(Tour, { props });

    expect(target).not.toHaveBeenCalled();
    expect(container).not.toHaveBeenCalled();
    expect(panel).not.toHaveBeenCalled();
  });

  it('does not create timers or emit navigation callbacks for default-open SSR', () => {
    const onChange = vi.fn();
    const onClose = vi.fn();
    const onFinish = vi.fn();
    vi.useFakeTimers();
    try {
      render(Tour, {
        props: {
          defaultOpen: true,
          defaultCurrent: 1,
          steps: [{ title: 'First' }, { title: 'Second' }],
          onChange,
          onClose,
          onFinish
        }
      });

      expect(vi.getTimerCount()).toBe(0);
      expect(onChange).not.toHaveBeenCalled();
      expect(onClose).not.toHaveBeenCalled();
      expect(onFinish).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });
});
