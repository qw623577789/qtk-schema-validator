const assert = require('power-assert');
const {schema: {invalid}} = require('@qtk/schema');
const Validator = require('../../index');

describe('invalid', function() {
    it('schema', function() {
        let schema = invalid();
        let validator = Validator.from(schema);
        validator.validate(null);
        assert.equal('路径:. , schema有误, 实际值不符合预期的情况', validator.errorsText, "schema错误提示有误");
    });
});