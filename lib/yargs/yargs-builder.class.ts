import * as yargs from 'yargs';
import * as types from '../types';
import { YargsAdapter } from './yargs-adapter.class';
import { YargsBuilderImpl } from './yargs-builder.impl';

export class YargsBuilder {

  constructor (private instance: yargs.Argv,
    private schema: types.IAeYargsSchema,
    private handlers?: types.IAeYargsBuildHandlers,
    private adapter?: types.IYargsAdapter,
    private impl?: YargsBuilderImpl
  ) {
    this.adapter = adapter ?? new YargsAdapter(schema);
    this.impl = impl ?? new YargsBuilderImpl(schema, handlers);
  }

  /**
   * @description build a single command
   *
   * @param {{ [key: string]: any }} command
   * @param {types.IAeYargsOptionHandler} [optionHandler]
   * @returns {yargs.Argv}
   * @memberof YargsBuilder
   */
  public buildCommand (command: { [key: string]: any }, optionHandler?: types.IAeYargsOptionHandler)
  : yargs.Argv {
    const adaptedCommand = this.adapter!.adapt(command);
    return this.impl!.buildCommand(this.instance, adaptedCommand, optionHandler);
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
