const assert = require('power-assert');
const {schema: {string, object, integer}} = require('@qtk/schema');
const Validator = require('../../index');

describe('object', function() {

    it('typeError', function() {
        let schema = object({});
        let validator = Validator.from(schema);
        validator.validate(null);
        assert(/路径:\. , 数据类型有误, 当前值:(.*), 当前类型:null, 期望类型:object/.test(validator.errorsText), "type错误提示有误");
    });

    it('requiredError', function() {
        let schema = object({
            foo: string()
        }).require('foo');
        let validator = Validator.from(schema);
        validator.validate({});
        assert(/路径:\. , Object缺少Key：foo/.test(validator.errorsText), "required错误提示有误");
    });
    
    it('requiredError | requireAll', function() {
        let schema = object().properties({
            foo: string(),
            bar: integer()
        }).requireAll();
        let validator = Validator.from(schema);
        validator.validate({foo: 'foo'});
        assert(/路径:\. , Object缺少Key：bar/.test(validator.errorsText), "required错误提示有误");
    });

    it('unexpectedError', function() {
        let schema = object().properties({
            foo: string(),
            bar: string()
        }).additionalProperties(false);
        let validator = Validator.from(schema);
        validator.validate({foo: 'foo', bar: 'bar', tar: 123});
        assert(/路径:\. , Object出现非schema允许出现的Key:tar/.test(validator.errorsText), "unexpected错误提示有误");
    });

    it('patternKeyError', function() {
        let schema = object().patternProperties({
            '^(foo|bar)$': string()
        }).additionalProperties(false);
        let validator = Validator.from(schema);
        validator.validate({foo: 'foo', bar1: '123'});
        assert(/路径:\. , Object Key不符合正则，　当前Key:bar1, 期望Key符合正则:\^\(foo\|bar\)\$/.test(validator.errorsText), "patternKey错误提示有误");
    });

    it('多个.patternProperties', function() {
        let schema = object().patternProperties({
            '^[foo|bar]$': string(),
            '^[bar1]$': string()
        });
        let validator = Validator.from(schema);
        validator.validate({foo: 'foo', bar: 123});
        assert.equal('路径:. , schema有误, 不支持patternProperties有多个key正则', validator.errorsText, "patternKey错误提示有误");
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
                .endIf;
            let validator = Validator.from(schema);
            validator.validate({type: 'housewife', salary: 12000});
            assert.equal(
                `路径:. , 实际值不符合任何一个if条件, 匹配详情：
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
                .endIf;
            let validator = Validator.from(schema);
            validator.validate({type: 'housewife', salary: 12000});
            assert.equal(
                `路径:. , 实际值不符合任何一个if条件, 匹配详情：
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

    });
    
});