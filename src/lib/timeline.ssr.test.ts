import { createRawSnippet } from 'svelte';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import Timeline from './Timeline.svelte';

describe('Timeline SSR', () => {
  it(
    'renders a passive ordered list with source Steps classes without current-step ARIA or status labels',
    () => {
      const body = render(
        Timeline,
        {
          props: {
            items: [
              { title: '09:00', content: 'Created' },
              { title: '10:00', content: 'Processing', loading: true }
            ]
          }
        }
      ).body;

      expect(body).toContain('<ol');
      expect(body.match(/<li /g)).toHaveLength(2);
      expect(body).toContain('ant-timeline ant-timeline-css-var');
      expect(body).toContain('ant-steps-dot');
      expect(body).toContain('ant-steps-outlined');
      expect(body).toContain('ant-steps-item-process');
      expect(body).toContain('ant-timeline-item-title');
      expect(body).not.toContain('<button');
      expect(body).not.toContain('aria-current');
      expect(body).not.toContain('ant-steps-item-status');
      expect(body).not.toContain('aria-label=');
      expect(body).not.toContain('id="ant-steps-');
    }
  );
  it(
    'renders zero and block snippets as content without manufacturing a zero-title alternate layout',
    () => {
      const content = createRawSnippet(
        () => ({ render: () => '<div><strong>Rich event</strong></div>' })
      );
      const body = render(
        Timeline,
        { props: { items: [{ title: 0, content: 0 }, { content }] } }
      )
        .body;

      expect(body.replace(/<!--.*?-->/g, '')).toMatch(/ant-timeline-item-title[^>]*>0<\/div>/);
      expect(body).toContain('<div><strong>Rich event</strong></div>');
      expect(body).not.toContain('ant-timeline-layout-alternate');
    }
  );
  it(
    'reverses a loading event while retaining its process status and following previous rail status',
    () => {
      const body = render(
        Timeline,
        {
          props: {
            items: [{ content: 'Created' }, { content: 'Approved' },
              { content: 'Waiting', loading: true }],
            reverse: true
          }
        }
      ).body;

      expect(body.indexOf('Waiting')).toBeLessThan(body.indexOf('Approved'));
      expect(body.indexOf('Approved')).toBeLessThan(body.indexOf('Created'));
      expect(body).toContain('ant-steps-item-rail-process');
    }
  );
  it(
    'supports colors and semantic priority without losing native root attributes',
    () => {
      const body = render(
        Timeline,
        {
          props: {
            id: 'audit',
            'aria-label': 'Audit events',
            mode: 'end',
            titleSpan: 8,
            class: 'owner',
            rootClassName: 'root',
            items: [
              {
                title: 'Event title',
                content: 'Event content',
                color: 'green',
                styles: { root: 'color:green' },
                style: 'color:blue'
              }
            ],
            styles: { root: '--ant-timeline-head-span:3;color:red', item: 'color:red' },
            style: 'color:black',
            classNames: { item: 'owner-event' }
          }
        }
      ).body;

      expect(body).toContain('id="audit"');
      expect(body).toContain('aria-label="Audit events"');
      expect(body).toContain('ant-timeline-item-color-green');
      expect(body).toContain('ant-timeline-item-placement-end');
      expect(body).toContain('owner-event');
      expect(body).toContain('Event title');
      expect(body).toContain('Event content');
      expect(body).toContain('color:red;color:green;color:blue');
      expect(body.indexOf('--ant-timeline-head-span:8')).toBeGreaterThan(
        body.indexOf('--ant-timeline-head-span:3')
      );
    }
  );
  it(
    'ignores titleSpan for alternate mode and preserves the explicit horizontal class before hydration',
    () => {
      const body = render(
        Timeline,
        {
          props: {
            items: [{ content: 'A' }],
            mode: 'alternate',
            titleSpan: '100px',
            orientation: 'horizontal'
          }
        }
      ).body;

      expect(body).toContain('ant-timeline-horizontal');
      expect(body).toContain('ant-timeline-layout-alternate');
      expect(body).toContain('ant-steps-horizontal');
      expect(body).not.toContain('--ant-timeline-head-span-ptg:100px');
    }
  );
});
