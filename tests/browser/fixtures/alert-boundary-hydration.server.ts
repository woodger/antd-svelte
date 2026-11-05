import { render } from 'svelte/server';
import AlertBoundaryFixtures from './AlertBoundaryFixtures.svelte';

export function renderAlertBoundary() {
  return render(AlertBoundaryFixtures, { idPrefix: 'alert-boundary-browser-' });
}
