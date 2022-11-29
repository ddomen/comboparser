export function checkOutput(
    output: any,
    source: string,
    index: number,
    result: any,
    error: any = null,
    isError?: boolean
) {
    isError = !!(
        isError === false ? false :
        (isError || error !== null)
    );
    expect(output).not.toBeNull();
    expect(output).toEqual({ source, index, result, isError, error });
    expect(output.source).toStrictEqual(source);
    expect(output.index).toStrictEqual(index);
    expect(output.isError).toStrictEqual(isError);
    if (result && typeof(result) === 'object') { expect(output.result).toStrictEqual(result); }
    else { expect(output.result).toEqual(result); }
    expect(output.error).toStrictEqual(error);
}

export function matchError(source: string, expression: string | RegExp, index: number = 0) {
    if (expression instanceof RegExp && expression.source[0] !== '^') {
        expression = new RegExp('^' + expression.source, expression.ignoreCase ? 'i' : '');
    }
    const content = expression instanceof RegExp ? source.slice(index, index + 20) :
                    source.slice(index, index + expression.length); 
    return `match: Tried to match '${expression}', but got '${content}' @ index ${index}`;
}