import combo from '../src/comboparser';
import { checkOutput, matchError } from './test.lib';

function testBetween(p: any, l: string, r?: string) {
    r ||= l;
    const s = p(`${l}abc${r}`);
    checkOutput(s, `${l}abc${r}`, 3 + l.length + r.length, 'abc');
    const e1 = p(`${l}abc`);
    checkOutput(e1, `${l}abc`, 0, null, matchError(`${l}abc`, r, l.length + 3));
    const e2 = p(`abc${r}`);
    checkOutput(e2, `abc${r}`, 0, null, matchError(`abc${r}`, l));
}

test('between', () => {
    const p = combo.between(combo.match('"'), combo.letters);
    testBetween(p, '"');
});

test('parseBetween', () => {
    const b = combo.parseBetween(combo.match('"'));
    const p = b(combo.letters);
    testBetween(p, '"');
});

test('between.right', () => {
    const p = combo.between(combo.match('['), combo.letters, combo.match(']'));
    testBetween(p, '[', ']');
});

test('parseBetween.right', () => {
    const b = combo.parseBetween(combo.match('['), combo.match(']'));
    const p = b(combo.letters);
    testBetween(p, '[', ']');
});