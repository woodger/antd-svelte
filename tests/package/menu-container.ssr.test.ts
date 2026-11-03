import { describe, expect, it } from 'vitest';
import { render } from 'svelte/server';
import { Menu } from 'antd-svelte';
import registry from 'antd-svelte/porting/registry.json';
import reference from '../browser/fixtures/ant-design-menu-container-reference.json';
import MenuContainerCase from '../browser/fixtures/MenuContainerCase.svelte';
import type { MenuContainerCase as ContainerCase } from '../browser/fixtures/menu-container-presets';

describe('Menu popup container SSR', () => {
  it('keeps an inactive parent unhighlighted when a descendant key is empty', () => {
    const { body } = render(Menu, {
      props: {
        items: [{ key: 'parent', label: 'Parent', children: [{ key: '', label: 'Leaf' }] }]
      }
    });

    expect(body).not.toContain('ant-menu-submenu-active');
  });

  it('pins getter precedence and popup retention to the official source archive', () => {
    expect(reference.reference).toMatchObject({
      version: registry.upstream.version,
      revision: registry.upstream.revision,
      archiveSha256: registry.upstream.archiveSha256,
      source: 'package/dist/antd.min.js'
    });
  });

  for (const sample of reference.cases) {
    it(`defers browser container getters for ${sample.name}`, () => {
      const { body } = render(MenuContainerCase, {
        props: {
          sample: sample as ContainerCase,
          onCall: () => { throw new Error('Unexpected Menu SSR container call'); }
        }
      });

      expect(body).toContain('role="menu"');
      expect(body).toContain('aria-label="Menu container calls">[]');
      expect(body).toContain('aria-label="Menu container ref">none');
      expect(body.toLowerCase()).not.toContain('getpopupcontainer=');
    });
  }
});
