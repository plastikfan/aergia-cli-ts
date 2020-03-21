import * as yargs from 'yargs';
import * as R from 'ramda';
import * as xiberia from '../xiberia.local';
import * as types from '../types';
import { YargsAdapter } from './yargs-adapter.class';
import { YargsBuilderImpl } from './yargs-builder.impl';

/**
 * @export
 * @class YargsBuilder
 */
export class YargsBuilder {
  /**
   * @description Creates an instance of YargsBuilder.
   * @param {yargs.Argv} instance
   * @param {types.IAeYargsSchema} schema
   * @param {xiberia.IAeYargsBuildHandlers} [handlers]
   * @param {types.IYargsAdapter} [adapter]
   * @param {YargsBuilderImpl} [impl]
   * @memberof YargsBuilder
   */
  constructor (private instance: yargs.Argv,
    private schema: xiberia.IJsonConversionSchema,
    private handlers?: xiberia.IAeYargsBuildHandlers,
    private adapter?: types.IYargsAdapter,
    private impl?: YargsBuilderImpl
  ) {
    this.adapter = adapter ?? new YargsAdapter(schema);
    this.impl = impl ?? new YargsBuilderImpl(schema, handlers);
  }

  /**
   * @method buildCommand
   * @description build a single command
   *
   * @param {{ [key: string]: any }} command
   * @param {types.IAeYargsOptionHandler} [optionHandler]
   * @returns {yargs.Argv}
   * @memberof YargsBuilder
   */
  public buildCommand (command: { [key: string]: any }, optionHandler?: xiberia.IAeYargsOptionHandler)
  : yargs.Argv {
    const adaptedCommand = this.adapter!.adapt(command);
    return this.impl!.buildCommand(this.instance, adaptedCommand, optionHandler);
  }

  /**
   * @method buildAllCommands
   * @description builds all the commands in the @container at the location specified
   * by "paths/collective" in the schema.
   *
   * @param {{ [key: string]: any }} container
   * @param {types.IAeYargsOptionHandler} [optionHandler]
   * @returns {yargs.Argv}
   * @memberof YargsBuilder
   */
  public buildAllCommands (container: { [key: string]: any }, optionHandler?: xiberia.IAeYargsOptionHandler)
  : yargs.Argv {
    const collectiveLens = R.lensPath(R.split('/')(this.schema.paths.collective));
    const collective = R.view(collectiveLens)(container);

    if (collective) {
      if (collective instanceof Array) {
        this.instance = R.reduce((acc: yargs.Argv, command: { [key: string]: any }): yargs.Argv => {
          const adaptedCommand = this.adapter!.adapt(command);
          return this.impl!.buildCommand(acc, adaptedCommand, optionHandler);
        }, this.instance)(collective);
      } else if (collective instanceof Object) {
        const commandKeys = R.keys(collective);

        this.instance = R.reduce((acc: yargs.Argv, key: string): yargs.Argv => {
          const command = (collective as { [key: string]: any })[key];
          const adaptedCommand = this.adapter!.adapt(command);
          return this.impl!.buildCommand(acc, adaptedCommand, optionHandler);
        }, this.instance)(commandKeys);
      } else {
        throw new Error(`Commands found at path: ${this.schema.paths.collective} is malformed.`);
      }
    } else {
      throw new Error(`Couldn't find commands at path: ${this.schema.paths.collective}`);
    }
    return this.instance;
  }

  /**
   * @description To be called by the user to indicate cli has finished being
   * built and parsing should be executed.
   *
   * @param {yargs.Argv} instance
   * @returns {{}}
   * @memberof YargsBuilder
   */
  public go (instance: yargs.Argv)
  : {} {
    return instance.argv;
  }
} // YargsBuilder
