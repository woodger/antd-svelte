import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-tabs-motion-reference.json';
import TabsMotionFixture from './TabsMotionFixture.svelte';

describe('Tabs source animation SSR', () => {
  it('pins both the wrapper and delegated motion reference', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256,
      rcMotion: { version: '1.3.3', revision: '595a9ccd66d6739ceeca335edb9dd2c1dbb5a76f' }
    });
  });

  it.each(reference.cases)('keeps initial source content and native pane shells for $name', sample => {
    const { body } = render(TabsMotionFixture, { props: { preset: sample.name } });
    const fields = Array.from(body.matchAll(/<input\b[^>]*name="([^"]*)"/g), match => match[1]);

    expect(fields).toEqual(sample.initial.values.map(([key]) => key));
    expect(body.includes('ant-tabs-ink-bar-animated')).toBe(sample.initial.inkAnimated);
    expect(body.includes('ant-tabs-body-animated')).toBe(sample.initial.bodyAnimated);
    expect(body.match(/role="tabpanel"/g)).toHaveLength(2);
    expect(body).toContain('aria-selected="true"');
    expect(body).not.toMatch(/class="[^"]*-(?:appear|enter|leave)-(?:start|active)/);
    expect(body).not.toContain('animated=');
  });

  it('keeps item classes and CSS on their panel after semantic content styles', () => {
    const { body } = render(TabsMotionFixture, { props: { preset: 'pane-after-semantic' } });
    const alpha = /<div(?=[^>]*role="tabpanel")(?=[^>]*data-tabs-key="alpha")[^>]*>/.exec(body)![0];
    const beta = /<div(?=[^>]*role="tabpanel")(?=[^>]*data-tabs-key="beta")[^>]*>/.exec(body)![0];
    const headers = Array.from(body.matchAll(/<button\b[^>]*role="tab"[^>]*>/g), match => match[0]);

    expect(alpha).toContain('p-content p-alpha');
    expect(alpha).toContain('color:rgb(10,20,30);padding-left:3px;color:rgb(40,50,60);padding-left:17px');
    expect(beta).toContain('p-content');
    expect(beta).not.toContain('p-alpha');
    for (const header of headers) expect(header).not.toMatch(/p-content|p-alpha|p-beta/);
  });

  it('keeps the pane CSS below motion display:none for a force-rendered hidden panel', () => {
    const { body } = render(TabsMotionFixture, { props: { preset: 'pane-force-hidden' } });
    const beta = /<div(?=[^>]*role="tabpanel")(?=[^>]*data-tabs-key="beta")[^>]*>/.exec(body)![0];

    expect(beta).toContain('p-content p-beta event-pane');
    expect(beta).toContain('color:rgb(70,80,90)');
    expect(beta).not.toContain('color:rgb(20,40,60)');
    expect(beta.indexOf('display:none')).toBeGreaterThan(beta.indexOf('color:rgb(70,80,90)'));
    expect(body).toContain('name="beta"');
  });
});
