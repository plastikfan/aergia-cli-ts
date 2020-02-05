
import * as R from 'ramda';
import * as types from '../types';

/**
 * @method uniquePairs
 * @description Returns the list containing all unique combination of pairs
 * of the members of @sequence.
 *
 * @export
 * @template T
 * @param {T[]} sequence
 * @param {*} [get=(v: T): any => v]
 * @param {*} [equals=(first: any, second: any): boolean => {
 *     return first === second;
 *   }]
 * @returns {Array<[any, any]>}
 */
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

/**
 * @method startsWithAny
 * @description If @valueStr begins with any of the strings in @strings then
 * returns true otherwise false.
 *
 * @export
 * @param {string[]} strings
 * @param {string} valueStr
 * @returns {boolean}
 */
export function startsWithAny (strings: string[], valueStr: string)
  : boolean {
  let result = false;
  strings.some((val: string): boolean => {
    result = valueStr.startsWith(val);
    return result;
  });

  return result;
}

/**
 * @method findDescendant
 * @description
 *
 * @export
 * @param {string} descendant
 * @param {any[]} descendants
 * @returns {*}
 * @memberof YargsBuilderImpl
 */
export function findDescendant (descendant: string, descendants: any[], elementLabel: string)
  : any {
  return R.find((el: any): boolean => {
    return el[elementLabel] === descendant;
  })(descendants);
} // findDescendant

export function findDescendantWithIndex (descendant: string, descendants: any[], elementLabel: string)
  : { descendant: any; index: number } {

  const fn = (el: any): boolean => {
    return el[elementLabel] === descendant;
  };

  return {
    descendant: R.find(fn)(descendants),
    index: R.findIndex(fn)(descendants)
  };
}

/**
 * @method pickArguments
 * @description Picks either the positional or non-positional arguments
 * from @commandArgumentsObj.
 *
 * @export
 * @param {*} commandArgumentsObj
 * @param {string} positionalDef
 * @param {('positional' | 'nonpositional')} [positionalType='nonpositional']
 * @returns {*}
 */
export function pickArguments (commandArgumentsObj: any, positionalDef: string,
  positionalType: 'positional' | 'nonpositional' = 'nonpositional')
  : any {
  const pickedArguments = R.split(' ')(positionalDef);

  return R.pickBy((val, key): boolean => positionalType === 'nonpositional'
    ? !R.includes(key, pickedArguments) : R.includes(key, pickedArguments)
  )(commandArgumentsObj);
} // pickArguments
