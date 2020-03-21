
import * as yargs from 'yargs';
import { expect } from 'chai';
import * as xiberia from '../../lib/xiberia.local';
import * as factory from '../../lib/yargs/yargs-builder-factory';
import * as index from '../../lib/index';

const conversionSchema: xiberia.IJsonConversionSchema = {
  labels: {
    commandNameId: 'name',
    commandOptions: 'Arguments',
    descendants: '_children',
    elements: '_',
    validationGroups: 'ArgumentGroups'
  },
  paths: {
    collective: 'commands'
  },
  exclusions: {
    options: ['name', '_']
  }
};

function memberOptionHandler (yin: yargs.Argv, optionName: string, optionDef: { [key: string]: any },
  positional: boolean)
  : yargs.Argv {
  return positional
    ? yin.positional(optionName, optionDef)
    : yin.option(optionName, optionDef);
}

describe('YargsBuilder factory', () => {
  context('given: factory invoked without handlers', () => {
    it('should: construct instance', () => {
      const builder: index.YargsBuilder = factory.construct(require('yargs'), conversionSchema);
      expect(builder).to.not.be.undefined();
    });
  });

  context('given: factory invoked with handlers', () => {
    it('should: construct instance', () => {
      const builder: index.YargsBuilder = factory.construct(require('yargs'), conversionSchema, {
        onOption: memberOptionHandler
      });
      expect(builder).to.not.be.undefined();
    });
  });
});
