<script lang="ts">
  import { Input, type TreeSelectInputContext, type TreeSelectRootContext } from 'antd-svelte';
  let { inputContext, rootContext }: {
    inputContext?: TreeSelectInputContext<HTMLInputElement>;
    rootContext?: TreeSelectRootContext<HTMLElement>;
  } = $props();
  let editor = $state<HTMLInputElement>();
  let wrapper = $state<HTMLElement>();
  let control = $state<{ focus(options?: FocusOptions): void; blur(): void; }>();
  // Root хранит свой черновик; binding сохраняет его при обновлении spread attrs.
  let rootDraft = $state<string>();
  let registerInput = $derived(inputContext?.register);
  let registerRoot = $derived(rootContext?.register);
  let inputAttributes = $derived.by(() => {
    const { value, defaultValue, size, class: className, ...attributes } = inputContext?.attributes ?? {};
    return { ...attributes, value: value === undefined ? undefined : String(value),
      defaultValue: defaultValue === undefined ? undefined : String(defaultValue),
      class: className == null ? undefined : String(className), htmlSize: size ?? undefined };
  });
  let rootAttributes = $derived.by(() => {
    const { class: className, ...attributes } = rootContext?.attributes ?? {};
    return { ...attributes, class: className == null ? undefined : String(className) };
  });
  $effect(() => {
    const input = editor, nativeElement = wrapper, instance = control;
    const root = registerRoot, registeredInput = registerInput;
    if (!nativeElement || !instance) return;
    if (root) return root({ nativeElement, focus: options => instance.focus(options), blur: () => instance.blur() });
    if (registeredInput && input) return registeredInput({ inputElement: input, nativeElement,
      focus: options => instance.focus(options), blur: () => instance.blur() });
  });
</script>

{#snippet prefix()}<span data-form-components-prefix>Prefix</span>{/snippet}
{#if inputContext}
  <Input {...inputAttributes} {prefix} data-form-components-editor="" aria-label="Form component editor"
    bind:inputElement={editor} bind:nativeElement={wrapper} bind:this={control} />
{:else}
  <Input {...rootAttributes} {prefix} data-form-components-editor="" aria-label="Form component editor"
    bind:value={rootDraft} bind:inputElement={editor} bind:nativeElement={wrapper} bind:this={control} />
{/if}
