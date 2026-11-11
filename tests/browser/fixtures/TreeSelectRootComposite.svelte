<script lang="ts">
  import { Input } from 'antd-svelte';
  import type { InputProps, TreeSelectRootContext, TreeSelectRootRegistration } from 'antd-svelte';
  import type { HTMLInputAttributes } from 'svelte/elements';
  let { context, nativeElement = $bindable() }: {
    context: TreeSelectRootContext<HTMLElement>;
    nativeElement?: HTMLElement;
  } = $props();
  let control = $state<{ focus(options?: FocusOptions): void; blur(): void; }>();
  let register = $derived(context.register);
  let componentAttributes = $derived.by<InputProps>(() => {
    const inputAttributes: HTMLInputAttributes = context.attributes;
    const { value, defaultValue, size, class: className, style, ...attributes } = inputAttributes;
    return { ...attributes,
      value: value === undefined ? undefined : String(value ?? ''),
      defaultValue: defaultValue === undefined ? undefined : String(defaultValue ?? ''),
      class: className == null ? undefined : String(className), style: style ?? undefined,
      htmlSize: size ?? undefined };
  });
  $effect(() => {
    const node = nativeElement, instance = control;
    if (!node || !instance) return;
    const ref: TreeSelectRootRegistration<HTMLElement> = {
      nativeElement: node,
      focus: options => instance.focus(options),
      blur: () => instance.blur()
    };
    return register(ref);
  });
</script>
<Input {...componentAttributes} prefix="Own prefix" suffix="Own suffix"
  bind:this={control} bind:nativeElement />
