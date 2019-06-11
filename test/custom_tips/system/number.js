const assert = require('power-assert');
const {schema: {number}} = require('@qtk/schema');
const Validator = require('../../../index');
const globalConfig = {
    number: {
        type: "自定义:路径:{PATH} , 数据类型有误, 当前值:{VALUE}, 当前类型:{ACTUAL}, 期望类型:{EXPECTED}",
        enum: "自定义:路径:{PATH} , 不在枚举值范围, 当前值:{VALUE},　期望:{EXPECTED}",
        range: "自定义:路径:{PATH} , 不在值范围内, 当前值:{VALUE},　期望:{EXPECTED}",
    },
}

describe('number', function() {
    it('typeError', function() {
        let schema = number();
        let validator = Validator.from(schema, globalConfig);
        validator.validate('foo');
        assert(/自定义:路径:\. , 数据类型有误, 当前值:(.*), 当前类型:string, 期望类型:number/.test(validator.errorsText), "type错误提示有误");
    });
    it('enumError', function() {
        let schema = number().enum(1, 2, 3.3);
        let validator = Validator.from(schema, globalConfig);
        validator.validate(4);
        assert(/自定义:路径:\. , 不在枚举值范围, 当前值:4,　期望:1、2、3.3/.test(validator.errorsText), "enum错误提示有误");
    });
    it('rangeError | min', function() {
        let schema = number().min(0.9);
        let validator = Validator.from(schema, globalConfig);
        validator.validate(0);
        assert(/自定义:路径:\. , 不在值范围内, 当前值:0,　期望:>= 0\.9/.test(validator.errorsText), "range错误提示有误");
    });
    it('rangeError | max', function() {
        let schema = number().max(0.9);
        let validator = Validator.from(schema, globalConfig);
        validator.validate(1);
        assert(/自定义:路径:\. , 不在值范围内, 当前值:1,　期望:<= 0\.9/.test(validator.errorsText), "range错误提示有误");
    });
    it('rangeError | exclusiveMin', function() {
        let schema = number().exclusiveMin(0.9);
        let validator = Validator.from(schema, globalConfig);
        validator.validate(0.9);
        assert(/自定义:路径:\. , 不在值范围内, 当前值:0\.9,　期望:> 0\.9/.test(validator.errorsText), "range错误提示有误");
    });
    it('rangeError | exclusiveMax', function() {
        let schema = number().exclusiveMax(0.9);
        let validator = Validator.from(schema, globalConfig);
        validator.validate(0.9);
        assert(/自定义:路径:\. , 不在值范围内, 当前值:0\.9,　期望:< 0\.9/.test(validator.errorsText), "range错误提示有误");
    });
});