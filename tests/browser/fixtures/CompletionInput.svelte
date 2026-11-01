<script lang="ts">
  import { untrack } from 'svelte';
  import { Input, type AutoCompleteInput } from 'antd-svelte';

  let { control }: { control: AutoCompleteInput; } = $props();
  let element = $state<HTMLInputElement>();
  const register = untrack(() => control.register);

  $effect(() => {
    if (element) return register(element).destroy;
  });
</script>

<Input {...control.attributes} bind:inputElement={element} />
