type Map<Input = any, Output = any> = (result: Input, index: number, source: string) => Output;

/** The result of a parsing action */
export type ParserState<Result = any> = {
  /** The intial source value being parsed */
  source: string;
  /** Offset (in chars - not glyphs) where the last result was found */
  index: number;
  /** The result of the last succedeed parsing action */
  result: Result;
  /** Wether the parser produced an error */
  isError: false;
  /** The error produced by the parser */
  error: null;
};
/** The error reporting state of a parsing action */
export type ParserError<Result = any, Error = any> = {
  /** The intial source value being parsed */
  source: string;
  /** Offset (in chars - not glyphs) where the last result was found */
  index: number;
  /** The result of the last succedeed parsing action */
  result: Result;
  /** Wether the parser produced an error */
  isError: true;
  /** The error produced by the parser */
  error: Error;
};
export type ParserOutput<Result = any, Error = any> = ParserState<Result> | ParserError<Result, Error>;

export type ParserStateHandler<OutResult = any, OutError = any, InResult = any> = (
  state: ParserState<InResult>,
) => ParserOutput<OutResult, OutError>;
export type ParserErrorHandler<OutError = any, InError = any> = (state: ParserError<InError>) => ParserError<OutError>;
export type ParserHandler<OutResult = any, OutError = any, InResult = any, InError = any> = (
  state: ParserOutput<InResult, InError>,
) => ParserOutput<OutResult, OutError>;
export type SourceParser<Result = any, Error = any> = (source: string) => ParserOutput<Result, Error>;

export type Parser<OutResult = any, OutError = any, InResult = any, InError = any> = ParserHandler<
  OutResult,
  OutError,
  InResult,
  InError
> &
  SourceParser<OutResult, OutError> & {
    /** Wether the parse operates at binary level */
    readonly isBinary: false;
    /**
     * Map the result of the parser into another result
     * @param callback a callback that produces a new result from the precedent
     * @return a new parser function which produces a new typed action
     */
    map<T>(callback: Map<OutResult, T>): Parser<T, OutError, InResult, InError>;
    /**
     * Map the error of the parser into another error. This method is the
     * equivalent of map but it will be performed only for error states
     * @param callback a callback that produces a new error from the precedent
     * @return a new parser function which produces a new typed error
     */
    error<E>(callback: Map<OutError, E>): Parser<OutResult, E, InResult, InError>;
    /**
     * Chain this parser to another parser. The callback function will
     * choose each time which parser will be chained depending on the
     * current parser state. This method is similar to a flatMap operation,
     * where the returned parser is used to produce a new updated state.
     * @param callback the function which decide which parser to employ
     *                  after the current one
     * @return a new chained parser
     */
    chain<OR, OE>(callback: Map<OutResult, Parser<OR, OE, OutResult, OutError>>): Parser<OR, OE, OutResult, OutError>;
  };

type BinMap<Input = any, Output = any> = (result: Input, index: number, source: DataView) => Output;

/** The result of a binary parsing action */
export type BinaryParserState<Result = any> = {
  /** The intial source value being parsed */
  source: DataView;
  /** Offset (in bits - not bytes) where the last result was found */
  index: number;
  /** The result of the last succedeed parsing action */
  result: Result;
  /** Wether the parser produced an error */
  isError: false;
  /** The error produced by the parser */
  error: null;
};
/** The error reporting state of a binary parsing action */
export type BinaryParserError<Result = any, Error = any> = {
  /** The intial source value being parsed */
  source: DataView;
  /** Offset (in bits - not bytes) where the last result was found */
  index: number;
  /** The result of the last succedeed parsing action */
  result: Result;
  /** Wether the parser produced an error */
  isError: true;
  /** The error produced by the parser */
  error: Error;
};
export type BinaryParserOutput<Result = any, Error = any> =
  | BinaryParserState<Result>
  | BinaryParserError<Result, Error>;

export type BinaryParserStateHandler<OutResult = any, OutError = any, InResult = any> = (
  state: BinaryParserState<InResult>,
) => BinaryParserOutput<OutResult, OutError>;
export type BinaryParserErrorHandler<OutError = any, InError = any> = (
  state: BinaryParserError<InError>,
) => BinaryParserError<OutError>;
export type BinaryParserHandler<OutResult = any, OutError = any, InResult = any, InError = any> = (
  state: BinaryParserOutput<InResult, InError>,
) => BinaryParserOutput<OutResult, OutError>;
export type BinarySourceParser<Result = any, Error = any> = (source: string) => BinaryParserOutput<Result, Error>;

export type BinaryParser<OutResult = any, OutError = any, InResult = any, InError = any> = BinaryParserHandler<
  OutResult,
  OutError,
  InResult,
  InError
> &
  BinarySourceParser<OutResult, OutError> & {
    /** Wether the parse operates at binary level */
    readonly isBinary: true;
    /**
     * Map the result of the binary parser into another result
     * @param callback a callback that produces a new result from the precedent
     * @return a new binary parser function which produces a new typed action
     */
    map<T>(callback: BinMap<OutResult, T>): BinaryParser<T, OutError, InResult, InError>;
    /**
     * Map the error of the binaryparser into another error. This method is the
     * equivalent of map but it will be performed only for error states
     * @param callback a callback that produces a new error from the precedent
     * @return a new binaryparser function which produces a new typed error
     */
    error<E>(callback: BinMap<OutError, E>): BinaryParser<OutResult, E, InResult, InError>;
    /**
     * Chain this binary parser to another parser. The callback function will
     * choose each time which binary parser will be chained depending on the
     * current binary parser state. This method is similar to a flatMap operation,
     * where the returned binary parser is used to produce a new updated state.
     * @param callback the function which decide which binary parser to employ
     *                  after the current one
     * @return a new chained binary parser
     */
    chain<OR, OE>(
      callback: BinMap<OutResult, BinaryParser<OR, OE, OutResult, OutError>>,
    ): BinaryParser<OR, OE, OutResult, OutError>;
  };

export namespace state {
  export function ok<Input, Output>(state: ParserState<Input>, result: Output, index?: number): ParserState<Output>;
  export function ok<Input, Output>(
    state: BinaryParserState<Input>,
    result: Output,
    index?: number,
  ): BinaryParserState<Output>;
  export function ok<Input, Output>(
    state: BinaryParserState<Input> | ParserState<Input>,
    result: Output,
    index?: number,
  ): BinaryParserState<Output> | ParserState<Output> {
    index ||= state.index;
    return { ...state, result, index };
  }

  export function error<Input, Output>(state: ParserOutput<Input, any>, error: Output): ParserError<Input, Output>;
  export function error<Input, Output>(
    state: BinaryParserOutput<Input, any>,
    error: Output,
  ): BinaryParserError<Input, Output>;
  export function error<Input, Output>(
    state: BinaryParserOutput<Input, any> | ParserOutput<Input, any>,
    error: Output,
  ): BinaryParserError<Input, Output> | ParserError<Input, Output> {
    return { ...state, error, isError: true };
  }
}
const _state = state.ok;
const _error = state.error;

function _extract<T>(data: T[]): T[] {
  if (!data || !data.length) {
    return [];
  }
  if (Array.isArray(data[0])) {
    return data[0];
  }
  return data;
}

/**
 * Create a parser out of a production function
 * @param handler the production function which can return a state or an error
 * @param error the function which will catch and elaborates errors produced by precedent operations
 * @returns a compiled perser
 */
