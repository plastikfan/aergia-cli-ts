import { use } from 'chai';
import dirtyChai = require('dirty-chai');
use(dirtyChai);
import * as types from '../../lib/types';
import { YargsAdapter } from '../../lib/yargs/yargs-adapter.class';

const aeSchema: types.IAeYargsSchema = {
  labels: {
    commandNameId: 'name',
    commandOptions: 'Arguments',
    descendants: '_children',
    elements: '_',
    validationGroups: 'ArgumentGroups'
  },
  exclusions: {
    options: ['name', '_']
  }
};

describe('YargsAdapter', () => {
  let adapter: YargsAdapter;

  beforeEach(() => {
    adapter = new YargsAdapter(aeSchema);
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
