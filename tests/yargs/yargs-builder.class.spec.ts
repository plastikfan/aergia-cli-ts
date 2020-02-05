
import { use, expect } from 'chai';
import dirtyChai = require('dirty-chai');
use(dirtyChai);
import * as yargs from 'yargs';
import * as build from '../../lib/yargs/yargs-builder.class';
import * as types from '../../lib/types';

const aeSchema: types.IAeYargsSchema = {
  labels: {
    commandName: 'name',
    commandOptions: 'Arguments',
    descendants: '_children',
    elements: '_',
    validationGroups: 'ArgumentGroups'
  },
  exclusions: ['name', '_']
};

describe('yargs-composer', () => {
  let instance: yargs.Argv;

  beforeEach(() => {
    instance = require('yargs');
  });

  context('given: command with positional and non positional options', () => {
    it('should: build command', () => {
      const handler = (yin: yargs.Argv, optionName: string, optionDef: { [key: string]: any },
        positional: boolean,
        callback: types.IAeYargsOptionCallback): yargs.Argv => {
        return callback(yin, optionName, optionDef, positional);
      };

      const builder: build.YargsBuilder = new build.YargsBuilder(
        instance,
        aeSchema,
        handler
      );

      const command = {
        name: 'copy',
        describe: 'Copy file',
        positional: 'from to',
        _children: [
          {
            _: 'Arguments',
            _children: {
              from: {
                name: 'from',
                describe: 'source file location',
                _: 'Argument'
              },
              to: {
                name: 'to',
                describe: 'destination file location',
                _: 'Argument'
              },
              log: {
                name: 'log',
                alias: 'l',
                describe: 'log file',
                _: 'Argument'
              },
              owner: {
                name: 'owner',
                alias: 'o',
                describe: 'set owner to',
                _: 'Argument'
              }
            }
          },
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

      const yin = builder.buildCommand(command);
      const result = yin.parse(['copy', '~/source/front.jpg',
        '~/destination/front.jpg', '--log', '~/logs/fs.log', '-o', '$(whoami)']);

      expect(result.from).to.equal('~/source/front.jpg');

      expect(result.to).to.equal('~/destination/front.jpg');

      expect(result.l).to.equal('~/logs/fs.log');
      expect(result.log).to.equal('~/logs/fs.log');

      expect(result.o).to.equal('$(whoami)');
      expect(result.owner).to.equal('$(whoami)');
    });
  });
});
