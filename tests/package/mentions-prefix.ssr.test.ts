import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import { Mentions, type MentionsProps } from 'antd-svelte';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-mentions-prefix-reference.json';
import MentionsPrefixSSRFixtures from '../browser/fixtures/MentionsPrefixSSRFixtures.svelte';

describe('Mentions local/shared prefixes in the public package', () => {
  it('pins Source editor/popup CSS and live query identity', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    expect(reference.cases).toHaveLength(25);
    expect(reference.transitions.every(step => step.sameRoot && step.sameEditor && step.samePopup
      && step.focused && step.value === '@')).toBe(true);
    const empty = reference.cases.find(entry => 'nativeEmpty' in entry)!;

    expect(empty.sample.id).toBe('popup-empty');
    expect(empty.nativeEmpty).toBeDefined();
    expect(empty.result.normal.popup?.height).not.toBe(empty.nativeEmpty!.normal.popup?.height);
  });

  it('renders local parts and native field attributes without leaking CSS prefix props', () => {
    const props = {
      prefixCls: 'mention', defaultValue: 'Draft', name: 'comment', rows: 3
    } satisfies MentionsProps;
    const rendered = render(Mentions, { props });
    const body = rendered.body;

    expect(body.replace(/<!--[\s\S]*?-->/g, '')).toMatch(/^<div/);
    expect(body).toContain('mention-outlined');
    expect(body).toContain('mention-textarea');
    expect(body).toContain('mention-measure');
    expect(body).toContain('name="comment"');
    expect(body).toContain('rows="3"');
    expect(body).not.toContain('prefixCls=');
    expect(rendered.head).toContain('mentions-prefix:mention:ant');
  });

  it('keeps popup/measurement resources out of SSR with separate private namespaces', () => {
    vi.useFakeTimers();
    try {
      const rendered = render(MentionsPrefixSSRFixtures);

      expect(rendered.body).toContain('suite-mentions');
      expect(rendered.body).not.toContain('popover=');
      expect(rendered.head).toContain('--inner-cmp-mentions-padding-inline');
      expect(rendered.head).toContain('mentions-prefix:mention:inner');
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });
});
