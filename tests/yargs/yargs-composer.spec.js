
(function () {
  const chai = require('chai');
  chai.use(require('dirty-chai'));
  const expect = chai.expect;
  // const assert = chai.assert;
  const composer = require('../../yargs/yargs-composer');

  describe('yargs-composer', () => {
    context('given:', () => {
      it('should:', () => {
        composer.dummy();
        expect(1).to.equal(1);
      });
    });
  });
})();
