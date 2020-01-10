
import { expect, use } from 'chai';
import dirtyChai = require('dirty-chai');
use(dirtyChai);
import * as composer from '../../lib/yargs/yargs-composer';
import { index } from '../../lib/index';

describe('yargs-composer', () => {
  context('given: ...', () => {
    it('should: dummy', () => {
      composer.dummy();
      expect(1).to.equal(1);
    });

    it('should: index', () => {
      index();
    });
  });
});
