
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

  constructor (private schema: types.IAeYargsSchema) { }

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
    const descendants: any = R.prop(this.schema.labels.descendants)(adaptedCommand);

    if (descendants) {
      const commandArgumentsObj = helpers.findDescendant(
        this.schema.labels.commandOptions, descendants, this.schema.labels.elements);

      if (commandArgumentsObj) {
        // Filter out exclusions from the command options
        //
        const commandArguments = R.prop(this.schema.labels.descendants)(commandArgumentsObj);
        const pickedArguments = R.pickBy((val: { [key: string]: any }, key: string): boolean => {
          return !R.includes(key)(this.schema.exclusions);
        })(commandArguments);

        R.set(R.lensProp(this.schema.labels.descendants), pickedArguments)(commandArgumentsObj);
      }
    }

    return adaptedCommand;
  }
} // adapt
