const assert = require('power-assert');
const {schema: {integer}} = require('@qtk/schema');
const Validator = require('../../index');

describe('integer', function() {
    it('integer()', function() {
        let schema = integer();
        let validator = Validator.from(schema);
        assert.equal(validator.validate(0)         ,true);
        assert.equal(validator.validate(1)         ,true);
        assert.equal(validator.validate(1.1)       ,false);
        assert.equal(validator.validate(Infinity)  ,false);
        assert.equal(validator.validate('1')       ,false);
        assert.equal(validator.validate(true)      ,false);
        assert.equal(validator.validate(null)      ,false);
        assert.equal(validator.validate(undefined) ,false);
        assert.equal(validator.validate({})        ,false);
        assert.equal(validator.validate([])        ,false);
    });
    it('.enum()', function() {
        let schema = integer().enum(1, 2);
        let validator = Validator.from(schema);
        assert.equal(validator.validate(1) ,true);
        assert.equal(validator.validate(2) ,true);
        assert.equal(validator.validate(3) ,false);
    });
    it('.min() & .max()', function() {
        let schema = integer().min(1).max(5);
        let validator = Validator.from(schema);
        assert.equal(validator.validate(1) ,true);
        assert.equal(validator.validate(2) ,true);
        assert.equal(validator.validate(5) ,true);
        assert.equal(validator.validate(0) ,false);
        assert.equal(validator.validate(6) ,false);
    });
    it('.exclusiveMin() & .exclusiveMax()', function() {
        let schema = integer().exclusiveMin(1).exclusiveMax(5);
        let validator = Validator.from(schema);
        assert.equal(validator.validate(2) ,true);
        assert.equal(validator.validate(4) ,true);
        assert.equal(validator.validate(1) ,false);
        assert.equal(validator.validate(6) ,false);
        assert.equal(validator.validate(0) ,false);
        assert.equal(validator.validate(6) ,false);
    });
});