import { describe, expect, it } from 'vitest';
import { getUploadMotionItems } from './upload-motion.engine';
import reference from '../../tools/fixtures/ant-design-upload-motion-keys-reference.json';

describe('getUploadMotionItems', () => {
  it.each(reference.cases.filter(entry => !('observation' in entry.sample)))(
    'preserves Source ordering for $sample.id', ({ sample, result }) => {
      const previous = getUploadMotionItems([], sample.before.map(uid => ({ uid, name: uid })));
      const files = sample.after.map(uid => ({ uid, name: uid }));

      const next = getUploadMotionItems(previous, files);

      expect(next.map(({ key, status }) => ({ key, status }))).toEqual(result);
    }
  );

  it.each(['__proto__', 'constructor'])(
    'keeps one row when the uid %s moves before another file', uid => {
      const first = { uid: 'a', name: 'first.txt' };
      const special = { uid, name: 'special.txt' };
      const previous = getUploadMotionItems([], [first, special]);

      const next = getUploadMotionItems(previous, [special, first]);

      expect(next.map(item => item.key)).toEqual([uid, 'a']);
      expect(next.every(item => item.status === 'keep')).toBe(true);
      expect(next[0].file).toBe(special);
    }
  );

  it('uses current metadata for a returning file and retains the removed file for its leave', () => {
    const first = { uid: 'a', name: 'first.txt' };
    const second = { uid: 'b', name: 'second.txt' };
    const previous = getUploadMotionItems([], [first, second]);
    const leaving = getUploadMotionItems(previous, [second]);
    const updated = { ...first, name: 'updated.txt' };

    const next = getUploadMotionItems(leaving, [second, updated]);

    expect(leaving[0]).toMatchObject({ key: 'a', status: 'remove' });
    expect(leaving[0].file).toBe(first);
    expect(next.map(item => item.key)).toEqual(['b', 'a']);
    expect(next[1].file).toBe(updated);
    expect(next.every(item => item.status === 'keep')).toBe(true);
  });
});
