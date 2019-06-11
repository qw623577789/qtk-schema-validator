const assert = require('assert');
const QtkSchema = require('@qtk/schema');
const {object, string, integer, oneOf} = QtkSchema.schema;
const Validator = require('../../index');

describe('oneOf', function() {

    it('.oneOf()', function() {
        let schema = oneOf(
            object().properties({
                foo: string(),
                bar: integer(),
                foo1: object({
                    a: string(),
                    b: integer()
                })
            }),
            string()
        )

        let validator = Validator.from(schema);
        assert(validator.validate({foo: 'foo', foo1: {a: "1", b: 2}}) === true);
        assert(validator.validate("qqqqqq") === true);
        assert(validator.validate({foo: 'foo', bar: 'bar'})         === false);
    });
    
});