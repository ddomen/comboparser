import combo from '../src/comboparser';
import { checkOutput } from './test.lib';

test('success', () => {
    const r = { type: 'int', value: 42 };
    const p = combo.success(r);
    const s = p('abc');
    checkOutput(s, 'abc', 0, r);
});

test('fail', () => {
    const r = { type: 'int', value: 42 };
    const p = combo.fail(r);
    const e = p('abc');
    checkOutput(e, 'abc', 0, null, r);
});