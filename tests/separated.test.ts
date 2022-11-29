import combo from '../src/comboparser';
import { checkOutput } from './test.lib';

function testSeparated(p: any, sep: string) {
    const s1 = p([1,2,3].join(sep));
    checkOutput(s1, [1,2,3].join(sep), 3 + sep.length * 2, [ '1', '2', '3' ]);
    const s2 = p([1,2,3].join(sep) + sep);
    checkOutput(s2, [1,2,3].join(sep) + sep, 3 + sep.length * 3, [ '1', '2', '3' ]);
    const e1 = p('abc');
    checkOutput(e1, 'abc', 0, null, 'separated: Unable to capture any results @ index 0');
}

test('separated', () => {
    const p = combo.separated(combo.match(','), combo.digits);
    testSeparated(p, ',');
});

test('parseSeparated', () => {
    const b = combo.parseSeparated(combo.match(','));
    const p = b(combo.digits);
    testSeparated(p, ',');
});