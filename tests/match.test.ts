import combo from '../src/comboparser';
import { checkOutput, matchError } from './test.lib';

test('match.string.simple', () => {
    const p = combo.match('"');
    const s = p('"');
    checkOutput(s, '"', 1, '"');
    const e = p('qwe');
    checkOutput(e, 'qwe', 0, null, matchError('qwe', '"'));
});

test('match.string.nc', () => {
    const p = combo.match('simple match');
    const s = p('simple match test');
    checkOutput(s, 'simple match test', 12, 'simple match');
    const e = p('SIMPLE MATCH TEST');
    checkOutput(
        e, 'SIMPLE MATCH TEST', 0, null,
        matchError('SIMPLE MATCH TEST', 'simple match')
    );
});

test('match.string.ic', () => {
    const p = combo.match('simple match', true);
    const s1 = p('simple match test');
    checkOutput(s1, 'simple match test', 12, 'simple match');
    const s2 = p('SIMPLE MATCH TEST');
    checkOutput(s2, 'SIMPLE MATCH TEST', 12, 'SIMPLE MATCH');
    const e = p('SIMPLE  MATCH TEST');
    checkOutput(
        e, 'SIMPLE  MATCH TEST', 0, null,
        matchError('SIMPLE  MATCH TEST', 'simple match')
    );
});

test('match.regex.raw.nc', () => {
    const p = combo.match(/simple match/);
    const s1 = p('simple match test');
    checkOutput(s1, 'simple match test', 12, 'simple match');
    const e1 = p('SIMPLE MATCH TEST');
    checkOutput(
        e1, 'SIMPLE MATCH TEST', 0, null,
        matchError('SIMPLE MATCH TEST', /simple match/)
    );
    const e2 = p(' simple match test');
    checkOutput(
        e2, ' simple match test', 0, null,
        matchError(' simple match test', /simple match/)
    );
});

test('match.regex.raw.ic', () => {
    const p = combo.match(/simple match/i);
    const s1 = p('simple match test');
    checkOutput(s1, 'simple match test', 12, 'simple match');
    const s2 = p('SIMPLE MATCH TEST');
    checkOutput(s2, 'SIMPLE MATCH TEST', 12, 'SIMPLE MATCH');
    const e = p(' simple match test');
    checkOutput(
        e, ' simple match test', 0, null,
        matchError(' simple match test', /simple match/i)
    );
});

test('match.regex.map', () => {
    const p = combo.match(/NUM:(\d+)?/i, m => Number(m[1]) || 0);
    const s1 = p('NUM:42');
    checkOutput(s1, 'NUM:42', 6, 42);
    const s2 = p('num:42')
    checkOutput(s2, 'num:42', 6, 42);
    const s3 = p('NUM:42.32');
    checkOutput(s3, 'NUM:42.32', 6, 42);
    const s4 = p('NUM:qwe');
    checkOutput(s4, 'NUM:qwe', 4, 0);
    const e = p('qwe:42');
    checkOutput(
        e, 'qwe:42', 0, null,
        matchError('qwe:42', /NUM:(\d+)?/i)
    );
});