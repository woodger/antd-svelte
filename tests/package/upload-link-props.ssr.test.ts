import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-upload-link-props-reference.json';
import UploadLinkPropsScope from '../browser/fixtures/UploadLinkPropsScope.svelte';

describe('UploadFile.linkProps', () => {
  it('pins filename attributes and click traces to the upstream revision', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256
    });
    expect(reference.cases).toHaveLength(19);
    expect(reference.transitions).toHaveLength(5);
    expect(reference.cases.find(entry => entry.sample.id === 'click-prevent')?.click.events)
      .toEqual(['link:false']);
  });

  it.each(['attributes', 'json'])('renders %s attributes while preserving the file URL', mode => {
    const body = render(UploadLinkPropsScope, { props: { sample: { id: mode, mode } } }).body;

    expect(body).toContain('download="report.txt"');
    expect(body).toContain('title="Custom title"');
    expect(body).toContain('href="#original-file"');
    expect(body).not.toContain('href="#ignored-link"');
    expect(body).toContain('color:rgb(127, 20, 50)');
    expect(body).not.toContain('linkProps=');
  });

  it('keeps consumer anchor attributes off a filename without a URL', () => {
    const body = render(UploadLinkPropsScope, { props: { sample: {
      id: 'no-url', mode: 'attributes', noUrl: true, noPreview: true
    } } }).body;

    expect(body).toContain('ant-upload-list-item-name');
    expect(body).not.toContain('data-file-link=');
    expect(body).not.toContain('Custom title');
    expect(body).not.toContain('download="report.txt"');
  });
});
