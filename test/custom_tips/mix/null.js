const assert = require('power-assert');
const {schema: {empty}} = require('@qtk/schema');
const Validator = require('../../../index');
const globalConfig = {
    null: {
        enum: "自定义G:路径:{PATH} , 不在枚举值范围, 当前值:{VALUE},　期望:{EXPECTED}"
    },
}

describe('NULL() or empty()', function() {
    it('enumError', function() {
        let schema = empty().errorTip({
            enum: "自定义:路径:{PATH} , 不在枚举值范围, 当前值:{VALUE},　期望:{EXPECTED}"
        });
        let validator = Validator.from(schema, globalConfig);
        validator.validate(false);
        assert(/自定义:路径:\. , 不在枚举值范围, 当前值:false,　期望:null/.test(validator.errorsText), "enum错误提示有误");
    });
});