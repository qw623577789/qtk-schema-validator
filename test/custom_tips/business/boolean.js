const assert = require('power-assert');
const {schema: {boolean}} = require('@qtk/schema');
const Validator = require('../../../index');

describe('boolean', function() {
    it('typeError', function() {
        let schema = boolean().errorTip({
            type: "自定义:路径:{PATH} , 数据类型有误, 当前值:{VALUE}, 当前类型:{ACTUAL}, 期望类型:{EXPECTED}",
        });
        let validator = Validator.from(schema);
        validator.validate('foo');
        assert(/自定义:路径:\. , 数据类型有误, 当前值:(.*), 当前类型:string, 期望类型:boolean/.test(validator.errorsText), "type错误提示有误");
    });
    it('enumError', function() {
        let schema = boolean().enum(true).errorTip({
            enum: "自定义:路径:{PATH} , 不在枚举值范围, 当前值:{VALUE},　期望:{EXPECTED}"
        });
        let validator = Validator.from(schema);
        validator.validate(false);
        assert(/自定义:路径:\. , 不在枚举值范围, 当前值:false,　期望:true/.test(validator.errorsText), "enum错误提示有误");
    });
});