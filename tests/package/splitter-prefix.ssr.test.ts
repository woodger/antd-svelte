import { createRawSnippet } from 'svelte';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import { Splitter, type SplitterProps } from 'antd-svelte';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-splitter-prefix-reference.json';
import isolated from '../browser/fixtures/ant-design-splitter-prefix-isolated.json';
import SplitterPrefixSSRFixtures from '../browser/fixtures/SplitterPrefixSSRFixtures.svelte';

describe('Splitter local and shared prefixes in the public package', () => {
  it('pins the official measurements and stable live identities', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    expect(reference.cases).toHaveLength(16);
    expect(reference.transitions).toHaveLength(3);
    expect(reference.transitions.every(step => step.sameRoot && step.samePanels
      && step.sameDragger && step.sameInput && step.focused)).toBe(true);
    expect(reference.namespaceInteractions[1].result.preview!.style.transform).toBe('none');
    expect(isolated.result.preview!.style.transform).toBe('matrix(1, 0, 0, 1, 30, 0)');
  });

  it('publishes prefixCls with raw semantic metadata and server panel sizes', () => {
    const props: SplitterProps = {
      prefixCls: 'panes',
      lazy: true,
      items: [
        { defaultSize: '40%', children: createRawSnippet(() => ({
          render: () => '<p>Server panel</p>'
        })) },
        { children: 'Second' }
      ],
      classNames: ({ props }) => ({ root: `raw-${props.prefixCls}` })
    };
    const rendered = render(Splitter, { props });

    expect(rendered.body).toContain('class="panes');
    expect(rendered.body).toContain('raw-panes');
    expect(rendered.body).toContain('panes-horizontal');
    expect(rendered.body).toContain('panes-panel');
    expect(rendered.body).toContain('panes-bar-preview');
    expect(rendered.body).toContain('--ant-splitter-bar-preview-offset:0px');
    expect(rendered.body).toContain('flex-basis:40%');
    expect(rendered.body).toContain('flex-basis:auto');
    expect(rendered.body).toContain('Server panel');
    expect(rendered.body).not.toContain('prefixCls=');
    expect(rendered.head).toContain('splitter-prefix:panes:ant');
  });

  it('separates inherited classes, local classes and global preview namespaces during SSR', () => {
    const rendered = render(SplitterPrefixSSRFixtures);

    expect(rendered.body).toContain('suite-splitter');
    expect(rendered.body).toContain('--suite-splitter-bar-preview-offset:0px');
    expect(rendered.body).toContain('panes-bar-preview');
    expect(rendered.body).toContain('--inner-splitter-bar-preview-offset:0px');
    expect(rendered.body).toContain('data-ant-splitter-vars="inner"');
    expect(rendered.head).toContain('splitter-prefix:panes:inner');
    expect(rendered.body).toContain('Draft');
    expect(rendered.body).not.toContain('flex-basis:192px');
  });
});
