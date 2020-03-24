import * as yargs from 'yargs';
import * as xiberia from '../xiberia.local';
import { YargsBuilder } from './yargs-builder.class';

/**
 * @description Factory function for YargsBuilder, which hides away constructor
 * parameters that the client is not interested in (such as the internal impl
 * and the adapter).
 *
 * @export
 * @param {yargs.Argv} instance
 * @param {xiberia.IJsonConversionSchema} schema
 * @param {xiberia.IYargsBuildHandlers} [handlers]
 * @returns {YargsBuilder}
 */
export function construct (instance: yargs.Argv,
  schema: xiberia.IJsonConversionSchema,
  handlers?: xiberia.IYargsBuildHandlers): YargsBuilder {
  return new YargsBuilder(instance, schema, handlers);
}
