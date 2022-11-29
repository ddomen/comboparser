import combo from '../src/comboparser';
import { checkOutput } from './test.lib';

test('many.invalid', () => {
    expect(() => combo.many(null as any)).toThrow(TypeError);
    expect(() => combo.many(32 as any)).toThrow(TypeError);
});

test('many', () => {
    const p = combo.many(combo.match('42 '));
    const s1 = p('abc');
    checkOutput(s1, 'abc', 0, []);
    const s2 = p('42 ');
    checkOutput(s2, '42 ', 3, [ '42 ' ]);
    const s3 = p('42 42 42 ');
    checkOutput(s3, '42 42 42 ', 9, [ '42 ', '42 ', '42 ' ]);
});