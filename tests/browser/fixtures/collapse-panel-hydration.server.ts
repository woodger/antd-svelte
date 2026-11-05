import { render } from 'svelte/server';
import CollapseLegacyCase from './CollapseLegacyCase.svelte';

export function renderCollapsePanels() {
  return render(CollapseLegacyCase, { idPrefix: 'collapse-panel-browser-' });
}
