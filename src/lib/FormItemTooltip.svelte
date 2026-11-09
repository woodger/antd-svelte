<script lang="ts">
  import Tooltip from './Tooltip.svelte';
  import RenderContent from './RenderContent.svelte';
  import { useConfig } from './config-context';
  import type { FormTooltipProps } from './form.types';
  import type { TooltipTrigger } from './tooltip.types';

  let { options, formPrefix, formScope }: {
    options: FormTooltipProps;
    formPrefix: string;
    formScope?: string;
  } = $props();
  const config = useConfig();
  let { icon, children, ...settings } = $derived(options);
  let trigger = $derived(settings.trigger ?? config.tooltip?.trigger ?? 'hover');
  let actions = $derived<readonly TooltipTrigger[]>(typeof trigger === 'string' ? [trigger] : trigger);
  // Общий getter может вернуть ShadowRoot; TooltipPopup получает его через config без сужения типа.
  let popupContainer = $derived(settings.getPopupContainer
    ?? (config.getPopupContainer ? undefined : defaultContainer));

  function preventLabelClick(node: HTMLSpanElement) {
    const prevent = (event: MouseEvent) => event.preventDefault();
    node.addEventListener('click', prevent);

    return { destroy: () => node.removeEventListener('click', prevent) };
  }

  function defaultContainer(node: HTMLElement) {
    return node.ownerDocument.body;
  }
</script>

<style>
  /* Native Tooltip shell не меняет flex/inline геометрию исходного label. */
  :global([data-ant-form-item] .ant-tooltip-trigger:has(> [data-ant-form-tooltip])) { display: contents; }
  .anticon {
    display: inline-flex;
    align-items: center;
    color: inherit;
    font-style: normal;
    line-height: 0;
    text-align: center;
    text-transform: none;
    vertical-align: -0.125em;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
  }
</style>

<Tooltip {...settings} {trigger}
  showAction={settings.showAction ?? actions} hideAction={settings.hideAction ?? actions}
  getPopupContainer={popupContainer}>
  <span class={`${formPrefix}-item-tooltip`} data-ant-form-prefix={formScope}
    data-ant-form-tooltip tabindex="-1" use:preventLabelClick>
    {#if icon}{@render icon()}
    {:else if children}<RenderContent value={children} />
    {:else}
      <!-- QuestionCircleOutlined из UMD Ant Design 6.6.8; MIT, vendor/LICENSE.ant-design-icons. -->
      <span class="anticon anticon-question-circle" aria-hidden="true">
        <svg viewBox="64 64 896 896" focusable="false" width="1em" height="1em"
          fill="currentColor" aria-hidden="true">
          <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z" />
          <path d="M623.6 316.7C593.6 290.4 554 276 512 276s-81.6 14.5-111.6 40.7C369.2 344 352 380.7 352 420v7.6c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8V420c0-44.1 43.1-80 96-80s96 35.9 96 80c0 31.1-22 59.6-56.1 72.7-21.2 8.1-39.2 22.3-52.1 40.9-13.1 19-19.9 41.8-19.9 64.9V620c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8v-22.7a48.3 48.3 0 0130.9-44.8c59-22.7 97.1-74.7 97.1-132.5.1-39.3-17.1-76-48.3-103.3zM472 732a40 40 0 1080 0 40 40 0 10-80 0z" />
        </svg>
      </span>
    {/if}
  </span>
</Tooltip>
