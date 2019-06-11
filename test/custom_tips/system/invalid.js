const assert = require('power-assert');
const {schema: {invalid}} = require('@qtk/schema');
const Validator = require('../../../index');
const globalConfig = {
    schema: "自定义:路径:{PATH} , schema有误, {DESC}",
}

describe('invalid', function() {
    it('schema', function() {
        let schema = invalid();
        let validator = Validator.from(schema, globalConfig);
        validator.validate(null);
        assert.equal('自定义:路径:. , schema有误, 实际值不符合预期的情况', validator.errorsText, "schema错误提示有误");
    });
});