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
  public command (instance: yargs.Argv, adaptedCommand: any)
    : yargs.Argv {

    let result = instance;
    const commandName: string = R.prop(this.schema.labels.commandName)(adaptedCommand);
    const description: string = R.prop('describe')(adaptedCommand);
    const descendants: any = R.prop(this.schema.labels.descendants)(adaptedCommand);

    if (descendants instanceof Array) {
      const commandArgumentsObj = helpers.findDescendant(
        this.schema.labels.commandOptions, descendants, this.schema.labels.elements);
      const argumentsDescendants: any = R.prop(this.schema.labels.descendants)(commandArgumentsObj);

      const positionalDef: string = R.prop('positional')(adaptedCommand);
      const commandDescription = positionalDef
        ? this.decoratePositionalDef(commandName, positionalDef, argumentsDescendants)
        : commandName;

      // console.log(`@@@ hasPositional: "${hasPositional}"`);
      // console.log(`@@@ positionalDef: "${positionalDef}"`);
      // console.log(`@@@ positionalCommandDef: "${commandDescription}"`);

      result = instance.command(commandDescription, description,
        (yin: yargs.Argv): yargs.Argv => { // builder
          console.log(`### building command: ${commandName} [${description}], args: ${functify(commandArgumentsObj)}`);

          if (positionalDef) {
            yin = this.handlePositional(yin, positionalDef, argumentsDescendants);
          }

          yin = this.handleOptions(yin, positionalDef, argumentsDescendants);

          const validationGroupsObj = helpers.findDescendant(
            this.schema.labels.validationGroups, descendants, this.schema.labels.elements);

          if (validationGroupsObj) {
            const groupsDescendants: any = R.prop(this.schema.labels.descendants)(validationGroupsObj);
            yin = this.handleValidationGroups(yin, groupsDescendants);
          }
          return yin;
        });
    }
    return result;
  } // command

  /**
   * @method decoratePositionalDef
   * @description Creates the positional definition string, required to create
   * the command. The positional definition should not contain mandatory/optional
   * indicators, rather, that is specified in the argument definition which this method
   * picks up and applies accordingly.
   *
   * @public
   * @param {string} commandName
   * @param {string} positionalStr
   * @param {{ [key: string]: {}}} argumentsMap
   * @returns {string}
   * @memberof YargsBuilderImpl
   */
  public decoratePositionalDef (commandName: string,
    positionalStr: string,
    argumentsMap: { [key: string]: {}})
    : string {
    if (!positionalStr || positionalStr === '') {
      return '';
    }
    const positionalArguments = R.split(' ')(positionalStr);
    const def = R.reduce((acc: string, argument: string): string => {
      const argumentDef: any = argumentsMap[argument];

      if (argumentDef instanceof Object) {
        const optional = R.defaultTo(false, R.prop('demandOption')(argumentDef));
        const result = optional ? `[${argument}] ` : `<${argument}> `;

        return R.concat(acc, result);
      } else {
        throw new Error(`Positional argument: "${argument} not correctly defined if at all"`);
      }
    }, '')(positionalArguments.slice(1)); // ignore first token => command name

    const result = (`${commandName} ${def.trim()}`).trim();
    return result;
  } // positionalDef

  /**
   * @method handlePositional
   * @description Processes the positional directive on the command.
   *
   * @param {yargs.Argv} instance
   * @param {string} positionalStr
   * @param {{ [key: string]: {} }} argumentsMap
   * @returns {yargs.Argv}
   * @memberof YargsBuilderImpl
   */
  public handlePositional (instance: yargs.Argv,
    positionalStr: string,
    argumentsMap: { [key: string]: {} })
    : yargs.Argv {
    let yin = instance;

    console.log(`>>> handlePositional ${positionalStr}`);

    if (positionalStr && positionalStr !== '') {
      console.log(`>>> argumentsMap: ${functify(argumentsMap)}`);
      const positionalArguments = (R.split(' ')(positionalStr));

      yin = R.reduce((acc: yargs.Argv, argument: string): yargs.Argv => {
        const argumentDef: any = argumentsMap[argument]; // being called with decorated arg name

        if (argumentDef instanceof Object) {
          return this.positional(acc, argument, argumentsMap[argument]);
        } else {
          throw new Error(`Positional argument: "${argument} not correctly defined if at all"`);
        }
      }, yin)(positionalArguments);
    }

    return yin;
  } // handlePositional

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
    const IS_POSITIONAL = true;
    let result = instance;

    if (R.has(argumentName)(commandArgumentsObj)) {
      const def: yargs.PositionalOptions = R.prop(argumentName)(commandArgumentsObj);

      result = (this.handler)
        ? this.handler(instance, argumentName, def, defaultOptionHandler, IS_POSITIONAL)
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
   * @param {*} argumentsMap
   * @param {string} positionalDef
   * @returns {yargs.Argv}
   * @memberof YargsBuilderImpl
   */
  public handleOptions (instance: yargs.Argv, positionalDef: string, argumentsMap: {})
  : yargs.Argv {
    const NON_POSITIONAL = false;
    let result = instance;

    if (!(argumentsMap instanceof Array)) {
      // first need to remove the positional arguments as they have already been
      // processed.
      //
      const nonPositional = helpers.pickArguments(argumentsMap, positionalDef ?? '');

      result = (this.handler)
        ? R.reduce((acc: yargs.Argv, pair: [string, any]): yargs.Argv => {
          const argumentName = pair[0];
          let argumentDef: { [key: string]: any } = pair[1];

          return this.handler!(acc, argumentName, argumentDef, defaultOptionHandler, NON_POSITIONAL);
        }, instance)(R.toPairs(nonPositional))
        : instance.options(nonPositional);
    }

    return result;
  } // handleArguments

  /**
   * @method handleValidationGroups
   * @description
   *
   * @public
   * @param {yargs.Argv} instance
   * @param {*} validationGroups
   * @returns {yargs.Argv}
   * @memberof YargsBuilderImpl
   */
  public handleValidationGroups (instance: yargs.Argv, validationGroups: any[])
    : yargs.Argv {
    const result = R.reduce((validatorAcc: yargs.Argv, validator: { [key: string]: any }): yargs.Argv => {
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
    }, instance)(validationGroups);

    return result;
  } // handleValidationGroups
} // YargsBuilderImpl