export function parser<OutResult = any, OutError = any, InResult = any, InError = any>(
  handler: ParserStateHandler<OutResult, OutError, InResult>,
  error?: ParserErrorHandler<OutError, InError>,
): Parser<OutResult, OutError, InResult, InError> {
  const out: Parser<OutResult, OutError, InResult, InError> =
    typeof error === 'function'
      ? (state: string | ParserOutput) =>
          typeof state === 'string'
            ? handler({ source: state, index: 0, result: null as any, isError: false, error: null })
            : state.isError
            ? error(state)
            : handler(state)
      : (((state: string | ParserOutput) =>
          typeof state === 'string'
            ? handler({ source: state, index: 0, result: null as any, isError: false, error: null })
            : state.isError
            ? state
            : handler(state)) as any);
  out.map = (fn: Map<OutResult>) =>
    _parser((s) => {
      const next = out(s);
      return next.isError ? next : _state(next, fn(next.result, next.index, next.source));
    });
  out.error = (fn: Map<OutError>) =>
    _parser((s) => {
      const next = out(s);
      return next.isError ? _error(next, fn(next.error, next.index, next.source)) : (s as any);
    });
  out.chain = (fn: Map<OutResult, Parser<any, any, OutResult, OutError>>) =>
    _parser((s) => {
      const next = out(s as any);
      return next.isError ? next : fn(next.result, next.index, next.source)(next);
    });
  Object.defineProperty(out, 'isBinary', { value: false, enumerable: false, configurable: false, writable: false });
  return out;
}
const _parser = parser;

type Binariable = string | number[] | DataView | ArrayBuffer | ArrayBufferLike;
function _toBinary(value: Binariable): DataView {
  if (value instanceof DataView) {
    return value;
  }
  if (typeof value === 'string') {
    value = value.split('').map((s) => s.charCodeAt(0));
  }
  if (Array.isArray(value)) {
    value = new Uint8ClampedArray(value);
  }
  if (ArrayBuffer.isView(value)) {
    return new DataView(value.buffer, value.byteOffset, value.byteLength);
  }
  return new DataView(value);
}
function _isBinariable(value: any): value is Binariable {
  return typeof value === 'string' || ArrayBuffer.isView(value) || value instanceof ArrayBuffer || Array.isArray(value);
}

/**
 * Create a binary parser out of a production function
 * @param handler the production function which can return a binary state or an error
 * @param error the function which will catch and elaborates errors produced by precedent operations
 * @returns a compiled perser
 */
export function binary<OutResult = any, OutError = any, InResult = any, InError = any>(
  handler: BinaryParserStateHandler<OutResult, OutError, InResult>,
  error?: BinaryParserErrorHandler<OutError, InError>,
): BinaryParser<OutResult, OutError, InResult, InError> {
  const out: BinaryParser<OutResult, OutError, InResult, InError> =
    typeof error === 'function'
      ? (state: Binariable | BinaryParserOutput) =>
          _isBinariable(state)
            ? handler({ source: _toBinary(state), index: 0, result: null as any, isError: false, error: null })
            : state.isError
            ? error(state)
            : handler(state)
      : (((state: string | BinaryParserOutput) =>
          _isBinariable(state)
            ? handler({ source: _toBinary(state), index: 0, result: null as any, isError: false, error: null })
            : state.isError
            ? state
            : handler(state)) as any);
  out.map = (fn: BinMap<OutResult>) =>
    _binary((s) => {
      const next = out(s);
      return next.isError ? next : _state(next, fn(next.result, next.index, next.source));
    });
  out.error = (fn: BinMap<OutError>) =>
    _binary((s) => {
      const next = out(s);
      return next.isError ? _error(next, fn(next.error, next.index, next.source)) : (s as any);
    });
  out.chain = (fn: BinMap<OutResult, BinaryParser<any, any, OutResult, OutError>>) =>
    _binary((s) => {
      const next = out(s as any);
      return next.isError ? next : fn(next.result, next.index, next.source)(next);
    });
  Object.defineProperty(out, 'isBinary', { value: true, enumerable: false, configurable: false, writable: false });
  return out;
}
const _binary = binary;

const _matchStringIC = (expression: string, state: ParserState) =>
  state.source.slice(state.index, state.index + expression.length).toLowerCase() === expression
    ? _state(state, state.source.slice(state.index, state.index + expression.length), state.index + expression.length)
    : _error(
        state,
        `match: Tried to match '${expression}', but got '${state.source.slice(
          state.index,
          state.index + expression.length,
        )}' @ index ${state.index}`,
      );
const _matchStringNC = (expression: string, state: ParserState) =>
  state.source.slice(state.index, state.index + expression.length) === expression
    ? _state(state, expression, state.index + expression.length)
    : _error(
        state,
        `match: Tried to match '${expression}', but got '${state.source.slice(
          state.index,
          state.index + expression.length,
        )}' @ index ${state.index}`,
      );
const _matchRegexRaw = (expression: RegExp, state: ParserState) => {
  const match = state.source.slice(state.index).match(expression);
  return match
    ? _state(state, match[0]!, state.index + match[0]!.length)
    : _error(
        state,
        `match: Tried to match '${expression}', but got '${state.source.slice(
          state.index,
          state.index + 20,
        )}' @ index ${state.index}`,
      );
};
const _matchRegexMap = (expression: RegExp, map: (match: RegExpMatchArray) => any, state: ParserState) => {
  const match = state.source.slice(state.index).match(expression);
  return match
    ? _state(state, map(match), state.index + match[0]!.length)
    : _error(
        state,
        `match: Tried to match '${expression}', but got '${state.source.slice(
          state.index,
          state.index + 20,
        )}' @ index ${state.index}`,
      );
};

/**
 * Create a parser which check if the current state
 * matches the given regular expression. The expression
 * will be matched just at the start of the current state
 * @param expression the regular expression to match
 * @return a parser which check if the current state starts with the
 *          given regular expression
 */
export function match(expression: RegExp): Parser<string, string>;
/**
 * Create a parser which check if the current state
 * matches the given regular expression. The expression
 * will be matched just at the start of the current state.
 * The `matcher` function will be responsible to extract
 * the parser state out of the regex match result
 * @param expression the regular expression to match
 * @param matcher the function which extracts the parser state
 * @return a parser which check if the current state starts with the
 *          given regular expression
 */
export function match<T = string>(expression: RegExp, matcher: (match: RegExpMatchArray) => T): Parser<T, string>;
/**
 * Create a parser which check if the current state
 * starts with the given string expression. It is possible
 * to ignore case during the comparison.
 * @param expression the string expression to match
 * @param ignoreCase wheter to ignore case during the comparison (default: `false`)
 * @return a parser which check if the current state starts with the
 *          given string
 */
export function match<T extends string>(expression: T, ignoreCase?: false | undefined): Parser<T, string>;
/**
 * Create a parser which check if the current state
 * starts with the given string expression. It is possible
 * to ignore case during the comparison.
 * @param expression the string expression to match
 * @param ignoreCase wheter to ignore case during the comparison (default: `false`)
 * @return a parser which check if the current state starts with the
 *          given string
 */
export function match(expression: string, ignoreCase?: boolean): Parser<string, string>;
export function match(expression: string | RegExp, matcher?: boolean | ((match: RegExpMatchArray) => any)) {
  if (expression instanceof RegExp) {
    if (expression.source[0] !== '^') {
      expression = new RegExp('^' + expression.source, expression.ignoreCase ? 'i' : '');
    }
  } else {
    expression = String(expression);
  }
  return _parser<string, string>(
    expression instanceof RegExp
      ? typeof matcher === 'function'
        ? _matchRegexMap.bind(null, expression, matcher)
        : _matchRegexRaw.bind(null, expression)
      : matcher
      ? _matchStringIC.bind(null, expression.toLowerCase())
      : _matchStringNC.bind(null, expression),
  );
}

/** A parser which check for any letter in the range a-z (case insnsitive) */
export const letters = match(/^[A-Za-z]+/);
/** A parser which check for any digit in the range 0-9 */
export const digits = match(/^\d+/);
/** A parser which check for any white space */
export const spaces = match(/^\s+/);
/** A parser which check the end of the input */
export const eof = _parser((state) =>
  state.index >= state.source.length
    ? _state(state, null, state.index)
    : _error(
        state,
        `Expected End Of Input (eoi/eof/end) but found '${state.source[state.index]}' @ index ${state.index}`,
      ),
);
/** A parser which check the end of the input */
export const eoi = eof;
/** A parser which check the end of the input */
export const end = eof;

