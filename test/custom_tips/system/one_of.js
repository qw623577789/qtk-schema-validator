const assert = require('assert');
const QtkSchema = require('@qtk/schema');
const {object, string, integer, oneOf} = QtkSchema.schema;
const Validator = require('../../../index');
const globalConfig = {
    oneOf: {
        branchMatch: "自定义:路径:{PATH} , {DESC}, 匹配详情：\n{MATCH_DETAIL}",
    }
}

describe('oneOf', function() {

    it('branchMatchError | 实际值不符合任何一个oneOf情况', function() {
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

        let validator = Validator.from(schema, globalConfig);
        validator.validate({foo: 'foo', bar: 'bar'});
        assert.equal(
            `自定义:路径:. , 实际值不符合任何一个oneOf情况, 匹配详情：
            [
                "路径:.bar , 数据类型有误, 当前值:\\"bar\\", 当前类型:string, 期望类型:integer",
                "路径:. , 数据类型有误, 当前值:{\\"foo\\":\\"foo\\",\\"bar\\":\\"bar\\"}, 当前类型:object, 期望类型:string"
            ]`.replace(/\s/g, "")              
            ,validator.errorsText.replace(/\s/g, ""), "branchMatchError错误提示有误");

    });
    
    it('branchMatchError | 实际值不能同时符合多个oneOf情况', function() {
        let schema = oneOf(
            object().properties({
                foo: string(),
                bar: integer(),
                foo1: object({
                    a: string(),
                    b: integer()
                })
            }),
            object().properties({
                foo: string(),
                bar: integer(),
                foo2: object({
                    a: string(),
                    b: integer()
                })
            }),
        )

        let validator = Validator.from(schema, globalConfig);
        validator.validate({foo: 'foo', bar: 1});
        assert.equal(
            `自定义:路径:. , 实际值不能同时符合多个oneOf情况, 匹配详情：
            [
                {
                    "type": "object",
                    "properties": {
                        "foo": {
                            "type": "string",
                            "errorTip": {}
                        },
                        "bar": {
                            "type": "integer",
                            "errorTip": {}
                        },
                        "foo1": {
                            "type": "object",
                            "properties": {
                                "a": {
                                    "type": "string"
                                },
                                "b": {
                                    "type": "integer"
                                }
                            }
                        }
                    },
                    "errorTip": {}
                },
                {
                    "type": "object",
                    "properties": {
                        "foo": {
                            "type": "string",
                            "errorTip": {}
                        },
                        "bar": {
                            "type": "integer",
                            "errorTip": {}
                        },
                        "foo2": {
                            "type": "object",
                            "properties": {
                                "a": {
                                    "type": "string"
                                },
                                "b": {
                                    "type": "integer"
                                }
                            }
                        }
                    },
                    "errorTip": {}
                }
            ]`.replace(/\s/g, "")              
            ,validator.errorsText.replace(/\s/g, ""), "branchMatchError错误提示有误");

    });
});