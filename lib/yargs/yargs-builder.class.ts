import * as yargs from 'yargs';
import * as types from '../types';
import { YargsAdapter } from './yargs-adapter.class';
import { YargsBuilderImpl, defaultFailHandler, defaultHandlers } from './yargs-builder.impl';

export class YargsBuilder {

  constructor (private instance: yargs.Argv,
    private schema: types.IAeYargsSchema,
    private handlers: types.IAeYargsBuildHandlers | null = defaultHandlers,
    private handler: types.IAeYargsOptionHandler | null = null,
    private adapter: types.IYargsAdapter = new YargsAdapter(schema),
    private impl: YargsBuilderImpl = new YargsBuilderImpl(schema, handler, handlers ?? defaultHandlers),
    private fail: types.IFailHandler = defaultFailHandler) { }

  /**
   * @description build a single command
   *
   * @param {{ [key: string]: any }} command
   * @returns {yargs.Argv}
   * @memberof YargsBuilder
   */
  public buildCommand (command: { [key: string]: any }): yargs.Argv {
    const adaptedCommand = this.adapter.adapt(command);
    return this.impl.buildCommand(this.instance, adaptedCommand, this.fail);
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
