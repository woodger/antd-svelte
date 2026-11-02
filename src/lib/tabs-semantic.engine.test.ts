import { describe, expect, it } from 'vitest';
import { tabsSemantics } from './tabs-semantic.engine';
import type { TabsSemanticProps } from './tabs.types';

const props: TabsSemanticProps = { items: [], size: 'small', style: 'color:purple' };

describe('tabsSemantics', () => {
  it('accumulates provider and local classes without changing their records', () => {
    const context = Object.freeze({
      classNames: Object.freeze({ item: 'context', root: 'shared' })
    });
    const local = Object.freeze({ item: 'local', root: 'shared' });
    const result = tabsSemantics(context, local, undefined, props);

    expect(result.classes.item).toBe('context local');
    expect(result.classes.root).toBe('shared shared');
    expect(context.classNames.item).toBe('context');
  });

  it('keeps the root style order and merges nested popup root values', () => {
    const result = tabsSemantics(
      {
        style: 'color:green',
        styles: { root: 'color:red', popup: { root: 'color:navy' } },
        classNames: { popup: 'global-popup' }
      },
      { popup: { root: 'local-popup' } },
      { root: 'color:blue', popup: 'color:orange' },
      props
    );

    expect(result.styles.root).toBe('color:red;color:green;color:blue;color:purple');
    expect(result.styles.popup.root).toBe('color:navy;color:orange');
    expect(result.classes.popup.root).toBe('global-popup local-popup');
  });

  it('calls class and style producers in source order with the same resolved props', () => {
    const calls: [string, TabsSemanticProps][] = [];
    const record = (name: string) => (info: { props: TabsSemanticProps; }) => {
      calls.push([name, info.props]);
      return { root: name };
    };

    tabsSemantics(
      {
        classNames: record('context class'),
        styles: record('context style')
      },
      record('local class'),
      record('local style'),
      props
    );

    expect(calls.map(([name]) => name))
      .toEqual(['context class', 'local class', 'context style', 'local style']);
    expect(calls.every(([, value]) => value === props)).toBe(true);
  });

  it('keeps a plain root style without creating unrelated slot values', () => {
    const result = tabsSemantics(undefined, undefined, undefined, props);

    expect(result.styles.root).toBe('color:purple');
    expect(result.styles.item).toBeUndefined();
    expect(result.classes.root).toBeUndefined();
  });
});
