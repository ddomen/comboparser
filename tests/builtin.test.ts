import combo from '../src/comboparser';
import { checkOutput, matchError } from './test.lib';

test('letters', () => {
    const p = combo.letters;
    const s = p('abcdef');
    checkOutput(s, 'abcdef', 6, 'abcdef');
    const e1 = p(' ');
    checkOutput(e1, ' ', 0, null, matchError(' ', /^[A-Za-z]+/));
    const e2 = p('123');
    checkOutput(e2, '123', 0, null, matchError('123', /^[A-Za-z]+/));
});

test('digits', () => {
    const p = combo.digits;
    const s = p('0123');
    checkOutput(s, '0123', 4, '0123');
    const e1 = p(' ');
    checkOutput(e1, ' ', 0, null, matchError(' ', /^\d+/));
    const e2 = p('asd');
    checkOutput(e2, 'asd', 0, null, matchError('asd', /^\d+/));
});

test('spaces', () => {
    const p = combo.spaces;
    const s = p(' \t\n\r');
    checkOutput(s, ' \t\n\r', 4, ' \t\n\r');
    const e1 = p('123');
    checkOutput(e1, '123', 0, null, matchError('123', /^\s+/));
    const e2 = p('asd');
    checkOutput(e2, 'asd', 0, null, matchError('asd', /^\s+/));
});

test('eof', () => {
    const p = combo.eof;
    const s = p('');
    checkOutput(s, '', 0, null);
    const e1 = p('123');
    checkOutput(e1, '123', 0, null, 'Expected End Of Input (eoi/eof/end) but found \'1\' @ index 0');
    const e2 = p('asd');
    checkOutput(e2, 'asd', 0, null, 'Expected End Of Input (eoi/eof/end) but found \'a\' @ index 0');
});