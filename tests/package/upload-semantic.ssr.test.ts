import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-upload-semantic-reference.json';
import UploadSemanticScope from '../browser/fixtures/UploadSemanticScope.svelte';

describe('Upload semantic slots', () => {
  it('pins local slots, callback defaults and variable priority to the upstream revision', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    expect(reference.cases).toHaveLength(16);
    expect(reference.transitions).toHaveLength(5);
    expect(reference.cases.at(-2)?.result.trigger?.triggerHeight).toBe('120px');
    expect(reference.cases.at(-1)?.result.trigger?.triggerHeight).toBe('140px');
  });

  it('renders the four slots without leaking semantic props to the file input', () => {
    const body = render(UploadSemanticScope, { props: { sample: { id: 'object', mode: 'object' } } })
      .body;

    for (const slot of ['root', 'list', 'item', 'trigger']) expect(body).toContain(`custom-${slot}`);
    expect(body).toContain('min-height:33px');
    expect(body).toContain('margin-top:7px');
    expect(body).not.toContain('classNames=');
    expect(body).not.toContain('styles=');
  });

  it('passes resolved defaults and the unqualified prefix to callbacks during SSR', () => {
    const body = render(UploadSemanticScope, { props: { sample: {
      id: 'callback', mode: 'callback'
    } } }).body;
    const sample = reference.cases.find(entry => entry.sample.id === 'callback')!;

    for (const name of sample.result.root!.classes) expect(body).toContain(name);
    expect(body).toContain('min-height:39px');
  });

  it('keeps root variables inheritable by the trigger without browser timers', () => {
    vi.useFakeTimers();
    try {
      const body = render(UploadSemanticScope, { props: { sample: {
        id: 'variables', mode: 'variable-priority', listType: 'picture-card'
      } } }).body;

      expect(body).toContain('--ant-upload-picture-card-size:120px');
      expect(body).toContain('--ant-upload-picture-card-size:inherit');
      expect(body).toContain('--ant-upload-picture-card-size:140px');
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });
});
