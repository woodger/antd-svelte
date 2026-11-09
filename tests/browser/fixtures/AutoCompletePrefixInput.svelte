<script lang="ts">
  import { untrack } from 'svelte';
  import { Input, TextArea, type AutoCompleteInput, type AutoCompleteProps } from 'antd-svelte';

  let { control, textarea, variant }: {
    control: AutoCompleteInput;
    textarea: boolean;
    variant?: AutoCompleteProps['variant'];
  } = $props();
  let input = $state<HTMLInputElement>();
  let area = $state<HTMLTextAreaElement>();
  const register = untrack(() => control.register);

  $effect(() => {
    const element = textarea ? area : input;
    if (element) return register(element).destroy;
  });
</script>

{#if textarea}<TextArea {...control.attributes} {variant} bind:nativeElement={area} />
{:else}<Input {...control.attributes} {variant} bind:inputElement={input} />{/if}
