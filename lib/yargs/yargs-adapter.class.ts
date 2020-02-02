
import * as R from 'ramda';
import * as types from '../types';

/**
 * @export
 * @class YargsAdapter
 * @implements {types.IYargsAdapter}
 * @description
 */
export class YargsAdapter implements types.IYargsAdapter {

  public adapt (command: any): any {

    return R.clone(command);
  }

  /* collect the mandatory options */

  private prepareValidationGroups (command: any): any {

    const descendants: any = R.prop(types.labels.descendants)(command);

    if (R.is(Array)(descendants)) {
      // find ArgumentGroups
    }

    return command;
  }
}
