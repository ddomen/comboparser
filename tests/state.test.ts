import combo, { type ParserState } from '../src/comboparser';
import { checkOutput } from './test.lib';

const initial: ParserState<null> = {
    source: 'test',
    index: 0,
    result: null,
    isError: false,
    error: null
};

test('state.ok', () => {
    const s = combo.state.ok(initial, initial.source, initial.source.length);
    expect(s).not.toStrictEqual(initial);
    checkOutput(s, initial.source, 4, initial.source);
});

test('state.error', () => {
    const err = new Error('error');
    const e = combo.state.error(initial, err);
    expect(e).not.toStrictEqual(initial);
    checkOutput(e, initial.source, 0, null, err);
});