const assert = require('assert');
const QtkSchema = require('@qtk/schema');
const {object, string, integer, array} = QtkSchema.schema;
const Validator = require('../../../index');

describe('array', function() {
    it('typeError', function() {
        let schema = array().errorTip({
            type: "自定义:路径:{PATH} , 数据类型有误, 当前值:{VALUE}, 当前类型:{ACTUAL}, 期望类型:{EXPECTED}",
        });
        let validator = Validator.from(schema);
        validator.validate(null);
        assert(/自定义:路径:\. , 数据类型有误, 当前值:(.*), 当前类型:null, 期望类型:array/.test(validator.errorsText), "type错误提示有误");
    });
    it('item错误', function() {
        let schema = array().item(
            string().errorTip({
                type: '自定义:路径:{PATH} , 数据类型有误, 当前值:{VALUE}, 当前类型:{ACTUAL}, 期望类型:{EXPECTED}'
            })
        );
        let validator = Validator.from(schema);
        validator.validate(['1', 2]);
        assert.equal('自定义:路径:.[1] , 数据类型有误, 当前值:2, 当前类型:integer, 期望类型:string', validator.errorsText, "item错误提示有误");
    });
    it('lengthError | minItems', function() {
        let schema = array().minItems(1).errorTip({
            length: "自定义:路径:{PATH} , 数组长度不在范围内,　当前长度:{ACTUAL}, 期望长度:{EXPECTED}",
        });
        let validator = Validator.from(schema);
        validator.validate([]);
        assert(/自定义:路径:\. , 数组长度不在范围内,　当前长度:0, 期望长度:>= 1/.test(validator.errorsText), "length错误提示有误");
    });
    it('lengthError | maxItems', function() {
        let schema = array().maxItems(3).errorTip({
            length: "自定义:路径:{PATH} , 数组长度不在范围内,　当前长度:{ACTUAL}, 期望长度:{EXPECTED}",
        });
        let validator = Validator.from(schema);
        validator.validate([1, 2, 3, 4]);
        assert(/自定义:路径:\. , 数组长度不在范围内,　当前长度:4, 期望长度:<= 3/.test(validator.errorsText), "length错误提示有误");
    });
    it('lengthError | length', function() {
        let schema = array().length(3).errorTip({
            length: "自定义:路径:{PATH} , 数组长度不在范围内,　当前长度:{ACTUAL}, 期望长度:{EXPECTED}",
        });
        let validator = Validator.from(schema);
        validator.validate([1]);
        assert(/自定义:路径:\. , 数组长度不在范围内,　当前长度:1, 期望长度:= 3/.test(validator.errorsText), "length错误提示有误");
    });
});