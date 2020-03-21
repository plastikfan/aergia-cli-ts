import * as R from 'ramda';
import * as xiberia from '../xiberia.local';
import * as types from '../types';
import * as helpers from '../utils/helpers';

/**
 * @export
 * @class YargsAdapter
 * @implements {types.IYargsAdapter}
 * @description
 */
export class YargsAdapter implements types.IYargsAdapter {
  constructor (private schema: xiberia.IJsonConversionSchema) { }

  /**
   * @method adapt
   * @description Make adaptations to the command to remove anything that is not required by
   * yargs.
   *
   * @param {*} command
   * @returns {*}
   * @memberof YargsAdapter
   */
  public adapt (command: { [key: string]: any }): any {
    const adaptedCommand = R.clone(command);
    const descendants: any = R.prop(this.schema.labels.descendants)(adaptedCommand);

    if (descendants) {
      const found: { descendant: any; index: number } = helpers.findDescendantWithIndex(
        this.schema.labels.commandOptions, descendants, this.schema.labels.elements);

      let commandArgumentsObj = found.descendant;

      if (commandArgumentsObj) {
        // Filter out exclusions from the command options
        //
        const commandArguments: { [key: string]: any } = R.prop(
          this.schema.labels.descendants)(commandArgumentsObj);

        type OptionDefType = { [key: string]: any };
        type OptionDefPair = [string, OptionDefType];
        type OptionDefSequence = OptionDefPair[];

        const commandArgumentsPairs: OptionDefSequence = R.map(
          (pair: OptionDefPair): OptionDefPair => {
            const optionName = pair[0];
            const optionDef: OptionDefType = pair[1];

            const pickedProperties: OptionDefType = R.pickBy(
              (pickedDef: OptionDefType, key: string): boolean => {
                return !R.includes(key)(this.schema.exclusions.options);
              })(optionDef);

            return [optionName, pickedProperties];
          })(R.toPairs(commandArguments));

        const pickedArguments = R.fromPairs(commandArgumentsPairs);
        commandArgumentsObj = R.set(R.lensProp(
          this.schema.labels.descendants), pickedArguments
        )(commandArgumentsObj);

        descendants[found.index] = commandArgumentsObj;
      }
    }

    return adaptedCommand;
  }
} // adapt
