import combo from '../src/comboparser';
import type { ParserOutput } from '../src/comboparser';

const declTypeParser = combo.oneOf(
    combo.match('VAR '),
    combo.match('GLOBAL_VAR ')
);
declTypeParser.map(v => v.trim().toLowerCase())
const typeParser = combo.oneOf(
    combo.match(' INT '),
    combo.match(' STRING '),
    combo.match(' BOOL ')
).map(v => v.trim().toLowerCase());
const stringParser = combo.between(combo.match('"'), combo.letters);
const numParser = combo.digits.map(Number);
const boolParser = combo.oneOf(combo.match('true'), combo.match('false')).map(v => v === 'true');

const parser = combo.contextual(function*() {
    const declarationType: string = yield declTypeParser;
    const varName: string = yield combo.letters;
    const type: string = yield typeParser;
    let data;
    switch (type) {
        case 'int': data = yield numParser; break;
        case 'string': data = yield stringParser; break;
        case 'bool': data = yield boolParser; break;
    }
    return { varName: varName, data, type: type.trim().toLowerCase(), declarationType: declarationType.trim().toLowerCase() };
});

const ex1 = 'VAR theAnswer INT 42';
const ex2 = 'GLOBAL_VAR greeting STRING "Hello"';
const ex3 = 'VAR skyIsBlue BOOL true';


function makeTest(output: ParserOutput | string, varName: string, data: any, type: string, declarationType: string) {
    if (typeof(output) === 'string') { output = parser(output); }
    expect(output.isError).toBe(false);
    expect(output.result).not.toBeNull();
    expect(output.result).toEqual({ varName, data, type, declarationType });
    expect(output.result.varName).toStrictEqual(varName);
    expect(output.result.data).toStrictEqual(data);
    expect(output.result.type).toStrictEqual(type);
    expect(output.result.declarationType).toStrictEqual(declarationType);
}


test('expression1', () => makeTest(ex1, 'theAnswer', 42, 'int', 'var'));
test('expression2', () => makeTest(ex2, 'greeting', 'Hello', 'string', 'global_var'));
test('expression3', () => makeTest(ex3, 'skyIsBlue', true, 'bool', 'var'));
