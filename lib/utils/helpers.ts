
import * as R from 'ramda';

export function uniquePairs<T> (sequence: T[],
  get = (v: T): any => v,
  equals = (first: any, second: any): boolean => {
    return first === second;
  })
  : Array<[any, any]> {
  if (sequence.length < 2) {
    return [];
  }
  if (sequence.length === 2) {
    return [[get(sequence[0]), get(sequence[1])]];
  }
  let count = 0;
  const unique = R.reduce((outerAcc: Array<[any, any]>, outer: T): Array<[any, any]> => {
    const first = get(outer);
    const outerSeq = sequence.slice(count + 1);

    R.forEach((inner: T): void => {
      const second = get(inner);
      outerAcc.push([first, second]);
    })(outerSeq);

    count++;
    return outerAcc;
  }, [])(R.uniqWith(equals, sequence));
  return unique;
}

export function startsWithAny (strings: string[], valueStr: string)
  : boolean {
  let result = false;
  strings.some((val: string): boolean => {
    result = valueStr.startsWith(val);
    return result;
  });

  return result;
}
