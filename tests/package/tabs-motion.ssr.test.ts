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
});
