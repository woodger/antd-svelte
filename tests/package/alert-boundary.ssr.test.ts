import { createRawSnippet } from 'svelte';
import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import { Alert } from 'antd-svelte';
import AlertBoundaryCase from '../browser/fixtures/AlertBoundaryCase.svelte';

describe('Alert.ErrorBoundary public package SSR', () => {
  it('exports the compound Svelte component and leaves healthy content unwrapped', () => {
    const children = createRawSnippet(() => ({ render: () => '<span>Healthy child</span>' }));
    const { body } = render(Alert.ErrorBoundary, { props: { id: 'ignored', children } });

    expect(typeof Alert.ErrorBoundary).toBe('function');
    expect(body).toContain('<span>Healthy child</span>');
    expect(body).not.toContain('ant-alert');
    expect(body).not.toContain('id="ignored"');
  });

  it('renders and escapes healthy scalar/array children without a fallback', () => {
    const { body } = render(Alert.ErrorBoundary, { props: {
      children: ['<em>First</em>', 0, false, ['Last']], title: 'Unused title'
    } });

    expect(body).toContain('&lt;em>First&lt;/em>');
    expect(body).toContain('Last');
    expect(body).not.toContain('Unused title');
    expect(body).not.toContain('ant-alert');
  });

  it.each([{}, { title: 'Owner title', description: 'Owner description' }])(
    'propagates descendant SSR errors even with fallback props %j',
    props => {
      expect(() => render(AlertBoundaryCase, { props: { sample: {
        name: 'server-failure', props
      } } }).body).toThrow('Boundary failure');
    }
  );

  it('renders healthy snippets on the server without DOM, timers or error callbacks', () => {
    vi.useFakeTimers();
    try {
      const { body } = render(AlertBoundaryCase, { props: { sample: {
        name: 'server-healthy', props: {}, healthy: true
      } } });

      expect(body).toContain('value="Retained draft"');
      expect(body).not.toContain('ant-alert-error');
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });

  it('does not execute a failing client effect during SSR', () => {
    const { body } = render(AlertBoundaryCase, { props: { sample: {
      name: 'server-effect', props: {}, effect: true
    } } });

    expect(body).toContain('value="Retained draft"');
    expect(body).not.toContain('ant-alert-error');
  });
});
