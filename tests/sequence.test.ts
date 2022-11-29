import combo from '../src/comboparser';
import { checkOutput, matchError } from './test.lib';

test('sequence.invalid', () => {
    expect(() => combo.sequence()).toThrow(TypeError);
    expect(() => combo.sequence([])).toThrow(TypeError);
});

test('sequence', () => {
    const p = combo.sequence(combo.digits, combo.letters);
    const s = p('123abc');
    checkOutput(s, '123abc', 6, [ '123', 'abc' ]);
    const e = p('abc123');
    checkOutput(e, 'abc123', 0, null, matchError('abc123', /^\d+/));
});