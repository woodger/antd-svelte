import {
  App,
  useApp,
  type AppConfig,
  type AppInstance,
  type AppProps,
  type ConfigProviderProps
} from 'antd-svelte';
import { createRawSnippet } from 'svelte';
import { render } from 'svelte/server';
import { describe, expect, expectTypeOf, it } from 'vitest';
import AppConsumer from '../browser/fixtures/AppConsumer.svelte';
import AppSSRFixtures from '../browser/fixtures/AppSSRFixtures.svelte';
import reference from '../browser/fixtures/ant-design-app-reference.json';

describe('App public package and SSR context', () => {
  it('pins source App roots, styling and notification reconfiguration', () => {
    expect(reference.reference.version).toBe('6.6.8');
    expect(reference.cases).toHaveLength(9);
    expect(reference.queueSnapshots.map(entry => entry.phase)).toEqual([
      'initial', 'after-config', 'after-open'
    ]);
    expect(reference.queueSnapshots[1].result.notifications).toEqual([
      'Notification 2', 'Notification 3'
    ]);
    expect(reference.queueSnapshots[2].result.notifications).toEqual(['Notification 4']);
  });

  it('publishes component config and native root options with a typed useApp context', () => {
    expectTypeOf<ReturnType<typeof useApp>>().toEqualTypeOf<AppInstance>();
    expect(App.useApp).toBe(useApp);
    const app: AppConfig = Object.freeze({ class: 'configured', style: 'padding:3px' });
    const config: Pick<ConfigProviderProps, 'app'> = { app };
    const props: AppProps = { component: false, message: { duration: 0, top: 40 } };

    expect(config.app).toBe(app);
    expect(props.message?.top).toBe(40);
  });

  it('provides all three API families under an SSR native root with merged class and style', () => {
    const body = render(AppSSRFixtures).body;

    expect(body).toMatch(/<main[^>]*id="ssr-app"/);
    expect(body).toContain('aria-label="SSR application"');
    expect(body).toContain('context-app local-app root-app');
    expect(body).toContain('color:#abcdef;padding:5px;padding:7px');
    expect(body).toContain('--ant-font-size:20px');
    expect(body).toContain('&quot;message&quot;,&quot;modal&quot;,&quot;notification&quot;');
    expect(body).not.toMatch(/<dialog[^>]*\sopen(?:\s|>)/);
    expect(body).not.toContain('component="main"');
  });

  it('omits root props in fragment mode while preserving children and holders', () => {
    const children = createRawSnippet(() => ({ render: () => '<strong>Fragment child</strong>' }));
    const body = render(App, { props: {
      component: false, class: 'unused-root', style: 'padding:100px', children
    } }).body;

    expect(body).toContain('<strong>Fragment child</strong>');
    expect(body).not.toContain('data-ant-app-root');
    expect(body).not.toContain('unused-root');
    expect(body).not.toContain('padding:100px');
    expect(body).toContain('ant-message-anchor');
    expect(body).toContain('ant-notification-anchor');
  });

  it('rejects a consumer without App instead of sharing a global queue across SSR requests', () => {
    expect(() => render(AppConsumer).body).toThrow('useApp must be called inside App');
    const first = render(AppSSRFixtures).body;
    const second = render(AppSSRFixtures).body;

    expect(first).toContain('App child');
    expect(second).toContain('App child');
    expect(first).not.toContain('ant-message-notice');
    expect(second).not.toContain('ant-notification-notice');
  });
});
