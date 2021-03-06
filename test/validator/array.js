const assert = require('assert');
const QtkSchema = require('@qtk/schema');
const {object, string, integer, array} = QtkSchema.schema;
const Validator = require('../../index');

describe('array', function() {
    it('array()', function() {
        let schema = array();
        let validator = Validator.from(schema);
        assert(validator.validate([])        === true);
        assert(validator.validate([1, '2'])  === true);
        assert(validator.validate(null)      === false);
        assert(validator.validate(undefined) === false);
        assert(validator.validate(false)     === false);
        assert(validator.validate(0)         === false);
        assert(validator.validate('1.1')     === false);
        assert(validator.validate({})        === false);
    });
    it('.item()', function() {
        let schema = array().item(string());
        let validator = Validator.from(schema);
        assert(validator.validate([])         === true);
        assert(validator.validate(['1', '2']) === true);
        assert(validator.validate(['1', 2])   === false);

        schema = array(
            object().properties({
                foo: string(),
                bar: integer()
            }).requireAll()
        );
        assert(validator.validate([{foo: "1"}])         === false);
    });
    it('.minItems().maxItems()', function() {
        let schema = array().minItems(1).maxItems(3);
        let validator = Validator.from(schema);
        assert(validator.validate([1])          === true);
        assert(validator.validate([1, 2])       === true);
        assert(validator.validate([1, 2, 3])    === true);
        assert(validator.validate([])           === false);
        assert(validator.validate([1, 2, 3, 4]) === false);
    });
    it('.length()', function() {
        let schema = array().length(3);
        let validator = Validator.from(schema);
        assert(validator.validate([1, 2, 3])    === true);
        assert(validator.validate([1])          === false);
        assert(validator.validate([1, 2, 3, 4]) === false);
    });
});