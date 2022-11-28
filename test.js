const combo = require('./dist/cjs/comboparser');


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
    const declarationType = yield declTypeParser;
    const varName = yield combo.letters;
    const type = yield typeParser;
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

console.log(parser(ex1));
console.log(parser(ex2));
console.log(parser(ex3));

combo.parser(s => s, e => combo.state.error(e, 'Last error was: ' + e.error))

