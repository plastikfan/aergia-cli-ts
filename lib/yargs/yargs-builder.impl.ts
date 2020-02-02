import { functify } from 'jinxed';
import * as yargs from 'yargs';
import * as R from 'ramda';
import * as types from '../types';
import * as helpers from '../../lib/utils/helpers';

function defaultOptionHandler (yin: yargs.Argv, optionName: string, optionDef: { [key: string]: any },
  _: types.IAeYargsOptionHandler,
  positional: boolean)
  : yargs.Argv {

  return positional
    ? yin.positional(optionName, optionDef)
    : yin.option(optionDef);
}

/**
 * @export
 * @class YargsBuilderImpl
 */
export class YargsBuilderImpl {

  constructor (private handler: types.IAeYargsOptionHandler | null,
    private schema: types.IAeYargsSchema) { }

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
    fail: (msg: string, err: Error, yin: yargs.Argv, ac: any) => yargs.Argv)
    : yargs.Argv {

    return this.command(instance.fail((m: string, e: Error, yin: yargs.Argv): yargs.Argv => {
      return fail(m, e, yin, adaptedCommand);
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

    let result = instance;
    const name: string = R.prop(this.schema.labels.commandName)(adaptedCommand);
    const description: string = R.prop('description')(adaptedCommand);
    const descendants: any = R.prop(this.schema.labels.descendants)(adaptedCommand);

    if (descendants instanceof Array) {
      const commandArguments = helpers.findDescendant(
        this.schema.labels.commandOptions, descendants, this.schema.labels.elements);

      const positionalDef = this.positionalDef(
        instance, name, R.prop('positional')(adaptedCommand), commandArguments);

      let positionalCommandDef = name;
      if (R.has('positional')(adaptedCommand)) {
        positionalCommandDef = positionalDef.positionalDef;
        instance = positionalDef.y;
      }

      result = instance.command(positionalCommandDef, description,
        (yin: yargs.Argv): yargs.Argv => {
          yin = this.handleOptions(yin, commandArguments, positionalDef.positionalDef);
          const validationGroups = helpers.findDescendant(
            this.schema.labels.validationGroups, descendants, this.schema.labels.elements);
          yin = this.handleValidationGroups(yin, validationGroups);

          return yin;
        });
    }
    return result;
  } // command

  /**
   * @method positionalDef
   * @description Processes the positional directive on the command. The positional
   * definition should not contain mandatory/optional indicators, rather, that is
   * specified in the argument definition which this method picks up and applies
   * accordingly.
   *
   * @public
   * @param {yargs.Argv} instance
   * @param {string} commandName
   * @param {string} positionalStr
   * @param {{ [key: string]: {}}} argumentsMap
   * @returns {{ positionalDef: string, y: yargs.Argv }}
   * @memberof YargsBuilderImpl
   */
  public positionalDef (instance: yargs.Argv,
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
   * @public
   * @param {yargs.Argv} instance
   * @param {string} argumentName
   * @param {*} commandArgumentsObj
   * @returns {yargs.Argv}
   * @memberof YargsBuilderImpl
   */
  public positional (instance: yargs.Argv, argumentName: string, commandArgumentsObj: any)
  : yargs.Argv {
    let result = instance;
    if (R.has(argumentName)(commandArgumentsObj)) {
      const def: yargs.PositionalOptions = R.prop(argumentName)(commandArgumentsObj);

      result = (this.handler)
        ? this.handler(instance, argumentName, def, defaultOptionHandler, true)
        : instance.positional(argumentName, def);
    }
    return result;
  } // positional

  /**
   * @method handleOptions
   * @description
   *
   * @public
   * @param {yargs.Argv} instance
   * @param {*} commandArgumentsObj
   * @param {string} positionalDef
   * @returns {yargs.Argv}
   * @memberof YargsBuilderImpl
   */
  public handleOptions (instance: yargs.Argv, commandArgumentsObj: any, positionalDef: string)
  : yargs.Argv {
    let result = instance;

    if (commandArgumentsObj instanceof Object) {
      const argumentsDescendants: any = R.prop(this.schema.labels.descendants)(commandArgumentsObj);

      if ((argumentsDescendants instanceof Object) && !(argumentsDescendants instanceof Array)) {

        // first need to remove the positional arguments as they have already been
        // processed.
        //
        const nonPositional = helpers.pickArguments(commandArgumentsObj, positionalDef);

        result = (this.handler)
          ? R.reduce((acc: yargs.Argv, pair: [string, any]): yargs.Argv => {
            const argumentName = pair[0];
            let argumentDef: { [key: string]: any } = pair[1];

            // @ts-ignore: Object is possibly 'null'.
            return this.handler(acc, argumentName, argumentDef, defaultOptionHandler, false);
          }, instance)(R.toPairs(nonPositional))
          : instance.options(nonPositional);
      }
    }

    return result;
  } // handleArguments

  /**
   * @method handleValidationGroups
   * @description
   *
   * @public
   * @param {yargs.Argv} instance
   * @param {*} argumentGroupsObj
   * @returns {yargs.Argv}
   * @memberof YargsBuilderImpl
   */
  public handleValidationGroups (instance: yargs.Argv, argumentGroupsObj: any)
    : yargs.Argv {
    let result = instance;

    if (argumentGroupsObj instanceof Object) {
      const groupsDescendants: any = R.prop(this.schema.labels.descendants)(argumentGroupsObj);

      if (groupsDescendants instanceof Array) {
        result = R.reduce((validatorAcc: yargs.Argv, validator: { [key: string]: any }): yargs.Argv => {

          const validatorDescendants: any = validator[this.schema.labels.descendants];
          if (validatorDescendants instanceof Array) {
            const validatorType: string = validator[this.schema.labels.elements];

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
