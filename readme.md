# ComboParser
A parser combinator library

## Installing
Install this library is easy by using npm:
```
npm install comboparser
```

## Usage
**ComboParser** is parser combinator library which allow you to define high-order parsers with simplicity.\

### Importing
ComboParsers can be imported in the following ways:
```js
// Common JS
const combo = require('comboparser');
// Module
import combo from 'comboparser';
// or individual parts
import { letters } from 'comboparser';

// we will refer next as 'combo' constant for
// reference this library
```
### Parsers
Generally speaking, a parser is a function which takes an initial state and produces a `ParserResult` or a `ParserError`.

```js
console.log(combo.letters('any letter'))
// output - ParserResult
{
    source: 'any letter',
    index: 3,
    result: 'any',
    isError: false,
    error: null
}

console.error(combo.letters('1234567890'))
// output - ParserError
{
  source: '1234567890',
  index: 0,
  result: null,
  isError: true,
  error: "Tried to match '/^[A-Za-z]+/', but got '1234567890' @ index 0"
}
```
In this case we used the already provided parser `letters` which match any letter case insensitive. This parser is actually a function which can take a `string` (or any input `ParserState`) and produces a `ParserResult` if can match at least one letter, otherwise produces a `ParserError`.\
This library provides also some utility functions to build up a more complex parser, by using smaller parts. There are many, listed in [Parser Combinators](#parser-generators), here some examples:
```js
const quoteParser = combo.match('"'); // matches only quote: "
const contentParser = combo.letters;  // any letter
const stringParser = combo.between(
    // match the sequence of
    // quote -> content -> quote
    quoteParser,
    contentParser
);
console.log(stringParser('"myawesomestring"'));

// output - ParserResult
{
  source: '"myawesomestring"',
  index: 17,
  result: 'myawesomestring',
  isError: false,
  error: null
}
```

You can also transform the output of a parser using the [Parser Methods](#parser-methods) provided, here an example:
```js
const myParser = combo.letters
    // transforming result (ParserResult)
    .map(result =>
        result.replace(/lowercase/g, 'uppercase')
                .toUpperCase()
    )
    // transforming error (ParserError)
    .error(error =>
        error.replace(/lowercase/g, 'uppercase')
                .toUpperCase()
    );
console.log(myParser('mylowercasetext'));

// output - ParserResult
{
  source: 'mylowercasetext',
  index: 15,
  result: 'MYUPPERCASETEXT',
  isError: false,
  error: null
}

console.error(myParser('1234567890 lowercase'));
// output - ParserError
{
  source: '1234567890 lowercase',
  index: 0,
  result: null,
  isError: true,
  error: "TRIED TO MATCH '/^[A-ZA-Z]+/', BUT GOT '1234567890 UPPERCASE' @ index 0"
}
```

You should not need to define your own parser because you can create it by combining the already supplied parsers or functions. If you still need it, you can define a parser with the utility function `parser`:
```js
const myString = 'myString';
const myParser = combo.parser(state => {
    if (state.result === myString) {
        return combo.state.ok(state, myString, state.index + myString.length);
    }
    return combo.state.error(state, 'myString was not matched @ index ' + state.index)
},
// optional error management
errorState => {
    if (errorState.error.startsWith('myString was not matched @ index')) {
        // returning my error
        return errorState;
    }
    // return an empty ParserResult 
    return combo.state.ok(errorState, null, errorState.index);
});

const ucMyParser = myParser.map(result => result.toUpperCase());
```

### Binary Parsers
All of what concernes a string parser can be applied to any sequence of bytes (or even bits). This library provides an abstraction to work with binary sequences like you would work with strings (or char sequences).\
**ComboParser** has a namespace named `combo.binary` dedicated to work with binary data:

```js

const mySequenceParser = combo.binary.sequence(
    combo.binary.one,
    combo.binary.zero,
    combo.binary.zero,
    combo.binary.one
);
console.log(mySequenceParser([ 0b10010011, 0b00100110 ]))
// output - BinaryParserResult
{
  source: DataView <93 26>,
  index: 4,
  result: [ 1, 0, 0, 1 ],
  isError: false,
  error: null
}

console.error(mySequenceParser([ 0b10000011, 0b00100110 ]))
// output - BinaryParserError
{
  source: DataView <83 26>,
  index: 3,
  result: [ 1, 0, 0, 0 ],
  isError: true,
  error: 'one: expected 1 but got 0 @ index 3'
}
```

To create your own binary parser (without combining from others), you can use the utiliy function `combo.binary` (which works also as the namespace), passing the same kind of arguments as the `combo.parser` function.

## API
### Built-in Parsers
- Parsers:
    - `combo.letters`: matches any letter (`/^[A-Za-z]+/`)
    - `combo.digits`: matches any digit (`/^[0-9]+/`)
    - `combo.spaces`: matches any space character (`/^\s+/`)
    - `combo.eof, combo.eoi, combo.end`: matches any the end of the input sequence
- Binary Parsers:
    - `combo.bit`: reads any bit
    - `combo.zero`: matches any unset bit (0)
    - `combo.one`: matches any set bit (1)
    - `combo.uintN`: reads an unsigned N-bit integer (N in `[8, 16, 24, 32, 64, 128, 256]`)
    - `combo.uintNBE`: reads an unsigned N-bit integer (N in `[8, 16, 24, 32, 64, 128, 256]`), Big Endian mode
    - `combo.intN`: reads a signed N-bit integer (N in `[8, 16, 24, 32, 64, 128, 256]`)
    - `combo.intNBE`: reads a signed N-bit integer (N in `[8, 16, 24, 32, 64, 128, 256]`), Big Endian mode

### Parser Methods
- Parsers:
    - `map(callback)`: maps the ParserResult of a parser into another kind of ParserResult (not restricted to string)
    ```js
    combo.letters.map(result => `The result is "${result}"''`);
    combo.letters.map(result => ({ type: 'string', value: result }));
    ```
    - `error(callback)`: maps the ParserError of a parser into another kind of ParserError (not restricted to string)
    ```js
    combo.letters.error(error => `The error was "${error}"''`);
    combo.letters.error(error => ({ type: 'error', value: error }));
    ```
    - `chain(callback)`: chains a parser to another by choosing the policy which will select the next parser
    ```js
    const stringParser = combo.letters.map(result => ({ type: 'string', value: result }));
    const numberParser = combo.digits.map(result => ({ type: 'number', value: Number(result) }));
    const booleanParser = combo.oneOf(combo.match('true'), combo.match('false'))
                                .map(result => ({ type: 'boolean', value: result === 'true' }));
    const typeParser = combo.oneOf(combo.match('STR'), combo.match('NUM'), combo.match('BOOL'));
    const declarationParser = combo.sequence(typeParser, combo.spaces).map(result => result[0]);
    const unrecognizedParser = combo.fail('Can not recognize the given type');
    const myParser = declarationParser.chain(result => {
        if (result === 'STR') { return stringParser; }
        else if (result === 'NUM') { return numberParser; }
        else if (result === 'BOOL') { return booleanParser; }
        // should never happen
        return unrecognizedParser
    });

    console.log(myParser('STR HelloWorld'));
    // output - ParserResult
    {
        source: 'STR HelloWorld',
        index: 14,
        result: { type: 'string', value: 'HelloWorld' },
        isError: false,
        error: null
    }

    console.log(myParser('NUM 435'));
    // output - ParserResult
    {
        source: 'NUM 435',
        index: 7,
        result: { type: 'number', value: 435 },
        isError: false,
        error: null
    }

    console.log(myParser('BOOL true'));
    // output - ParserResult
    {
        source: 'BOOL true',
        index: 9,
        result: { type: 'boolean', value: true },
        isError: false,
        error: null
    }

    console.log(myParser('InvalidType any value'));
    // output - ParserError
    {
        source: 'InvalidType any value',
        index: 0,
        result: [ null, null ],
        isError: true,
        error: 'oneOf: Unable to match with any parser @ index 0'
    }
    ```
- Binary Parser:
    - `map(callback)`: maps the BinaryParserResult of a parser into another kind of BinaryParserResult (not restricted to buffer, works as `Parser.map`)
    - `error(callback)`: maps the BinaryParserError of a parser into another kind of BinaryParserError (not restricted to buffer, works as `Parser.error`)
    - `chain(callback)`: chains a binary parser to another by choosing the policy which will select the next binary parser (works as `Parser.chain`)

### Parser Generators
- Parser:
    - `match(expression)`: generate a parser which matches if the current state starts with the given expression. The expression can be a string or a regular expression.\
    `parser = match('true'); => parser('true') OK, parser('1234') ERR`
    - `sequence(parsers[] | ...parsers)`: generate a parser which will match only if the given ordered sequence of parsers matches.\
    `parser = sequence(letters, digits); => parser('letters012354') OK, parser('012345letters') ERR`
    - `oneOf(parsers[] | ...parsers)`: generate a parser which will match only if one parser of the given ordered sequence matches.\
    `parser = oneOf(letters, digits); => parser('letters') OK(letters), parser('01234') OK(digits), parser(' ') ERR`
    - `many(parser)`: generate a parser that test the given parser as many times as possible.\
    `parser = many(match('42 ')); => parser('42 42 42 ') OK([ '42 ', '42 ', '42 ' ]), parser('any other letters') OK([])`
    - `oneOrMore(parser)`: generate a parser that test the given parser at least one time.\
    `parser = oneOrMore(match('42 ')); => parser('42 42 42 ') OK([ '42 ', '42 ', '42 ' ]), parser('any other letters') ERR`
    - `times(parser, n)`: generate a parser that test the given parser exactly `n` times.\
    `parser = times(match('42 '), 2); => parser('42 42 42 ') OK([ '42 ', '42 ' ]), parser('42 ') ERR`
    - `between(left, content, right = left)`: generate a parser which will parse the sequence `left content right` in order. If `right` parser is not provided, `left` parser will be used instead.\
    `parser = between(match('"'), letters); => parser('"myString"') OK('myString'), parser('myString"') ERR`
    - `separated(separator, content)`: generate a parser which will parse the sequence `(content separator)+ content` in order. If no content can be read at all, returns an error.\
    `parser = separator(match(','), letters); => parser('valueA,valueB,valueC') OK([ 'valueA', 'valueB', 'valueC' ]), parser('valueA;valueB"') OK([ 'valueA' ]), parser('1,2,3') ERR`
    - `lazy(callback, notCached = false)`: generate a parser which will evaluate the callback only when requested. The result will be evaluated each time if `notCached` is set to true. This function is useful when there are parser interdependencies (eg. parser ***A*** depends on ***B*** which depends on ***C*** which depends on ***A*** again - `A -> B -> C -> A`)
    - `fail(message)`: generate a parser which always produce error states. It is useful in chaining methods.\
    `parser = fail('error') => parser('any string') ERR`
    - `success(message)`: generate a parser which always produce error states. It is useful in chaining methods.\
    `parser = success({ ok: true }) => parser('any string') OK`
    - `contextual(generator)`: Create a parser which automatically chain the parsers produced by a generator function, yielding their parserd results states.\
    ```js
    const declTypeParser = combo.oneOf(
     combo.match('VAR '),
     combo.match('GLOBAL_VAR ')
    );
    const typeParser = combo.oneOf(
     combo.match(' INT '),
     combo.match(' STRING '),
     combo.match(' BOOL ')
    ).map(v => v.trim().toLowerCase());
    const stringParser = combo.between(combo.match('"'), combo.letters);
    const numParser = combo.digits.map(Number);
    const boolParser = combo.oneOf(combo.match('true'), combo.match('false')).map(v => v === 'true');
    const parser = combo.contextual(function*() { // Note that we use a generator function here
     const declarationType = yield declTypeParser; // yielding parser => returning 'var' | 'global_var'
     const varName = yield combo.letters; // returning string
     const type = yield typeParser; // returning 'int' | 'string' | 'bool'
     let data;
     switch (type) {
         case 'int': data = yield numParser; break;
         case 'string': data = yield stringParser; break;
         case 'bool': data = yield boolParser; break;
     }
     return { varName: varName, data, type: type.trim().toLowerCase(), declarationType: declarationType.trim().toLowerCase() };
    });
    console.log(parser('VAR theAnswer INT 42'));
    // output - ParserResult
    ...
    result: {
        varName: 'theAnswer',
        data: 42,
        type: 'int',
        declarationType: 'var'
    }
    console.log(parser('GLOBAL_VAR greeting STRING "Hello"'));
    // output - ParserResult
    ...
    result: {
        varName: 'greetubg',
        data: 'Hello',
        type: 'string',
        declarationType: 'global_var'
    }
    console.log(parser('VAR skyIsBlue BOOL true'));
    // output - ParserResult
    ...
    result: {
        varName: 'skyIsBlue',
        data: true,
        type: 'bool',
        declarationType: 'var'
    }
    ```
- Binary Parser:
    
    *Binary parsers contains the same generator functions of Parser with the following differences:*
    
    - Any function which takes a parser must take a binary parser instead and is accessed in the `combo.binary` namespace
    - `match(expression)`: the expression is a binary sequence (can be extracted from a string)

    *Furthermore there are more generator functions:*

    - `uint(bits, bigEndian = false)`: reads an unsigned integer with the given number of bits (`1 <= bits <= 32`). If `bigEndian` is `true`, the integer will be read in Big Endian mode.
    - `biguint(bits, bigEndian = false)`: reads an unsigned integer with the given number of bits (`bits >= 1`) as a `BigInt`. If `bigEndian` is `true`, the integer will be read in Big Endian mode.
    - `int(bits, bigEndian = false)`: reads a signed integer with the given number of bits (`1 <= bits <= 32`). If `bigEndian` is `true`, the integer will be read in Big Endian mode.
    - `bigint(bits, bigEndian = false)`: reads a signed integer with the given number of bits (`bits >= 1`) as a `BigInt`. If `bigEndian` is `true`, the integer will be read in Big Endian mode.


### High-order Functions
- `parseBetween(left, right = left)`: works as `between(left, content, right = left)` but it returns an high-order function which generates a parser like so: `content => between(left, content, right)`.
- `parseSeparated(separator)`: works as `separated(separator, content)` but it returns an high-order function which generates a parser like so: `content => separated(separator, content)`.
- `binary.parseBetween, binary.parseSeparated`: binary counterparts of `parseBetween` and `parseSeparated`

### Utility Functions
- `binary.asBinary(value)`: translates a sequence into a buffer (DataView) by converting each element into a number and treating it like a `0 | 1` bit.
- `binary.toCharCode(string)`: convert a string to its buffer (DataView) representation