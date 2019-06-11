const assert = require('power-assert');
const {schema: {string, object, integer}} = require('@qtk/schema');
const Validator = require('../../../index');
const globalConfig = {
    object: {
        type: "自定义G:路径:{PATH} , 数据类型有误, 当前值:{VALUE}, 当前类型:{ACTUAL}, 期望类型:{EXPECTED}",
        patternKey: "自定义G:路径:{PATH} , Object Key不符合正则，　当前Key:{ACTUAL}, 期望Key符合正则:{EXPECTED}",
        required: "自定义G:路径:{PATH} , Object缺少Key：{EXPECTED}",
        unexpectedKey: "自定义G:路径:{PATH} , Object出现非schema允许出现的Key:{ACTUAL}",
        branchMatch: "自定义G:路径:{PATH} , {DESC}, 匹配详情：\n{MATCH_DETAIL}",
    },
    schema: "自定义:路径:{PATH} , schema有误, {DESC}",
}

describe('object', function() {

    it('typeError', function() {
        let schema = object({}).errorTip({
            type: "自定义:路径:{PATH} , 数据类型有误, 当前值:{VALUE}, 当前类型:{ACTUAL}, 期望类型:{EXPECTED}",
        });
        let validator = Validator.from(schema, globalConfig);
        validator.validate(null);
        assert(/自定义:路径:\. , 数据类型有误, 当前值:(.*), 当前类型:null, 期望类型:object/.test(validator.errorsText), "type错误提示有误");
    });

    it('requiredError', function() {
        let schema = object({
            foo: string()
        }).require('foo').errorTip({
            required: "自定义:路径:{PATH} , Object缺少Key：{EXPECTED}",
        });
        let validator = Validator.from(schema, globalConfig);
        validator.validate({});
        assert(/自定义:路径:\. , Object缺少Key：foo/.test(validator.errorsText), "required错误提示有误");
    });
    
    it('requiredError | requireAll', function() {
        let schema = object().properties({
            foo: string(),
            bar: integer()
        }).requireAll().errorTip({
            required: "自定义:路径:{PATH} , Object缺少Key：{EXPECTED}",
        });
        let validator = Validator.from(schema, globalConfig);
        validator.validate({foo: 'foo'});
        assert(/自定义:路径:\. , Object缺少Key：bar/.test(validator.errorsText), "required错误提示有误");
    });

    it('unexpectedError', function() {
        let schema = object().properties({
            foo: string(),
            bar: string()
        }).additionalProperties(false).errorTip({
            unexpectedKey: "自定义:路径:{PATH} , Object出现非schema允许出现的Key:{ACTUAL}",
        });
        let validator = Validator.from(schema, globalConfig);
        validator.validate({foo: 'foo', bar: 'bar', tar: 123});
        assert(/自定义:路径:\. , Object出现非schema允许出现的Key:tar/.test(validator.errorsText), "unexpected错误提示有误");
    });

    it('patternKeyError', function() {
        let schema = object().patternProperties({
            '^(foo|bar)$': string()
        }).additionalProperties(false).errorTip({
            patternKey: "自定义:路径:{PATH} , Object Key不符合正则，　当前Key:{ACTUAL}, 期望Key符合正则:{EXPECTED}",
        });
        let validator = Validator.from(schema, globalConfig);
        validator.validate({foo: 'foo', bar1: '123'});
        assert(/自定义:路径:\. , Object Key不符合正则，　当前Key:bar1, 期望Key符合正则:\^\(foo\|bar\)\$/.test(validator.errorsText), "patternKey错误提示有误");
    });

    describe('branchMatchError', function() {
        it('第一种写法.if.properties().then.properties()', function() {
            let schema = object()
                .if.properties({type: string().enum('student')}) 
                .then.properties({
                    type: string().enum('student'),
                    grade: integer(),
                }).requireAll()
                .elseIf.properties({type: string().enum('staff')})
                .then.properties({
                    type: string().enum('staff'),
                    salary: integer(),
                }).requireAll()
                .else.invalid()
                .endIf
                .errorTip({
                    branchMatch: "自定义:路径:{PATH} , {DESC}, 匹配详情：\n{MATCH_DETAIL}",
                });
            let validator = Validator.from(schema, globalConfig);
            validator.validate({type: 'housewife', salary: 12000});
            assert.equal(
                `自定义:路径:. , 实际值不符合任何一个if条件, 匹配详情：
                [
                    "路径:.type , 不在枚举值范围, 当前值:\\"housewife\\",　期望:\\"student\\"",
                    "路径:.type , 不在枚举值范围, 当前值:\\"housewife\\",　期望:\\"staff\\""
                ]`.replace(/\s/g, "")              
                ,validator.errorsText.replace(/\s/g, ""), "branchMatchError错误提示有误");

            validator.validate({type: 'staff', salary: '12000'});
            assert.equal(
                `路径:.salary , 数据类型有误, 当前值:"12000", 当前类型:string, 期望类型:integer`,              
                validator.errorsText, 
                "branchMatchError错误提示有误(自动判断分支)"
            );
        });
    
        it('第二种写法.if.properties().then.require()', function() {
            let schema = object().properties({
                type: string().enum('student', 'staff'),
                grade: integer(),
                salary: integer(),
            })
                .if.properties({type: 'student'})
                .then.require('type', 'grade')
                .elseIf.properties({type: 'staff'})
                .then.require('type', 'salary')
                .else.invalid()
                .endIf
                .errorTip({
                    branchMatch: "自定义:路径:{PATH} , {DESC}, 匹配详情：\n{MATCH_DETAIL}",
                });
            let validator = Validator.from(schema, globalConfig);
            validator.validate({type: 'housewife', salary: 12000});
            assert.equal(
                `自定义:路径:. , 实际值不符合任何一个if条件, 匹配详情：
                [
                    "路径:.type , 不在枚举值范围, 当前值:\\"housewife\\",　期望:\\"student\\"",
                    "路径:.type , 不在枚举值范围, 当前值:\\"housewife\\",　期望:\\"staff\\""
                ]`.replace(/\s/g, "")              
                ,validator.errorsText.replace(/\s/g, ""), "branchMatchError错误提示有误");

            validator.validate({type: 'staff', salary: '12000'});
            assert.equal(
                `路径:.salary , 数据类型有误, 当前值:"12000", 当前类型:string, 期望类型:integer`,              
                validator.errorsText, 
                "branchMatchError错误提示有误(自动判断分支)"
            );
        });

        it('.if.properties().then.require()匹配多个if条件', function() {
            let schema = object().properties({
                type: string().enum('student', 'staff'),
                grade: integer(),
                salary: integer(),
            })
                .if.properties({type: 'student'})
                .then.require('type', 'grade')
                .elseIf.properties({type: 'student', 'salary': [111, 222]})
                .then.require('type', 'salary')
                .else.invalid()
                .endIf
                .errorTip({
                    branchMatch: "自定义:路径:{PATH} , {DESC}, 匹配详情：\n{MATCH_DETAIL}",
                });
            let validator = Validator.from(schema, globalConfig);
            validator.validate({type: 'student', 'salary': 111});
            assert.equal(
                `自定义:路径:. , 实际值不能同时符合多个if条件, 匹配详情：
                [
                    {
                        "type": {
                            "type": "string",
                            "enum": [
                                "student"
                            ],
                            "errorTip": {}
                        }
                    },
                    {
                        "type": {
                            "type": "string",
                            "enum": [
                                "student"
                            ],
                            "errorTip": {}
                        },
                        "salary": {
                            "type": "integer",
                            "enum": [
                                111,
                                222
                            ],
                            "errorTip": {}
                        }
                    }
                ]`.replace(/\s/g, "")              
                ,validator.errorsText.replace(/\s/g, ""), "branchMatchError错误提示有误");

        });
    });
    
});