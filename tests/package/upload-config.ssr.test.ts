import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-upload-config-reference.json';
import UploadConfigScope from '../browser/fixtures/UploadConfigScope.svelte';

describe('ConfigProvider.upload', () => {
  it('pins inheritance and raw completion observations separately from public counterparts', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    expect(reference.cases).toHaveLength(13);
    expect(reference.progress).toHaveLength(4);
    expect(reference.requests[1].events[0]).toBe('abort:provider');
    expect(reference.publicRequests.every(entry =>
      entry.events.every(event => !event.startsWith('abort:')))).toBe(true);
  });

  it('applies shared and local classes, styles and accept during SSR', () => {
    const body = render(UploadConfigScope, { props: { sample: {
      id: 'local-object', provider: 'object', local: 'object'
    } } }).body;

    expect(body).toContain('config-root local-root');
    expect(body).toContain('config-list local-list');
    expect(body).toContain('config-item local-item');
    expect(body).toContain('accept=".txt"');
    expect(body).not.toContain('customRequest=');
    expect(body).not.toContain('upload="');
  });

  it('resets the component record with an empty nested provider', () => {
    const body = render(UploadConfigScope, { props: { sample: {
      id: 'reset', provider: 'object', scope: 'reset'
    } } }).body;

    expect(body).toContain('accept=""');
    expect(body).not.toContain('config-root');
    expect(body).not.toContain('config-class');
  });

  it('inherits the record through an unspecified nested provider without starting requests', () => {
    vi.useFakeTimers();
    try {
      const body = render(UploadConfigScope, { props: { sample: {
        id: 'nested', provider: 'object', scope: 'nested'
      } } }).body;

      expect(body).toContain('config-root');
      expect(body).toContain('accept=".txt"');
      expect(body).toContain('Configured request events');
      expect(body).not.toContain('request:provider:');
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });
});
