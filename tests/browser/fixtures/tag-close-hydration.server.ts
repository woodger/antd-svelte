import { render } from 'svelte/server';
import TagCloseCase from './TagCloseCase.svelte';
import reference from './ant-design-tag-close-reference.json';
import type { TagCloseCase as Sample } from './tag-close-presets';

export function renderTagClose(name: string) {
  const sample = reference.cases.find(sample => sample.name === name);
  if (!sample) throw new Error(`Unknown Tag hydration case: ${name}`);

  return render(TagCloseCase, {
    props: { sample: sample as Sample },
    idPrefix: 'tag-close-browser-'
  });
}
