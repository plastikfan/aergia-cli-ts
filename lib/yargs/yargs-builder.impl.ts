import * as yargs from 'yargs';
import * as R from 'ramda';
import * as types from '../types';
import * as helpers from '../../lib/utils/helpers';

/**
 * @export
 * @class YargsBuilderImpl
 */
export class YargsBuilderImpl {

  /**
   * @method buildCommand
   * @description
   *
   * @param {yargs.Argv} instance
   * @param {*} adaptedCommand
   * @param {(msg: string, err: Error, inst: yargs.Argv, ac: any) => yargs.Argv} fail
   * @returns {yargs.Argv}
   * @memberof YargsBuilderImpl
   */
  public buildCommand (instance: yargs.Argv, adaptedCommand: any,
    fail: (msg: string, err: Error, inst: yargs.Argv, ac: any) => yargs.Argv)
    : yargs.Argv {

    return this.command(instance.fail((m: string, e: Error, inst: yargs.Argv): yargs.Argv => {
      return fail(m, e, inst, adaptedCommand);
    }), adaptedCommand);
  } // buildCommand

  /**
   * @method command
   * @description Builds the command
   *
   * @param {yargs.Argv} instance
   * @param {*} adaptedCommand
   * @returns {yargs.Argv}
   * @memberof YargsBuilderImpl
   */
  public command (instance: yargs.Argv, adaptedCommand: any): yargs.Argv {

    // A note about literal references: Any literal reference must be something that is
    // defined on the cli api. It's ok below to refer to 'description' with a literal, because
    // it's part of the yargs domain specific language. However, '_children' is not, actually
    // that's part of an external DSL (Zenobia), so that should be passed in via a
    // variable.
    //
    const name: string = R.prop(types.labels.commandName)(adaptedCommand);
    const description: string = R.prop('description')(adaptedCommand);
    const descendants: any = R.prop(types.labels.descendants)(adaptedCommand);

    if (descendants instanceof Array) {
      const commandArguments = this.findDescendant(types.labels.commandOptions, descendants);

      const positionalDef = this.positionalDef(
        instance, name, R.prop('positional')(adaptedCommand), commandArguments);

      let positionalCommandDef = name;
      if (R.has('positional')(adaptedCommand)) {
        positionalCommandDef = positionalDef.positionalDef;
        instance = positionalDef.y;
      }

      instance = instance.command(positionalCommandDef, description,
        (yin: yargs.Argv): yargs.Argv => {
          yin = this.handleOptions(yin, commandArguments, positionalDef.positionalDef);
          const validationGroups = this.findDescendant(types.labels.validationGroups, descendants);
          yin = this.handleValidationGroups(yin, validationGroups);

          return yin;
        });
    }
    return instance;
  } // command

  /**
   * @method findDescendant
   * @description
   *
   * @private
   * @param {string} descendant
   * @param {any[]} descendants
   * @returns {*}
   * @memberof YargsBuilderImpl
   */
  private findDescendant (descendant: string, descendants: any[]): any {
    return R.find((el: any): boolean => {
      return el[types.labels.elementLabel] === descendant;
    })(descendants);
  } // findDescendant

  /**
   * @method positionalDef
   * @description Processes the positional directive on the command. The positional
   * definition should not contain mandatory/optional indicators, rather, that is
   * specified in the argument definition which this method picks up and applies
   * accordingly.
   *
   * @private
   * @param {yargs.Argv} instance
   * @param {string} commandName
   * @param {string} positionalStr
   * @param {{ [key: string]: {}}} argumentsMap
   * @returns {{ positionalDef: string, y: yargs.Argv }}
   * @memberof YargsBuilderImpl
   */
  private positionalDef (instance: yargs.Argv,
    commandName: string,
    positionalStr: string,
    argumentsMap: { [key: string]: {}})
    : { positionalDef: string, y: yargs.Argv } {

    let yin = instance;
    const positionalArguments = R.split(' ')(positionalStr);
    const def = R.reduce((acc: string, argument: string): string => {
      const argumentDef: any = argumentsMap[argument];

      if (argumentDef instanceof Object) {
        const optional = R.defaultTo(false, R.prop('optional')(argumentDef));
        const result = optional ? `[${argument}] ` : `<${argument}> `;

        yin = this.positional(instance, argument, argumentsMap[argument]);
        return R.concat(acc, R.trim(result));
      } else {
        throw new Error(`Positional argument: "${argument} not correctly defined if at all"`);
      }
    }, '')(positionalArguments);

    return {
      positionalDef: `${commandName} ${def}`,
      y: yin
    };
  } // positionalDef

