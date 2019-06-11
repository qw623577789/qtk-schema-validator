const assert = require('power-assert');
const {schema: {boolean}} = require('@qtk/schema');
const Validator = require('../../index');

describe('boolean', function() {
    it('boolean()', function() {
        let schema = boolean();
        let validator = Validator.from(schema);
        assert.equal(validator.validate(true), true);
        assert.equal(validator.validate(false), true);
        assert.equal(validator.validate('foo'), false);
        assert.equal(validator.validate(1.1), false);
        assert.equal(validator.validate(null), false);
        assert.equal(validator.validate(undefined), false);
        assert.equal(validator.validate({}), false);
        assert.equal(validator.validate([]), false);
    });
    it('.enum()', function() {
        let schema = boolean().enum(true);
        let validator = Validator.from(schema);
        assert.equal(true, validator.validate(true));
        assert.equal(false, validator.validate(false));
    });
});