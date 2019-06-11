const assert = require('power-assert');
const {schema: {string}} = require('@qtk/schema');
const Validator = require('../../index');

describe('string', function() {
    it('string()', function() {
        let schema = string();
        let validator = Validator.from(schema);
        assert.equal(validator.validate('')        ,true);
        assert.equal(validator.validate('1234')    ,true);
        assert.equal(validator.validate(1)         ,false);
        assert.equal(validator.validate(1.1)       ,false);
        assert.equal(validator.validate(true)      ,false);
        assert.equal(validator.validate(null)      ,false);
        assert.equal(validator.validate(undefined) ,false);
        assert.equal(validator.validate({})        ,false);
        assert.equal(validator.validate([])        ,false);
    });
    it('.pattern()', function() {
        let schema = string().pattern(/^foo|bar$/);
        let validator = Validator.from(schema);
        assert.equal(validator.validate('foo') ,true);
        assert.equal(validator.validate('bar') ,true);
        assert.equal(validator.validate('oof') ,false);
    });
    it('.enum()', function() {
        let schema = string().enum('foo', 'bar');
        let validator = Validator.from(schema);
        assert.equal(validator.validate('foo') ,true);
        assert.equal(validator.validate('bar') ,true);
        assert.equal(validator.validate('oof') ,false);
    });
    it('.minLength() & maxLength()', function() {
        let schema = string().minLength(1).maxLength(5);
        let validator = Validator.from(schema);
        assert.equal(validator.validate('1')      ,true);
        assert.equal(validator.validate('123')    ,true);
        assert.equal(validator.validate('12345')  ,true);
        assert.equal(validator.validate('')       ,false);
        assert.equal(validator.validate('123456') ,false);
    });
    it('.length()', function() {
        let schema = string().length(5);
        let validator = Validator.from(schema);
        assert.equal(validator.validate('hello')  ,true);
        assert.equal(validator.validate('hi')     ,false);
        assert.equal(validator.validate('')       ,false);
        assert.equal(validator.validate('hello ') ,false);
    });
});