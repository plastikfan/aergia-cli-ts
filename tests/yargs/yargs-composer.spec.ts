
import { expect, use } from 'chai';
import dirtyChai = require('dirty-chai');
use(dirtyChai);
import * as composer from '../../lib/yargs/yargs-composer';

describe('yargs-composer', () => {
  context('given:', () => {
    it('should:', () => {
      composer.dummy();
      expect(1).to.equal(1);
    });
  });
});
