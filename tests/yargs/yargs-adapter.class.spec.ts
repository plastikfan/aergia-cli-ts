import { use } from 'chai';
import * as xiberia from '../../lib/xiberia.local';
import { YargsAdapter } from '../../lib/yargs/yargs-adapter.class';
import dirtyChai = require('dirty-chai');
use(dirtyChai);

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

describe('YargsAdapter', () => {
  let adapter: YargsAdapter;

  beforeEach(() => {
    adapter = new YargsAdapter(conversionSchema);
  });

  context('given: command with missing descendants', () => {
    it('should: do nothing', () => {
      const command: { [key: string]: any } = {
        name: 'copy',
        describe: 'Copy file',
        positional: 'from to'
      };

      adapter.adapt(command);
    });
  });

  context('given: command with missing Arguments', () => {
    it('should: do nothing', () => {
      const command: { [key: string]: any } = {
        name: 'copy',
        describe: 'Copy file',
        positional: 'from to',
        _children: [
          {
            _: 'ArgumentGroups',
            _children: [
              {
                _: 'Implies',
                _children: [
                  { name: 'from', _: 'ArgumentRef' },
                  { name: 'to', _: 'ArgumentRef' }
                ]
              }
            ]
          }
        ]
      };
      adapter.adapt(command);
    });
  });
});
