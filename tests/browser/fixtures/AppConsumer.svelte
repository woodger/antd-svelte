<script lang="ts">
  import { useApp, type AppInstance } from 'antd-svelte';
  let { scope = 'primary', onApi }: {
    scope?: string;
    onApi?: (api: AppInstance) => void;
  } = $props();
  const api = useApp();
  let messages = 0;
  let notifications = 0;
  let result = $state('pending');
  $effect(() => { onApi?.(api); });

  async function confirm() {
    result = String(await api.modal.confirm({
      title: `${scope} confirmation`, content: 'Confirm through App'
    }));
  }
</script>

<span id={scope === 'primary' ? 'app-child' : undefined} data-app-api={JSON.stringify({
  methods: Object.keys(api).sort(), modalMethods: Object.keys(api.modal).sort()
})}>App child</span>
<button type="button" onclick={() => api.message.info(`Message ${++messages}`)}>
  {scope} message
</button>
<button type="button" onclick={() => api.notification.info({ title: `Notification ${++notifications}` })}>
  {scope} notification
</button>
<button type="button" onclick={confirm}>{scope} modal</button>
<output data-app-result={scope}>{result}</output>