type SequenceOfParsersResult<Parsers extends Parser[]> = Parsers extends []
  ? []
  : Parsers extends [Parser<infer OR>]
  ? [OR]
  : Parsers extends [Parser<infer OR1, infer OE1>, ...infer Rest1]
  ? Rest1 extends [Parser<infer OR2, any, OR1, OE1>, ...infer Rest2]
    ? Rest2 extends Parser[]
      ? [OR1, OR2, ...SequenceOfParsersResult<Rest2>]
      : never
    : never
  : Parser extends Parser<infer OR>[]
  ? OR[]
  : never;
type SequenceOfParsersError<Parsers extends Parser[]> = Parsers extends []
  ? never
  : Parsers extends [Parser<any, infer OE>]
  ? OE
  : Parsers extends [Parser<infer OR1, infer OE1>, ...infer Rest1]
  ? Rest1 extends [Parser<any, infer OE2, OR1, OE1>, ...infer Rest2]
    ? Rest2 extends Parser[]
      ? OE1 | OE2 | SequenceOfParsersError<Rest2>
      : never
    : never
  : Parser extends Parser<any, infer OE>[]
  ? OE
  : never;
type SequenceOfParsers<Parsers extends Parser[]> = SequenceOfParsersResult<Parsers> extends never
  ? never
  : SequenceOfParsersError<Parsers> extends never
  ? never
  : Parser<SequenceOfParsersResult<Parsers>, SequenceOfParsersError<Parsers>, any, any>;

/**
 * Create a parser which check the concatenation in
 * sequence of the given parsers
 * @param parsers an array of parsers to concatenate
 * @return a parser that is the concatenation in a sequence
 *          of the given parsers
 */
export function sequence<Parsers extends Parser[]>(parsers: Parsers): SequenceOfParsers<Parsers>;
/**
 * Create a parser which check the concatenation in
 * sequence of the given parsers
 * @param parsers parsers to concatenate
 * @return a parser that is the concatenation in a sequence
 *          of the given parsers
 */
export function sequence<Parsers extends Parser[]>(...parsers: Parsers): SequenceOfParsers<Parsers>;
export function sequence(...parsers: Parser[]): any {
  parsers = _extract(parsers);
  if (!parsers.length) {
    throw new TypeError('sequence: you must provide at least one parser');
  }
  return _parser((state) => {
    let next: ParserOutput = state;
    const results: any[] = [];
    for (const p of parsers) {
      next = p(next);
      if (next.isError) {
        return _error(state, next.error);
      }
      results.push(next.result);
    }
    return _state(next, results);
  });
}

type OneOf<Args extends any[]> = Args extends []
  ? never
  : Args extends [infer X]
  ? X
  : Args extends [infer X, ...infer Rest]
  ? X | OneOf<Rest>
  : Args extends (infer X)[]
  ? X
  : never;

type ParserOneOf<Parsers extends Parser[]> = SequenceOfParsersResult<Parsers> extends never
  ? never
  : SequenceOfParsersError<Parsers> extends never
  ? never
  : Parser<OneOf<SequenceOfParsersResult<Parsers>>, SequenceOfParsersError<Parsers>, any, any>;

/**
 * Create a parser which returns the first success state
 * from any given parsers.
 * @param parsers an array of parsers to test
 * @return a parser which test the given parsers
 */
export function oneOf<Parsers extends Parser[]>(parsers: Parsers): ParserOneOf<Parsers>;
/**
 * Create a parser which returns the first success state
 * from any given parsers.
 * @param parsers parsers to test
 * @return a parser which test the given parsers
 */
export function oneOf<Parsers extends Parser[]>(...parsers: Parsers): ParserOneOf<Parsers>;
export function oneOf(...parsers: Parser[]): any {
  parsers = _extract(parsers);
  if (!parsers.length) {
    throw new TypeError('oneOf: you must provide at least one parser');
  }
  return _parser((state) => {
    for (const p of parsers) {
      const next = p(state);
      if (!next.isError) {
        return next;
      }
    }
    return _error(state, `oneOf: Unable to match with any parser @ index ${state.index}`);
  });
}

type ManyOf<P> = P extends Parser<infer OR, infer OE, infer IR, infer IE> ? Parser<OR[], OE, IR, IE> : never;

/**
 * Create a parser which tries to match the given parser
 * as many times as possible
 * @param parser the parser to test
 * @returns a parser which tries to match the given parser
 *              as many times as possible
 */
export function many<P extends Parser>(parser: P): ManyOf<P> {
  if (typeof parser !== 'function') {
    throw new TypeError('many: parser must be a valid parser function');
  }
  return _parser((state) => {
    let next: ParserOutput = state;
    const results: any[] = [];
    while (true) {
      const test: ParserOutput = parser(next);
      if (test.isError) {
        break;
      }
      results.push((next = test).result);
    }
    return _state(next, results);
  }) as any;
}

/**
 * Create a parser which match at least one time,
 * then as many times as possible, the given parser
 * @param parser the parser to test
 * @returns a parser which match at least one time,
 *          then as many times as possible, the given parser
 */
export function oneOrMore<P extends Parser>(parser: P): ManyOf<P> {
  if (typeof parser !== 'function') {
    throw new TypeError('oneOrMore: parser must be a valid parser function');
  }
  return _parser((state) => {
    let next: ParserOutput = state;
    const results: any[] = [];
    while (true) {
      const test: ParserOutput = parser(next);
      if (test.isError) {
        break;
      }
      results.push((next = test).result);
    }
    if (!results.length) {
      return _error(state, `oneOrMore: Unable to match any input parser @ index ${state.index}`);
    }
    return _state(next, results);
  }) as any;
}

/**
 * Create a parser which match the given parser
 * the given number of times
 * @param parser the parser to test
 * @param times how many exact times the parser must match
 * @returns a parser which match the given parser
 *          the given number of times
 */
export function times<P extends Parser>(parser: P, times: number): ManyOf<P> {
  if (typeof parser !== 'function') {
    throw new TypeError('times: parser must be a valid parser function');
  }
  times = Number(times);
  if (isNaN(times)) {
    throw new TypeError('times: times argument must be a valid number');
  }
  if (times < 1) {
    throw new RangeError(`times: times argument must be at least 1, ${times} given`);
  }
  return _parser((state) => {
    let next: ParserOutput = state;
    const results: any[] = [];
    for (let i = 0; i < times; ++i) {
      next = parser(next);
      if (next.isError) {
        return _error(state, `times: Unable to match the input parser ${times} times @ index ${state.index}`);
      }
      results.push(next.result);
    }
    return _state(next, results);
  }) as any;
}

/**
 * Create a parser which check the following syntax:
 * `wrapper content wrapper` from the given parsers.
 * The resultant parser will consider only the output of the
 * content parser.\
 * For example, to parse a string you can use `between(match('"'), contentParser)`
 * @param wrapper the wrapper parser to match before and after the content
 * @param content the parser responsible to match the content
 * @return a parser which consider only the wrapped content
 */
export function between<OR = any, OE = any, IR = any, IE = any>(
  wrapper: Parser<OR, OE, IR, IE>,
  content: Parser<IR, IE, OR, OE>,
): Parser<OR, OE, IR, IE>;
/**
 * Create a parser which check the following syntax:
 * `left content rigth` from the given parsers.
 * The resultant parser will consider only the output of the
 * content parser.\
 * For example, to parse an array you can use `between(match('['), valueParser, match(']'))`
 * @param left the parser to match before the content
 * @param content the parser responsible to match the content
 * @param right the parser to match after the content
 * @return a parser which consider only the wrapped content
 */
export function between<OR1 = any, OE1 = any, IR1 = any, IE1 = any, OR2 = any, OE2 = any, OR3 = any, OE3 = any>(
  left: Parser<OR1, OE1, IR1, IE1>,
  content: Parser<OR2, OE2, OR1, OE1>,
  right: Parser<OR3, OE3, OR2, OE2>,
): Parser<OR3, OE3, OR2, OE2>;
export function between(left: Parser, content: Parser, right?: Parser) {
  return sequence(left, content, right || left).map((r) => r[1]);
}

