const assert = require('power-assert');
const {schema: {string}} = require('@qtk/schema');
const Validator = require('../../../index');
const globalConfig = {
    string: {
        type: "自定义G:路径:{PATH} , 数据类型有误, 当前值:{VALUE}, 当前类型:{ACTUAL}, 期望类型:{EXPECTED}",
        enum: "自定义G:路径:{PATH} , 不在枚举值范围, 当前值:{VALUE},　期望:{EXPECTED}",
        length: "自定义G:路径:{PATH} , 字符串长度不在范围内, 当前值:{VALUE},　当前长度:{ACTUAL}, 期望长度:{EXPECTED}",
        pattern: "自定义G:路径:{PATH} , 字符串不符合正则, 当前值:{VALUE}, 期望正则:{EXPECTED}",
    },
}

describe('string', function() {
    it('typeError', function() {
        let schema = string().errorTip({
            type: "自定义:路径:{PATH} , 数据类型有误, 当前值:{VALUE}, 当前类型:{ACTUAL}, 期望类型:{EXPECTED}",
        });
        let validator = Validator.from(schema, globalConfig);
        validator.validate(1);
        assert(/自定义:路径:\. , 数据类型有误, 当前值:(.*), 当前类型:integer, 期望类型:string/.test(validator.errorsText), "type错误提示有误");
    });
    it('enumError', function() {
        let schema = string().enum("1", "2").errorTip({
            enum: "自定义:路径:{PATH} , 不在枚举值范围, 当前值:{VALUE},　期望:{EXPECTED}",
        });
        let validator = Validator.from(schema, globalConfig);
        validator.validate("3");
        assert(/自定义:路径:\. , 不在枚举值范围, 当前值:"3",　期望:"1"、"2"/.test(validator.errorsText), "enum错误提示有误");
    });
    it('lengthError | minLength', function() {
        let schema = string().minLength(5).errorTip({
            length: "自定义:路径:{PATH} , 字符串长度不在范围内, 当前值:{VALUE},　当前长度:{ACTUAL}, 期望长度:{EXPECTED}",
        });
        let validator = Validator.from(schema, globalConfig);
        validator.validate("1234");
        assert(/自定义:路径:\. , 字符串长度不在范围内, 当前值:"1234",　当前长度:4, 期望长度:>= 5/.test(validator.errorsText), "length错误提示有误");
    });
    it('lengthError | maxLength', function() {
        let schema = string().maxLength(5).errorTip({
            length: "自定义:路径:{PATH} , 字符串长度不在范围内, 当前值:{VALUE},　当前长度:{ACTUAL}, 期望长度:{EXPECTED}",
        });
        let validator = Validator.from(schema, globalConfig);
        validator.validate("123456");
        assert(/自定义:路径:\. , 字符串长度不在范围内, 当前值:"123456",　当前长度:6, 期望长度:<= 5/.test(validator.errorsText), "length错误提示有误");
    });
    it('patternError', function() {
        let schema = string().pattern(/^foo|bar$/).errorTip({
            pattern: "自定义:路径:{PATH} , 字符串不符合正则, 当前值:{VALUE}, 期望正则:{EXPECTED}",
        });
        let validator = Validator.from(schema, globalConfig);
        validator.validate("1");
        assert(/自定义:路径:\. , 字符串不符合正则, 当前值:"1", 期望正则:\^foo\|bar\$/.test(validator.errorsText), "pattern错误提示有误");
    });
});