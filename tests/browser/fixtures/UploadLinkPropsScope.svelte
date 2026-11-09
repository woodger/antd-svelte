<script module lang="ts">
  export interface UploadLinkSample {
    id: string;
    listType?: string;
    mode?: string;
    noUrl?: boolean;
    noPreview?: boolean;
    thumbnail?: boolean;
  }
</script>

<script lang="ts">
  import type { HTMLAnchorAttributes } from 'svelte/elements';
  import { ConfigProvider, Upload, enUS, type UploadFile, type UploadProps } from 'antd-svelte';

  let { sample }: { sample: UploadLinkSample } = $props();
  let events = $state<string[]>([]);
  let listType = $derived<NonNullable<UploadProps['listType']>>(
    sample.listType === 'picture' || sample.listType === 'picture-card'
      || sample.listType === 'picture-circle' ? sample.listType : 'text'
  );
  let linkProps = $derived.by<UploadFile['linkProps']>(() => {
    if (sample.mode === 'attributes' || sample.mode === 'json') {
      const attributes = {
        target: '_self',
        rel: 'author',
        title: 'Custom title',
        href: '#ignored-link',
        download: 'report.txt',
        'aria-label': 'Open report',
        'data-file-link': 'attributes',
        style: 'color:rgb(127, 20, 50)'
      };

      return sample.mode === 'json' ? JSON.stringify(attributes) : attributes;
    }
    if (sample.mode === 'class') {
      return { class: 'custom-file-name', 'data-file-link': 'class', title: '', target: '', rel: '' };
    }
    if (sample.mode?.startsWith('click-')) {
      const onclick: NonNullable<HTMLAnchorAttributes['onclick']> = event => {
        events.push(`link:${event.defaultPrevented}`);
        if (sample.mode === 'click-prevent') event.preventDefault();
        if (sample.mode === 'click-stop') event.stopPropagation();
        return false;
      };

      return { onclick };
    }
    return undefined;
  });
  let file = $derived<UploadFile>({
    uid: 'one',
    name: 'alpha.txt',
    status: 'done',
    url: sample.noUrl ? undefined : '#original-file',
    thumbUrl: sample.thumbnail ? 'data:text/plain,thumbnail' : undefined,
    linkProps
  });
</script>

<ConfigProvider locale={enUS} theme={{ cssVar: {}, token: { motion: false } }}>
  <section data-upload-link-host>
    <Upload {listType} fileList={[file]} isImageUrl={() => false}
      onPreview={sample.noPreview ? undefined : file => events.push(`preview:${file.uid}`)}>
      <button type="button">Upload</button>
    </Upload>
  </section>
</ConfigProvider>
<output aria-label="Link props events">{JSON.stringify(events)}</output>
