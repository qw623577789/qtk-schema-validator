const assert = require('power-assert');
const {schema: {empty}} = require('@qtk/schema');
const Validator = require('../../index');

describe('NULL() or empty()', function() {
    it('enumError', function() {
        let schema = empty();
        let validator = Validator.from(schema);
        validator.validate(false);
        assert(/路径:\. , 不在枚举值范围, 当前值:false,　期望:null/.test(validator.errorsText), "enum错误提示有误");
    });
});