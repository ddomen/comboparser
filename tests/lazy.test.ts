import combo from '../src/comboparser';
import { checkOutput, matchError } from './test.lib';

test('lazy.cached', () => {
    let times = 0;
    const p = combo.lazy(() => (times++, combo.match('abc')), false);
    let s1 = p('abc');
    checkOutput(s1, 'abc', 3, 'abc');
    expect(times).toStrictEqual(1);
    s1 = p('abc');
    checkOutput(s1, 'abc', 3, 'abc');
    expect(times).toStrictEqual(1);
    const e = p('123');
    checkOutput(e, '123', 0, null, matchError('123', 'abc'));
    expect(times).toStrictEqual(1);
});

test('lazy.notCached', () => {
    let times = 0;
    const p = combo.lazy(() => (times++, combo.match('abc')), true);
    let s1 = p('abc');
    checkOutput(s1, 'abc', 3, 'abc');
    expect(times).toStrictEqual(1);
    s1 = p('abc');
    checkOutput(s1, 'abc', 3, 'abc');
    expect(times).toStrictEqual(2);
    const e = p('123');
    checkOutput(e, '123', 0, null, matchError('123', 'abc'));
    expect(times).toStrictEqual(3);
});