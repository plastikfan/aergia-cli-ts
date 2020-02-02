
import * as R from 'ramda';
import * as types from '../types';
import * as helpers from '../utils/helpers';

/**
 * @export
 * @class YargsAdapter
 * @implements {types.IYargsAdapter}
 * @description
 */
export class YargsAdapter implements types.IYargsAdapter {

  constructor (private exclusions: string[]) { }

  /**
   * @method adapt
   * @description Make adaptations to the command to remove anything that is not required by
   * yargs.
   *
   * @param {*} command
   * @returns {*}
   * @memberof YargsAdapter
   */
  public adapt (command: any): any {
    const adaptedCommand = R.clone(command);
    const descendants: any = R.prop(types.labels.descendants)(adaptedCommand);

    if (descendants) {
      const commandArgumentsObj = helpers.findDescendant(types.labels.commandOptions, descendants);

      if (commandArgumentsObj) {
        // Filter out exclusions from the command options
        //
        const commandArguments = R.prop(types.labels.descendants)(commandArgumentsObj);
        const pickedArguments = R.pickBy((val: { [key: string]: any }, key: string): boolean => {
          return !R.includes(key)(this.exclusions);
        })(commandArguments);

        R.set(R.lensProp(types.labels.descendants), pickedArguments)(commandArgumentsObj);
      }
    }

    return adaptedCommand;
  }
} // adapt
