<script lang="ts">
  import type { FormFeedbackIcon } from './form-feedback-context';
  import { formFeedbackIcons } from './form-feedback-icons';
  import RenderContent from './RenderContent.svelte';
  let { descriptor }: { descriptor?: FormFeedbackIcon } = $props();
  const icons = {
    success: 'check-circle', error: 'close-circle',
    warning: 'exclamation-circle', validating: 'loading'
  } as const;
</script>

<style>
  [data-form-feedback-glyph] { color:inherit;font-style:normal;line-height:0;text-align:center;text-transform:none;vertical-align:-0.125em;display:inline-flex;align-items:center; }
  svg { display:inline-block;width:1em;height:1em;fill:currentColor; }
  .spin { animation:ant-svelte-form-feedback-spin 1s linear infinite; }
  @keyframes ant-svelte-form-feedback-spin { to { transform:rotate(360deg); } }
  @media (prefers-reduced-motion:reduce) { .spin { animation-duration:2s; } }
</style>

{#if descriptor}
  <span data-ant-form-prefix={descriptor.prefixScope} class={[
    `${descriptor.prefixCls}-item-feedback-icon`, `${descriptor.prefixCls}-item-feedback-icon-${descriptor.status}`
  ]}>
    {#if descriptor.content !== undefined}<RenderContent value={descriptor.content} />{:else}{@const glyph = formFeedbackIcons[descriptor.status]}<span data-form-feedback-glyph class={`anticon anticon-${icons[descriptor.status]}`}
        class:spin={descriptor.status === 'validating'} role="img" aria-label={icons[descriptor.status]}>
        <svg viewBox={glyph.viewBox} aria-hidden="true" focusable="false"><path d={glyph.path} /></svg>
      </span>{/if}
  </span>
{/if}
