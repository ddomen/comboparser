import combo from '../src/comboparser';
import { checkOutput } from './test.lib';

test('oneOf.invalid', () => {
    expect(() => combo.oneOf()).toThrow(TypeError);
    expect(() => combo.oneOf([])).toThrow(TypeError);
});

test('oneOf', () => {
    const p = combo.oneOf(combo.digits, combo.letters);
    const s1 = p('123abc');
    checkOutput(s1, '123abc', 3, '123');
    const s2 = p('abc123');
    checkOutput(s2, 'abc123', 3, 'abc');
    const e = p(' 123abc')
    checkOutput(e, ' 123abc', 0, null, 'oneOf: Unable to match with any parser @ index 0');
});