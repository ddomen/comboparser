import combo from '../src/comboparser';
import { checkOutput } from './test.lib';

test('times.invalid', () => {
    expect(() => combo.times(null as any, 0)).toThrow(TypeError);
    expect(() => combo.times(32 as any, 0)).toThrow(TypeError);
    expect(() => combo.times((() => {}) as any, 0)).toThrow(RangeError);
});

test('times', () => {
    const p = combo.times(combo.match('42 '), 3);
    const s = p('42 42 42 abc');
    checkOutput(s, '42 42 42 abc', 9, [ '42 ', '42 ', '42 ' ]);
    const e1 = p('abc');
    checkOutput(e1, 'abc', 0, null, 'times: Unable to match the input parser 3 times @ index 0');
    const e2 = p('42 ');
    checkOutput(e2, '42 ', 0, null, 'times: Unable to match the input parser 3 times @ index 0');
});