const assert = require('power-assert');
const {schema: {integer}} = require('@qtk/schema');
const Validator = require('../../../index');
const globalConfig = {
    integer: {
        type: "自定义:路径:{PATH} , 数据类型有误, 当前值:{VALUE}, 当前类型:{ACTUAL}, 期望类型:{EXPECTED}",
        enum: "自定义:路径:{PATH} , 不在枚举值范围, 当前值:{VALUE},　期望:{EXPECTED}",
        range: "自定义:路径:{PATH} , 不在值范围内, 当前值:{VALUE},　期望:{EXPECTED}",
    },
}

describe('integer', function() {
    it('typeError', function() {
        let schema = integer();
        let validator = Validator.from(schema, globalConfig);
        validator.validate('foo');
        assert(/自定义:路径:\. , 数据类型有误, 当前值:(.*), 当前类型:string, 期望类型:integer/.test(validator.errorsText), "type错误提示有误");
    });
    it('enumError', function() {
        let schema = integer().enum(1, 2, 3);
        let validator = Validator.from(schema, globalConfig);
        validator.validate(4);
        assert(/自定义:路径:\. , 不在枚举值范围, 当前值:4,　期望:1、2、3/.test(validator.errorsText), "enum错误提示有误");
    });
    it('rangeError | min', function() {
        let schema = integer().min(1);
        let validator = Validator.from(schema, globalConfig);
        validator.validate(0);
        assert(/自定义:路径:\. , 不在值范围内, 当前值:0,　期望:>= 1/.test(validator.errorsText), "range错误提示有误");
    });
    it('rangeError | max', function() {
        let schema = integer().max(0);
        let validator = Validator.from(schema, globalConfig);
        validator.validate(1);
        assert(/自定义:路径:\. , 不在值范围内, 当前值:1,　期望:<= 0/.test(validator.errorsText), "range错误提示有误");
    });
    it('rangeError | exclusiveMin', function() {
        let schema = integer().exclusiveMin(1);
        let validator = Validator.from(schema, globalConfig);
        validator.validate(1);
        assert(/自定义:路径:\. , 不在值范围内, 当前值:1,　期望:> 1/.test(validator.errorsText), "range错误提示有误");
    });
    it('rangeError | exclusiveMax', function() {
        let schema = integer().exclusiveMax(1);
        let validator = Validator.from(schema, globalConfig);
        validator.validate(1);
        assert(/自定义:路径:\. , 不在值范围内, 当前值:1,　期望:< 1/.test(validator.errorsText), "range错误提示有误");
    });
});