/**
 * Generate an high-order function which creates a
 * between expression for a parser. This function
 * returns another function which takes the content
 * parser as argument and generate a parser which will
 * match the following syntax: `wrapper content wrapper`.
 * The resultant parser will consider only the output of the
 * content parser.\
 * For example, to parse a string you can use
 * ```js
 * const contentParser = letters; // or whatever
 * const betweenQuotes = parsebetween(match('"'));
 * const stringParser = betweenQuotes(contentParser);
 * ```
 * @param wrapper the wrapper parser to match before and after the content
 * @return an high-order function which generate a between parser expression
 */
export function parseBetween<OR = any, OE = any, IR = any, IE = any>(
  wrapper: Parser<OR, OE, IR, IE>,
): (content: Parser<IR, IE, OR, OE>) => Parser<OR, OE, IR, IE>;
/**
 * Generate an high-order function which creates a
 * between expression for a parser. This function
 * returns another function which takes the content
 * parser as argument and generate a parser which will
 * match the following syntax: `left content right`.
 * The resultant parser will consider only the output of the
 * content parser.\
 * For example, to parse a simple numeric array you can use:
 * ```js
 * const contentParser = sequence(digits, match(',')); // or whatever
 * const betweenBrackets = parsebetween(match('['));
 * const arrayParser = betweenBrackets(contentParser);
 * ```
 * @param left the parser to match before the content
 * @param right the parser to match after the content
 * @return an high-order function which generate a between parser expression
 */
export function parseBetween<OR1, OE1 = any, IR1 = any, IE1 = any, OR2 = any, OE2 = any, OR3 = any, OE3 = any>(
  left: Parser<OR1, OE1, IR1, IE1>,
  right: Parser<OR3, OE3, OR2, OE2>,
): (content: Parser<OR2, OE2, OR1, OE1>) => Parser<OR3, OE3, OR2, OE2>;
export function parseBetween(left: Parser, right?: Parser) {
  return (content: Parser) => between(left, content, right!);
}

/**
 * Generate a parser which tries to match one or more
 * times the following syntax: `(content separator)* content`.
 * The resultant parser will consider only the output of
 * the content parser.\
 * For example, to parse a comma-separated list you can use:
 * `separated(match(','), contentPasrer)`.
 * @param separator the parser that matches separator
 * @param content the parser that match the content
 * @returns a parser which generate a separated expression
 */
export function separated<OR1 = any, OE1 = any, IE1 = any, OR2 = any, OE2 = any, IE2 = any>(
  separator: Parser<OR1, OE1, OR2, IE1>,
  content: Parser<OR2, OE2, OR1, IE2>,
): Parser<OR2[], OE2, OR1, IE2> {
  return _parser((state) => {
    const results: OR2[] = [];
    let next = state;

    while (true) {
      const test = content(next);
      if (test.isError) {
        break;
      }
      results.push(test.result);
      next = test as any;
      const sep = separator(test);
      if (sep.isError) {
        break;
      }
      next = sep;
    }

    if (results.length === 0) {
      return _error(state, `separated: Unable to capture any results @ index ${state.index}`) as any;
    }

    return _state(next, results);
  });
}

/**
 * Generate an high-order function which creates a
 * separated expression for a parser. This function
 * returns another function which takes the content
 * parser as argument and generate a parser which will
 * match the following syntax: `(content separator)* content`.
 * The resultant parser will consider only the output of the
 * content parser.\
 * For example, to parse a comma-separated list you can use:
 * ```js
 * const contentParser = letters; // or whatever
 * const commaSeparated = parseSeparated(match(','));
 * const commaSeparatedParser = commaSeparated(contentParser);
 * ```
 * @param separator the parser that matches separator
 * @return an high-order function which generate a between parser expression
 */
export function parseSeparated<OR1, OE1, IR1, IE1>(
  separator: Parser<OR1, OE1, IR1, IE1>,
): <OR, OE, IE>(content: Parser<OR, OE, OR1, IE>) => Parser<OR[], OE, OR1, IE> {
  return (content: Parser) => separated(separator, content) as any;
}

/**
 * Generate a parser which will use the given thunk lazily.
 * This is helpful if you need to use parsers which depends one
 * on the other:
 * ```js
 * const parserA = lazy(() => sequence([ parserB, digits, parserB ]));
 * const parserB = lazy(() => oneOf([ parserA, digits, letters ]));
 * ```
 * @param thunk the lazy evaluated function which produce a parser
 * @param notCached wether to cache or not the output of the thunk (default: `false --> cached`)
 * @returns a parser which evaluates lazily the given thunk
 */
export function lazy<P extends Parser>(thunk: () => P, notCached?: boolean): P {
  if (notCached) {
    return _parser((state) => thunk()(state)) as P;
  }
  let res: P | null = null;
  return _parser((state) => (res ||= thunk())(state)) as P;
}

/**
 * Create a parser which always produces an error state
 * @param message the message of the error state
 * @returns a failure parser
 */
export function fail<E>(message: E): Parser<any, E> {
  return _parser((state) => _error(state, message));
}
/**
 * Create a parser which always produces a success parser state
 * @param value the result value of the success state
 * @returns a success parser
 */
export function success<T>(value: T): Parser<T> {
  return _parser((state) => _state(state, value));
}

type ContextualOneOf<P extends Parser> = P extends Parser<infer R>
  ? R
  : P extends Parser<infer R> | infer Rest
  ? Rest extends Parser
    ? ContextualOneOf<Rest> extends never
      ? never
      : R | ContextualOneOf<Rest>
    : never
  : never;
type ContextualCB<P extends Parser, R> = () => Generator<P, ContextualOneOf<P> | R, ContextualOneOf<P> | R>;

/**
 * Create a parser which automatically chain the parsers produced
 * by a generator function, yielding their parserd results states.\
 * For example:
 * ```js
 * const declTypeParser = combo.oneOf(
 *  combo.match('VAR '),
 *  combo.match('GLOBAL_VAR ')
 * );
 * const typeParser = combo.oneOf(
 *  combo.match(' INT '),
 *  combo.match(' STRING '),
 *  combo.match(' BOOL ')
 * ).map(v => v.trim().toLowerCase());
 * const stringParser = combo.between(combo.match('"'), combo.letters);
 * const numParser = combo.digits.map(Number);
 * const boolParser = combo.oneOf(combo.match('true'), combo.match('false')).map(v => v === 'true');
 * const parser = combo.contextual(function*() { // Note that we use a generator function here
 *  const declarationType = yield declTypeParser; // yielding parser => returning 'var' | 'global_var'
 *  const varName = yield combo.letters; // returning string
 *  const type = yield typeParser; // returning 'int' | 'string' | 'bool'
 *  let data;
 *  switch (type) {
 *      case 'int': data = yield numParser; break;
 *      case 'string': data = yield stringParser; break;
 *      case 'bool': data = yield boolParser; break;
 *  }
 *  return { varName: varName, data, type: type.trim().toLowerCase(), declarationType: declarationType.trim().toLowerCase() };
 * });
 * parser('VAR theAnswer INT 42'); // { varName: 'theAnswer', data: 42, type: 'int', declarationType: 'var' }
 * parser('GLOBAL_VAR greeting STRING "Hello"'); // { varName: 'greetubg', data: 'Hello', type: 'string', declarationType: 'global_var' }
 * parser('VAR skyIsBlue BOOL true'); // { varName: 'skyIsBlue', data: true, type: 'bool', declarationType: 'var' }
 * ```
 * @param generator the function that generates the parsers to chain
 * @returns a automatically chained parser
 */
