import combo from '../src/comboparser';
import { checkOutput } from './test.lib';

test('oneOrMore.invalid', () => {
    expect(() => combo.oneOrMore(null as any)).toThrow(TypeError);
    expect(() => combo.oneOrMore(32 as any)).toThrow(TypeError);
});

test('oneOrMore', () => {
    const p = combo.oneOrMore(combo.match('42 '));
    const s1 = p('42 ');
    checkOutput(s1, '42 ', 3, [ '42 ' ]);
    const s2 = p('42 42 42 ');
    checkOutput(s2, '42 42 42 ', 9, [ '42 ', '42 ', '42 ' ]);
    const e = p('abc');
    checkOutput(e, 'abc', 0, null, 'oneOrMore: Unable to match any input parser @ index 0');
});