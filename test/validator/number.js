const assert = require('power-assert');
const {schema: {number}} = require('@qtk/schema');
const Validator = require('../../index');

describe('number', function() {
    it('number()', function() {
        let schema = number();
        let validator = Validator.from(schema);
        assert.equal(validator.validate(0)         ,true);
        assert.equal(validator.validate(1)         ,true);
        assert.equal(validator.validate(1.1)       ,true);
        assert.equal(validator.validate(-1.1)      ,true);
        assert.equal(validator.validate(Infinity)  ,true);
        assert.equal(validator.validate('1.1')     ,false);
        assert.equal(validator.validate(true)      ,false);
        assert.equal(validator.validate(null)      ,false);
        assert.equal(validator.validate(undefined) ,false);
        assert.equal(validator.validate({})        ,false);
        assert.equal(validator.validate([])        ,false);
    });
    it('.enum()', function() {
        let schema = number().enum(1, 2, 3.3);
        let validator = Validator.from(schema);
        assert.equal(validator.validate(1)   ,true);
        assert.equal(validator.validate(3.3) ,true);
        assert.equal(validator.validate(4)   ,false);
    });
    it('.min() & .max()', function() {
        let schema = number().min(0.9).max(3.1);
        let validator = Validator.from(schema);
        assert.equal(validator.validate(0.9) ,true);
        assert.equal(validator.validate(2.2) ,true);
        assert.equal(validator.validate(3.1) ,true);
        assert.equal(validator.validate(0)   ,false);
        assert.equal(validator.validate(4)   ,false);
    });
    it('.exclusiveMin() & .exclusiveMax()', function() {
        let schema = number().exclusiveMin(0.9).exclusiveMax(3.1);
        let validator = Validator.from(schema);
        assert.equal(validator.validate(2.2) ,true);
        assert.equal(validator.validate(0)   ,false);
        assert.equal(validator.validate(0.9) ,false);
        assert.equal(validator.validate(3.1) ,false);
        assert.equal(validator.validate(4)   ,false);
    });
});