export function contextual<P extends Parser = Parser, R = any>(generator: ContextualCB<P, R>): Parser<R> {
  return success(null).chain(() => {
    const iterator = generator();
    function runStep(next: ContextualOneOf<P>): Parser {
      const itResult = iterator.next(next);
      if (itResult.done) {
        return success(itResult.value);
      }
      const nextParser = itResult.value;
      if (typeof nextParser !== 'function') {
        throw new TypeError('contextual: yielded values must always be parsers!');
      }
      return nextParser.chain(runStep);
    }
    return runStep(undefined as any);
  });
}

export namespace binary {
  function _compare(
    left: Binariable,
    right: Binariable,
    leftOffset: number = 0,
    rightOffset: number = 0,
    leftLength: number = -1,
    rightLength: number = -1,
  ): boolean {
    left = _toBinary(left);
    right = _toBinary(right);
    leftOffset = Math.max(Number(leftOffset) || 0, 0);
    rightOffset = Math.max(Number(rightOffset) || 0, 0);
    leftLength = leftLength < 0 ? left.byteLength : Math.min(leftLength, left.byteLength);
    rightLength = rightLength < 0 ? right.byteLength : Math.min(rightLength, right.byteLength);
    const maxOffset = rightLength - rightOffset;
    if (leftLength - leftOffset < maxOffset) {
      return false;
    }
    for (let i = 0; i < maxOffset; ++i) {
      if (left.getUint8(leftOffset + i) !== right.getUint8(rightOffset + i)) {
        return false;
      }
    }
    return true;
  }
  function _len(value: Binariable): number {
    if (typeof value === 'string' || Array.isArray(value)) {
      return value.length;
    }
    return value.byteLength;
  }
  function _hex(value: number, minDigits: number = 2): string {
    let res = value.toString(16);
    while (res.length < minDigits) {
      res = '0' + res;
    }
    return res;
  }
  function _str(value: Binariable, start?: number, end?: number): string {
    if (typeof value === 'string') {
      return value.slice(start, end);
    }
    if (
      value instanceof ArrayBuffer ||
      (typeof SharedArrayBuffer !== 'undefined' && value instanceof SharedArrayBuffer)
    ) {
      value = Array.prototype.slice.call(new Uint8Array(value)) as number[];
    } else if (ArrayBuffer.isView(value)) {
      value = Array.prototype.slice.call(new Uint8Array(value.buffer, value.byteOffset, value.byteLength)) as number[];
    }
    return (
      '<' +
      (value as number[])
        .slice(start, end)
        .map((v) => _hex(v))
        .join(', ') +
      '>'
    );
  }

  /**
   * Create a binary parser which check if the current state
   * starts with the given binary expression
   * @param expression the string expression to match
   * @param expressionOffset the offset where the considered expression starts
   * @param expressionLength the length of considered expression
   * @return a binary parser which check if the current state starts with the given bianry expression
   */
  export function match(
    expression: Binariable,
    expressionOffset: number = 0,
    expressionLength: number = -1,
  ): BinaryParser<DataView, string> {
    expression = _toBinary(expression);
    return _binary((state) =>
      _compare(state.source, expression, state.index, expressionOffset, -1, expressionLength)
        ? _state(state, expression, state.index + (expression as DataView).byteLength)
        : _error(
            state,
            `match: Tried to match '${_str(expression)}', but got '${_str(
              state.source,
              state.index,
              state.index + _len(expression),
            )}' @ index ${state.index}`,
          ),
    );
  }

  /** A binary parser which consumes a buffer bit by bit */
  export const bit: BinaryParser<0 | 1, string> = _binary((state) => {
    const byteOffset = Math.floor(state.index / 8);
    if (byteOffset >= state.source.byteLength) {
      return _error(state, `bit: Unexpected end of input @ index ${state.index}`);
    }
    const byte = state.source.getUint8(byteOffset);
    const bitOffset = 7 - (state.index % 8);
    const res = byte & (1 << bitOffset) ? 1 : 0;
    return _state(state, res, state.index + 1);
  });
  /** A binary parser which consume a buffer bit by bit, expecting an unsetted bit (0) */
  export const zero: BinaryParser<0, string> = _binary((state) => {
    const byteOffset = Math.floor(state.index / 8);
    if (byteOffset >= state.source.byteLength) {
      return _error(state, `bit: Unexpected end of input @ index ${state.index}`);
    }
    const byte = state.source.getUint8(byteOffset);
    const bitOffset = 7 - (state.index % 8);
    const res = byte & (1 << bitOffset) ? 1 : 0;
    return res
      ? _error(state, `zero: expected 0 but got 1 @ index ${state.index}`)
      : _state(state, res, state.index + 1);
  });
  /** A binary parser which consume a buffer bit by bit, expecting a setted bit (1) */
  export const one: BinaryParser<1, string> = _binary((state) => {
    const byteOffset = Math.floor(state.index / 8);
    if (byteOffset >= state.source.byteLength) {
      return _error(state, `bit: Unexpected end of input @ index ${state.index}`);
    }
    const byte = state.source.getUint8(byteOffset);
    const bitOffset = 7 - (state.index % 8);
    const res = byte & (1 << bitOffset) ? 1 : 0;
    return res
      ? _state(state, res, state.index + 1)
      : _error(state, `one: expected 1 but got 0 @ index ${state.index}`);
  });

  /**
   * Create a binary parser which read an unsigned integer from
   * a fixed number of bits into a {@link Number}. The number of bits must not exceed
   * 32. For integers longer than 32 bits use {@link biguint}
   * @param bits the number of bits to read (1 <= bits <= 32)
   * @param bigEndian wether to read the number in Big Endian or Little Endian mode
   * @returns a binary parser which read an unsigned integer with the given specs
   */
  export function uint(bits: number, bigEndian?: boolean): BinaryParser<number, string> {
    if (bits < 1) {
      throw new RangeError(`uint: btis must be larger than 0, got ${bits}`);
    }
    if (bits > 32) {
      throw new RangeError(`uint: btis must be less or equal to 32, got ${bits}`);
    }
    const seq: BinaryParser<0 | 1, string>[] = [];
    for (let i = 0; i < bits; ++i) {
      seq.push(bit);
    }
    return sequence(seq).map(
      bigEndian
        ? (bs) => bs.reverse().reduce((a, b, i) => a + (b << (bits - 1 - i)), 0 as number)
        : (bs) => bs.reduce((a, b, i) => a + (b << (bits - 1 - i)), 0 as number),
    );
  }
  /** A binary parser which reads an unsigned 8-bit (1 byte) integer as {@link Number} */
  export const uint8 = uint(8);
  /** A binary parser which reads an unsigned 8-bit (1 byte) integer as {@link Number}, Big Endian mode */
  export const uint8BE = uint(8, true);
  /** A binary parser which reads an unsigned 16-bit (2 byte) integer as {@link Number} */
  export const uint16 = uint(16);
  /** A binary parser which reads an unsigned 16-bit (2 byte) integer as {@link Number}, Big Endian mode */
  export const uint16BE = uint(16, true);
  /** A binary parser which reads an unsigned 24-bit (3 byte) integer as {@link Number} */
  export const uint24 = uint(24);
  /** A binary parser which reads an unsigned 24-bit (3 byte) integer as {@link Number}, Big Endian mode */
  export const uint24BE = uint(24, true);
  /** A binary parser which reads an unsigned 32-bit (4 byte) integer as {@link Number} */
  export const uint32 = uint(32);
  /** A binary parser which reads an unsigned 32-bit (4 byte) integer as {@link Number}, BigEndian mode */
  export const uint32BE = uint(32, true);