  /**
   * @method positional
   * @description Invokes positional on the yargs instance for the argument name
   * specified.
   *
   * @private
   * @param {yargs.Argv} instance
   * @param {string} argumentName
   * @param {*} commandArgumentsObj
   * @returns {yargs.Argv}
   * @memberof YargsBuilderImpl
   */
  private positional (instance: yargs.Argv, argumentName: string, commandArgumentsObj: any)
  : yargs.Argv {
    let result = instance;
    if (R.has(argumentName)(commandArgumentsObj)) {
      const def: yargs.PositionalOptions = R.prop(argumentName)(commandArgumentsObj);
      instance = instance.positional(argumentName, def);
    }
    return result;
  } // positional

  // we can defined an alternative version (of handleArguments) that deals with the
  // arguments one by one and allows the user to define handlers for functions like coerce.
  // keys that can take a function are:
  // - coerce
  // - configParser
  //

  /**
   * @method pickNonPositionalArguments
   * @description
   *
   * @private
   * @param {*} commandArgumentsObj
   * @param {string} positionalDef
   * @returns {*}
   * @memberof YargsBuilderImpl
   */
  private pickNonPositionalArguments (commandArgumentsObj: any, positionalDef: string)
  : any {
    const positionalArguments = R.split(' ')(positionalDef);
    return R.pickBy((val, key): boolean => {
      return !R.includes(key, positionalArguments);
    })(commandArgumentsObj);
  } // pickNonPositionalArguments

  /**
   * @method handleOptions
   * @description
   *
   * @private
   * @param {yargs.Argv} instance
   * @param {*} commandArgumentsObj
   * @param {string} positionalDef
   * @returns {yargs.Argv}
   * @memberof YargsBuilderImpl
   */
  private handleOptions (instance: yargs.Argv, commandArgumentsObj: any, positionalDef: string)
  : yargs.Argv {
    let result = instance;

    if (commandArgumentsObj instanceof Object) {
      const argumentsDescendants: any = R.prop(types.labels.descendants)(commandArgumentsObj);

      if ((argumentsDescendants instanceof Object) && !(argumentsDescendants instanceof Array)) {

        // first need to remove the positional arguments as they have already been
        // processed.
        //
        const nonPositional = this.pickNonPositionalArguments(commandArgumentsObj, positionalDef);

        // yargs interface yargs.Options may be useful
        //
        // NB: This may fail on encountering '_', so this might need to be removed
        // by the adapter
        //
        // Also, "optional" may have to be striped out or handled differently
        //
        result = instance.options(nonPositional);
      }
    }

    return result;
  } // handleArguments

  /**
   * @method handleValidationGroups
   * @description
   *
   * @private
   * @param {yargs.Argv} instance
   * @param {*} argumentGroupsObj
   * @returns {yargs.Argv}
   * @memberof YargsBuilderImpl
   */
  private handleValidationGroups (instance: yargs.Argv, argumentGroupsObj: any)
    : yargs.Argv {
    let result = instance;

    if (argumentGroupsObj instanceof Object) {
      const groupsDescendants: any = R.prop(types.labels.descendants)(argumentGroupsObj);

      if (groupsDescendants instanceof Array) {
        result = R.reduce((validatorAcc: yargs.Argv, validator: { [key: string]: any }): yargs.Argv => {

          const validatorDescendants: any = validator[types.labels.descendants];
          if (validatorDescendants instanceof Array) {
            const validatorType: string = validator[types.labels.elementLabel];

            if (R.includes(validatorType)(['Conflicts', 'Implies'])) {
              const get = (argumentRef: { name: string }) => argumentRef.name;
              const equals = (argumentRefA: { name: string }, argumentRefB: { name: string }): boolean => {
                return argumentRefA.name === argumentRefB.name;
              };
              const pairs = helpers.uniquePairs(validatorDescendants, get, equals);

              validatorAcc = R.reduce((innerAcc: yargs.Argv, pair: any): yargs.Argv => {
                switch (validatorType) {
                  case 'Conflicts':
                    return innerAcc.conflicts(pair[0], pair[1]);

                  case 'Implies':
                    return innerAcc.implies(pair[0], pair[1]);
                }
                return innerAcc;
              }, instance)(pairs);
            }
          }
          return validatorAcc;
        }, instance)(groupsDescendants);
      }
    }
    return result;
  } // handleValidationGroups
} // YargsBuilderImpl
