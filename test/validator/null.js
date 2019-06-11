const assert = require('power-assert');
const {schema: {empty}} = require('@qtk/schema');
const Validator = require('../../index');

describe('null', function() {
    it('NULL() or empty()', function() {
        let schema = empty();
        let validator = Validator.from(schema);
        assert.equal(validator.validate(null)      ,true);
        assert.equal(validator.validate(undefined) ,false);
        assert.equal(validator.validate(false)     ,false);
        assert.equal(validator.validate(0)         ,false);
        assert.equal(validator.validate('1.1')     ,false);
        assert.equal(validator.validate({})        ,false);
        assert.equal(validator.validate([])        ,false);
    });
});