  const _biZero = BigInt(0);
  const _biOne = BigInt(1);
  /**
   * Create a binary parser which read an unsigned integer from
   * a fixed number of bits into a {@link BigInt}. The number of
   * readable bits is limited by JS environment implementation.
   * @param bits the number of bits to read (bits >= 1)
   * @param bigEndian wether to read the number in Big Endian or Little Endian mode
   * @returns a binary parser which read an unsigned integer with the given specs
   */
  export function biguint(bits: number, bigEndian?: boolean): BinaryParser<bigint, string> {
    if (bits < 1) {
      throw new RangeError(`biguint: btis must be larger than 0, got ${bits}`);
    }
    const seq: BinaryParser<0 | 1, string>[] = [];
    for (let i = 0; i < bits; ++i) {
      seq.push(bit);
    }
    const _biBits = BigInt(bits - 1);
    return sequence(seq).map(
      bigEndian
        ? (bs) => bs.reverse().reduce((a, b, i) => a + ((b ? _biOne : _biZero) << (_biBits - BigInt(i))), _biZero)
        : (bs) => bs.reduce((a, b, i) => a + ((b ? _biOne : _biZero) << (_biBits - BigInt(i))), _biZero),
    );
  }
  /** A binary parser which reads an unsigned 64-bit (8 byte) integer as {@link BigInt} */
  export const uint64 = biguint(64);
  /** A binary parser which reads an unsigned 64-bit (8 byte) integer as {@link BigInt}, Big Endian mode */
  export const uint64BE = biguint(64, true);
  /** A binary parser which reads an unsigned 128-bit (16 byte) integer as {@link BigInt} */
  export const uint128 = biguint(128);
  /** A binary parser which reads an unsigned 128-bit (16 byte) integer as {@link BigInt}, Big Endian mode */
  export const uint128BE = biguint(128, true);
  /** A binary parser which reads an unsigned 256-bit (32 byte) integer as {@link BigInt} */
  export const uint256 = biguint(256);
  /** A binary parser which reads an unsigned 256-bit (32 byte) integer as {@link BigInt}, Big Endian mode */
  export const uint256BE = biguint(256, true);

  /**
   * Create a binary parser which read a signed integer from
   * a fixed number of bits into a {@link Number}. The number of bits must not exceed
   * 32. For integers longer than 32 bits use {@link bigint}
   * @param bits the number of bits to read (1 <= bits <= 32)
   * @param bigEndian wether to read the number in Big Endian or Little Endian mode
   * @returns a binary parser which read a signed integer with the given specs
   */
  export function int(bits: number, bigEndian?: boolean): BinaryParser<number, string> {
    if (bits < 1) {
      throw new RangeError(`int: btis must be larger than 0, got ${bits}`);
    }
    if (bits > 32) {
      throw new RangeError(`int: btis must be less or equal to 32, got ${bits}`);
    }
    const seq: BinaryParser<0 | 1, string>[] = [];
    for (let i = 0; i < bits; ++i) {
      seq.push(bit);
    }
    return sequence(seq).map(
      bigEndian
        ? (bs) =>
            !(bs = bs.reverse())[0]
              ? bs.reduce((a, b, i) => a + (b << (bits - 1 - i)), 0 as number)
              : -(1 + bs.reduce((a, b, i) => a + ((b ? 0 : 1) << (bits - 1 - i)), 0 as number))
        : (bs) =>
            !bs[0]
              ? bs.reduce((a, b, i) => a + (b << (bits - 1 - i)), 0 as number)
              : -(1 + bs.reduce((a, b, i) => a + ((b ? 0 : 1) << (bits - 1 - i)), 0 as number)),
    );
  }
  /** A binary parser which reads a signed 8-bit (1 byte) integer as {@link Number} */
  export const int8 = int(8);
  /** A binary parser which reads a signed 8-bit (1 byte) integer as {@link Number}, Big Endian mode */
  export const int8BE = int(8, true);
  /** A binary parser which reads a signed 16-bit (2 byte) integer as {@link Number} */
  export const int16 = int(16);
  /** A binary parser which reads a signed 16-bit (2 byte) integer as {@link Number}, Big Endian mode */
  export const int16BE = int(16, true);
  /** A binary parser which reads a signed 24-bit (3 byte) integer as {@link Number} */
  export const int24 = int(24);
  /** A binary parser which reads a signed 24-bit (3 byte) integer as {@link Number}, Big Endian mode */
  export const int24BE = int(24, true);
  /** A binary parser which reads a signed 32-bit (4 byte) integer as {@link Number} */
  export const int32 = int(32);
  /** A binary parser which reads a signed 32-bit (4 byte) integer as {@link Number}, Big Endian mode */
  export const int32BE = int(32, true);

  /**
   * Create a binary parser which read a signed integer from
   * a fixed number of bits into a {@link BigInt}. The number of
   * readable bits is limited by JS environment implementation.
   * @param bits the number of bits to read (bits >= 1)
   * @param bigEndian wether to read the number in Big Endian or Little Endian mode
   * @returns a binary parser which read a signed integer with the given specs
   */
  export function bigint(bits: number, bigEndian?: boolean): BinaryParser<bigint, string> {
    if (bits < 1) {
      throw new RangeError(`bigint: btis must be larger than 0, got ${bits}`);
    }
    const seq: BinaryParser<0 | 1, string>[] = [];
    for (let i = 0; i < bits; ++i) {
      seq.push(bit);
    }
    const _biBits = BigInt(bits - 1);
    return sequence(seq).map(
      bigEndian
        ? (bs) =>
            !(bs = bs.reverse())[0]
              ? bs.reduce((a, b, i) => a + ((b ? _biOne : _biZero) << (_biBits - BigInt(i))), _biZero)
              : -(_biOne + bs.reduce((a, b, i) => a + ((b ? _biZero : _biOne) << (_biBits - BigInt(i))), _biZero))
        : (bs) =>
            !bs[0]
              ? bs.reduce((a, b, i) => a + ((b ? _biOne : _biZero) << (_biBits - BigInt(i))), _biZero)
              : -(_biOne + bs.reduce((a, b, i) => a + ((b ? _biZero : _biOne) << (_biBits - BigInt(i))), _biZero)),
    );
  }
  /** A binary parser which reads an unsigned 64-bit (8 byte) integer as {@link BigInt} */
  export const int64 = bigint(64);
  /** A binary parser which reads an unsigned 64-bit (8 byte) integer as {@link BigInt}, Big Endian mode */
  export const int64BE = bigint(64, true);
  /** A binary parser which reads an unsigned 128-bit (16 byte) integer as {@link BigInt} */
  export const int128 = bigint(128);
  /** A binary parser which reads an unsigned 128-bit (16 byte) integer as {@link BigInt}, Big Endian mode */
  export const int128BE = bigint(128, true);
  /** A binary parser which reads an unsigned 256-bit (32 byte) integer as {@link BigInt} */
  export const int256 = bigint(256);
  /** A binary parser which reads an unsigned 256-bit (32 byte) integer as {@link BigInt}, Big Endian mode */
  export const int256BE = bigint(256, true);

  type SequenceOfParsersResult<Parsers extends BinaryParser[]> = Parsers extends []
    ? []
    : Parsers extends [BinaryParser<infer OR>]
    ? [OR]
    : Parsers extends [BinaryParser<infer OR1, infer OE1>, ...infer Rest1]
    ? Rest1 extends [BinaryParser<infer OR2, any, OR1, OE1>, ...infer Rest2]
      ? Rest2 extends BinaryParser[]
        ? [OR1, OR2, ...SequenceOfParsersResult<Rest2>]
        : never
      : never
    : Parsers extends BinaryParser<infer OR>[]
    ? OR[]
    : never;
  type SequenceOfParsersError<Parsers extends BinaryParser[]> = Parsers extends []
    ? never
    : Parsers extends [BinaryParser<any, infer OE>]
    ? OE
    : Parsers extends [BinaryParser<infer OR1, infer OE1>, ...infer Rest1]
    ? Rest1 extends [BinaryParser<any, infer OE2, OR1, OE1>, ...infer Rest2]
      ? Rest2 extends BinaryParser[]
        ? OE1 | OE2 | SequenceOfParsersError<Rest2>
        : never
      : never
    : Parsers extends BinaryParser<any, infer OE>[]
    ? OE
    : never;
  type SequenceOfParsers<Parsers extends BinaryParser[]> = SequenceOfParsersResult<Parsers> extends never
    ? never
    : SequenceOfParsersError<Parsers> extends never
    ? never
    : BinaryParser<SequenceOfParsersResult<Parsers>, SequenceOfParsersError<Parsers>, any, any>;

  /**
   * Create a binary parser which check the concatenation in
   * sequence of the given binary parsers
   * @param parsers an array of binary parsers to concatenate
   * @return a binary parser that is the concatenation in a sequence
   *          of the given binary parsers
   */
  export function sequence<Parsers extends BinaryParser[]>(parsers: Parsers): SequenceOfParsers<Parsers>;
  /**
   * Create a binary parser which check the concatenation in
   * sequence of the given binary parsers
   * @param parsers binary parsers to concatenate
   * @return a binary parser that is the concatenation in a sequence
   *          of the given binary parsers
   */
  export function sequence<Parsers extends BinaryParser[]>(...parsers: Parsers): SequenceOfParsers<Parsers>;
  export function sequence(...parsers: BinaryParser[]): any {
    parsers = _extract(parsers);
    if (!parsers.length) {
      throw new TypeError('sequence: you must provide at least one parser');
    }
    return _binary((state) => {
      let next: BinaryParserOutput = state;
      const results = parsers.map((p) => (next = p(next)).result);
      return _state(next, results);
    });
  }

  type ParserOneOf<Parsers extends BinaryParser[]> = SequenceOfParsersResult<Parsers> extends never
    ? never
    : SequenceOfParsersError<Parsers> extends never
    ? never
    : Parser<OneOf<SequenceOfParsersResult<Parsers>>, SequenceOfParsersError<Parsers>, any, any>;

  /**
   * Create a binary parser which returns the first success state
   * from any given binary parsers.
   * @param parsers an array of binary parsers to test
   * @return a binary parser which test the given binary parsers
   */
  export function oneOf<Parsers extends BinaryParser[]>(parsers: Parsers): ParserOneOf<Parsers>;
  /**
   * Create a binary parser which returns the first success state
   * from any given binary parsers.
   * @param parsers binary parsers to test
   * @return a binary parser which test the given binary parsers
   */
  export function oneOf<Parsers extends BinaryParser[]>(...parsers: Parsers): ParserOneOf<Parsers>;
  export function oneOf(...parsers: BinaryParser[]): ParserOneOf<BinaryParser[]> {
    parsers = _extract(parsers);
    if (!parsers.length) {
      throw new TypeError('oneOf: you must provide at least one parser');
    }
    return _binary((state) => {
      for (const p of parsers) {
        const next = p(state);
        if (!next.isError) {
          return next;
        }
      }
      return _error(state, `oneOf: Unable to match with any parser @ index ${state.index}`);
    }) as any;
  }

  type ManyOf<P> = P extends BinaryParser<infer OR, infer OE, infer IR, infer IE>
    ? BinaryParser<OR[], OE, IR, IE>
    : never;

  /**
   * Create a binary parser which tries to match the given binary parser
   * as many times as possible
   * @param parser the binary parser to test
   * @returns a binary parser which tries to match the given binary parser
   *              as many times as possible
   */
  export function many<P extends BinaryParser>(parser: P): ManyOf<P> {
    if (typeof parser !== 'function') {
      throw new TypeError('many: parser must be a valid parser function');
    }
    return _binary((state) => {
      let next: BinaryParserOutput = state;
      const results: any[] = [];
      while (true) {
        const test: BinaryParserOutput = parser(next);
        if (test.isError) {
          break;
        }
        results.push((next = test).result);
      }
      return _state(next, results);
    }) as any;
  }

  /**
   * Create a binary parser which match at least one time,
   * then as many times as possible, the given binary parser
   * @param parser the binary parser to test
   * @returns a binary parser which match at least one time,
   *          then as many times as possible, the given binary parser
   */
  export function oneOrMore<P extends BinaryParser>(parser: P): ManyOf<P> {
    if (typeof parser !== 'function') {
      throw new TypeError('oneOrMore: parser must be a valid parser function');
    }
    return _binary((state) => {
      let next: BinaryParserOutput = state;
      const results: any[] = [];
      while (true) {
        const test: BinaryParserOutput = parser(next);
        if (test.isError) {
          break;
        }
        results.push((next = test).result);
      }
      if (!results.length) {
        return _error(state, `oneOrMore: Unable to match any input parser @ index ${state.index}`);
      }
      return _state(next, results);
    }) as any;
  }

  /**
   * Create a binary parser which match the given binary parser
   * the given number of times
   * @param parser the binary parser to test
   * @param times how many exact times the binary parser must match
   * @returns a binary parser which match the given binary parser
   *          the given number of times
   */
  export function times<P extends BinaryParser>(parser: P, times: number): ManyOf<P> {
    if (typeof parser !== 'function') {
      throw new TypeError('many: parser must be a valid parser function');
    }
    times = Number(times);
    if (isNaN(times)) {
      throw new TypeError('times: times argument must be a valid number');
    }
    if (times < 1) {
      throw new RangeError(`times: times argument must be at least 1, ${times} given`);
    }
    return _binary((state) => {
      let next: BinaryParserOutput = state;
      const results: any[] = [];
      for (let i = 0; i < times; ++i) {
        next = parser(next);
        if (next.isError) {
          return _error(state, `times: Unable to match the input parser ${times} times @ index ${state.index}`);
        }
        results.push(next.result);
      }
      return _state(next, results);
    }) as any;
  }

  /**
   * Create a binary parser which check the following syntax:
   * `wrapper content wrapper` from the given binary parsers.
   * The resultant binary parser will consider only the output of the
   * content binary parser.\
   * For example, to parse a binary string enclosed by the sequence `0110` you can use
   * `between(sequence(zero, one, one, zero), contentParser)`
   * @param wrapper the wrapper binary parser to match before and after the content
   * @param content the binary parser responsible to match the content
   * @return a binary parser which consider only the wrapped content
   */
  export function between<OR = any, OE = any, IR = any, IE = any>(
    wrapper: BinaryParser<OR, OE, IR, IE>,
    content: BinaryParser<IR, IE, OR, OE>,
  ): BinaryParser<OR, OE, IR, IE>;
  /**
   * Create a binary parser which check the following syntax:
   * `left content rigth` from the given binary parsers.
   * The resultant binary parser will consider only the output of the
   * content binary parser.\
   * For example, to parse a binary string enclosed by the sequence `0110` and `1001` you can use
   * `between(sequence(zero, one, one, zero), contentParser, sequence(one, zero, zero, one))`
   * @param left the binary parser to match before the content
   * @param content the binary parser responsible to match the content
   * @param right the binary parser to match after the content
   * @return a binary parser which consider only the wrapped content
   */
  export function between<OR1 = any, OE1 = any, IR1 = any, IE1 = any, OR2 = any, OE2 = any, OR3 = any, OE3 = any>(
    left: BinaryParser<OR1, OE1, IR1, IE1>,
    content: BinaryParser<OR2, OE2, OR1, OE1>,
    right: BinaryParser<OR3, OE3, OR2, OE2>,
  ): BinaryParser<OR3, OE3, OR2, OE2>;
  export function between(left: BinaryParser, content: BinaryParser, right?: BinaryParser) {
    return sequence(left, content, right || left).map((r) => r[1]);
  }

  /**
   * Generate an high-order function which creates a
   * between expression for a binary parser. This function
   * returns another function which takes the content
   * binary parser as argument and generate a binary parser which will
   * match the following syntax: `wrapper content wrapper`.
   * The resultant binary parser will consider only the output of the
   * content binary parser.\
   * For example, to parse content between the sequence `0110` you can use
   * ```js
   * const contentParser = uint8; // or whatever
   * const betweenSequence = parsebetween(sequence(zero, one, one, zero));
   * const myParser = betweenSequence(contentParser);
   * ```
   * @param wrapper the wrapper binary parser to match before and after the content
   * @return an high-order function which generate a binary between parser expression
   */
  export function parseBetween<OR = any, OE = any, IR = any, IE = any>(
    wrapper: BinaryParser<OR, OE, IR, IE>,
  ): (content: BinaryParser<IR, IE, OR, OE>) => BinaryParser<OR, OE, IR, IE>;
  /**
   * Generate an high-order function which creates a
   * between expression for a binary parser. This function
   * returns another function which takes the content
   * binary parser as argument and generate a binary parser which will
   * match the following syntax: `left content right`.
   * The resultant binary parser will consider only the output of the
   * content binary parser.\
   * For example, to parse content between the sequence `0110` and `1001` you can use
   * ```js
   * const contentParser = uint8; // or whatever
   * const betweenSequence = parsebetween(sequence(zero, one, one, zero), sequence(one, zero, zero, one));
   * const myParser = betweenSequence(contentParser);
   * ```
   * @param left the parser to match before the content
   * @param right the parser to match after the content
   * @return an high-order function which generate a between parser expression
   */
  export function parseBetween<OR1, OE1 = any, IR1 = any, IE1 = any, OR2 = any, OE2 = any, OR3 = any, OE3 = any>(
    left: BinaryParser<OR1, OE1, IR1, IE1>,
    right: BinaryParser<OR3, OE3, OR2, OE2>,
  ): (content: BinaryParser<OR2, OE2, OR1, OE1>) => BinaryParser<OR3, OE3, OR2, OE2>;
  export function parseBetween(left: BinaryParser, right?: BinaryParser) {
    return (content: BinaryParser) => between(left, content, right!);
  }

  /**
   * Generate a binary parser which tries to match one or more
   * times the following syntax: `(content separator)* content`.
   * The resultant binary parser will consider only the output of
   * the content binary parser.\
   * For example, to a list separated by the sequence `000` you can use:
   * `separated(sequence(zero, zero, zero), contentPasrer)`.
   * @param separator the binary parser that matches separator
   * @param content the binary parser that match the content
   * @returns a binary parser which generate a separated expression
   */
  export function separated<OR1 = any, OE1 = any, IE1 = any, OR2 = any, OE2 = any, IE2 = any>(
    separator: BinaryParser<OR1, OE1, OR2, IE1>,
    content: BinaryParser<OR2, OE2, OR1, IE2>,
  ): BinaryParser<OR2[], OE2, OR1, IE2> {
    return _binary((state) => {
      const results: OR2[] = [];
      let next = state;

      while (true) {
        const test = content(next);
        if (test.isError) {
          break;
        }
        results.push(test.result);
        next = test as any;
        const sep = separator(test);
        if (sep.isError) {
          break;
        }
        next = sep;
      }

      if (results.length === 0) {
        return _error(state, `separated: Unable to capture any results @ index ${state.index}`) as any;
      }

      return _state(next, results);
    });
  }

  /**
   * Generate an high-order function which creates a
   * separated expression for a binary parser. This function
   * returns another function which takes the content
   * binary parser as argument and generate a binary parser which will
   * match the following syntax: `(content separator)* content`.
   * The resultant binary parser will consider only the output of the
   * content binary parser.\
   * For example, to parse a list which elements are separated by `0` you can use:
   * ```js
   * const contentParser = uint8; // or whatever
   * const zeroSeparated = parseSeparated(zero);
   * const zeroSeparatedParser = zeroSeparated(contentParser);
   * ```
   * @param separator the binary parser that matches separator
   * @return an high-order function which generate a binary between parser expression
   */
  export function parseSeparated<OR1, OE1, IR1, IE1>(
    separator: BinaryParser<OR1, OE1, IR1, IE1>,
  ): <OR, OE, IE>(content: BinaryParser<OR, OE, OR1, IE>) => BinaryParser<OR[], OE, OR1, IE> {
    return (content: BinaryParser) => separated(separator, content) as any;
  }

  /**
   * Generate a binary parser which will use the given thunk lazily.
   * This is helpful if you need to use binary parsers which depends one
   * on the other:
   * ```js
   * const parserA = lazy(() => sequence(parserB, zero, zero, parserB));
   * const parserB = lazy(() => oneOf(parserA, sequence(zero, zero, one), sequence(one, one, zero)));
   * ```
   * @param thunk the lazy evaluated function which produce a binary parser
   * @param notCached wether to cache or not the output of the thunk (default: `false --> cached`)
   * @returns a binary parser which evaluates lazily the given thunk
   */
  export function lazy<P extends BinaryParser>(thunk: () => P, notCached?: boolean): P {
    if (notCached) {
      return _binary((state) => thunk()(state)) as P;
    }
    let res: P | null = null;
    return _binary((state) => (res ||= thunk())(state)) as P;
  }

  /**
   * Create a binary parser which always produces an error state
   * @param message the message of the error state
   * @returns a failure binary parser
   */
  export function fail<E>(message: E): BinaryParser<any, E> {
    return _binary((state) => _error(state, message));
  }
  /**
   * Create a binary parser which always produces a success binary parser state
   * @param value the result value of the success state
   * @returns a success binary parser
   */
  export function success<T>(value: T): BinaryParser<T> {
    return _binary((state) => _state(state, value));
  }

  type ContextualOneOf<P extends BinaryParser> = P extends BinaryParser<infer R>
    ? R
    : P extends BinaryParser<infer R> | infer Rest
    ? Rest extends BinaryParser
      ? ContextualOneOf<Rest> extends never
        ? never
        : R | ContextualOneOf<Rest>
      : never
    : never;
  type ContextualCB<P extends BinaryParser, R> = () => Generator<P, ContextualOneOf<P> | R, ContextualOneOf<P> | R>;

  /**
   * Create a binary parser which automatically chain the binary parsers produced
   * by a generator function, yielding their parserd binary results states.\
   * See the non binary version of this function for a tip on the usage.
   * @param generator the function that generates the binary parsers to chain
   * @returns a automatically chained binary parser
   */
  export function contextual<P extends BinaryParser = BinaryParser, R = any>(
    generator: ContextualCB<P, R>,
  ): BinaryParser<R> {
    return success(null).chain(() => {
      const iterator = generator();
      function runStep(next: ContextualOneOf<P>): BinaryParser {
        const itResult = iterator.next(next);
        if (itResult.done) {
          return success(itResult.value);
        }
        const nextParser = itResult.value;
        if (typeof nextParser !== 'function') {
          throw new TypeError('contextual: yielded values must always be parsers!');
        }
        return nextParser.chain(runStep);
      }
      return runStep(undefined as any);
    });
  }

  const _asBinaryRep = /\s+/g;
  /**
   * Utility function to convert a string or an array
   * into a buffer. Note that all non-zero characters
   * are considered as a one bit, as well as any non
   * truish numeric values (eg. `0, NaN`).
   * @param value the value to being converted
   * @returns the converted buffer as a {@link DataView}
   */
  export function asBinary(value: string | (boolean | 1 | 0 | '1' | '0')[]): DataView {
    if (typeof value === 'string') {
      value = value
        .replace(_asBinaryRep, '')
        .split('')
        .map((v) => v === '1');
    }
    const output: number[] = [];
    const len = Math.ceil(value.length / 8);
    for (let i = 0; i < len; ++i) {
      output[i] = 0;
      for (let j = 0; j < 8; ++j) {
        output[i] |= (Number(value[i * 8 + j]) ? 1 : 0) << (7 - j);
      }
    }
    const buf = new Uint8Array(output);
    return new DataView(buf.buffer);
  }

  /**
   * Converts a string to a byte array buffer
   * @param value the string to convert
   * @returns the converted buffer as a {@link DataView}
   */
  export function toCharCode(value: string): DataView {
    return new DataView(new Uint8Array(value.split('').map((v) => v.charCodeAt(0))).buffer);
  }
}

export default {
  binary,
  between,
  contextual,
  digits,
  end,
  eof,
  eoi,
  fail,
  lazy,
  letters,
  many,
  match,
  parseBetween,
  parseSeparated,
  parser,
  success,
  separated,
  sequence,
  spaces,
  state,
  times,
  oneOf,
  oneOrMore,
};
