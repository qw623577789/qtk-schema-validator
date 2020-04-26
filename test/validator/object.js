const assert = require('assert');
const QtkSchema = require('@qtk/schema');
const {object, string, integer} = QtkSchema.schema;
const Validator = require('../../index');

describe('object', function() {

    it('object()', function() {
        let schema = object({});
        let validator = Validator.from(schema);
        assert(validator.validate({})        === true);
        assert(validator.validate({foo: ''}) === true);
        assert(validator.validate(null)      === false);
        assert(validator.validate(undefined) === false);
        assert(validator.validate(false)     === false);
        assert(validator.validate(0)         === false);
        assert(validator.validate('1.1')     === false);
        assert(validator.validate([])        === false);
    });

    it('.properties()', function() {
        let schema = object().properties({
            foo: string(),
            bar: integer(),
            foo1: object({
                a: string(),
                b: integer()
            })
        });
        let validator = Validator.from(schema);
        assert(validator.validate({foo: 'foo', foo1: {a: "1", b: 2}})                     === true);
        assert(validator.validate({foo: 'foo', bar: 123})           === true);
        assert(validator.validate({foo: 'foo', bar: 123, tar: 123}) === true);
        assert(validator.validate({foo: 'foo', bar: 'bar'})         === false);
    });

    it('.require()', function() {
        let schema = object({
            foo: string()
        }).require('foo');
        let validator = Validator.from(schema);
        assert(validator.validate({foo: 'foo'}) === true);
        assert(validator.validate({}) === false);
        assert(validator.validate({bar: 'bar'}) === false);
    });
    
    it('.requireAll()', function() {
        let schema = object().properties({
            foo: string(),
            bar: integer()
        }).requireAll();
        let validator = Validator.from(schema);
        assert(validator.validate({foo: 'foo', bar: 123})           === true);
        assert(validator.validate({foo: 'foo'})                     === false);
        assert(validator.validate({bar: 'bar'})                     === false);
        assert(validator.validate({foo: 'foo', bar: 123, tar: 123}) === true);
        assert(validator.validate({foo: 'foo', bar: 'bar'})         === false);
    });

    it('.patternProperties()', function() {
        let schema = object().patternProperties({
            '^foo|bar$': string()
        });
        let validator = Validator.from(schema);
        assert(validator.validate({})                               === true);
        assert(validator.validate({foo: 'foo', bar: 'bar'})         === true);
        assert(validator.validate({foo: 'foo'})                     === true);
        assert(validator.validate({bar: 'bar'})                     === true);
        assert(validator.validate({foo: 'foo', bar: 123})           === false);
        assert(validator.validate({foo: 'foo', bar: 'bar', tar: 1}) === true);
    });

    it('.additionalProperties()', function() {
        let schema = object().properties({
            foo: string(),
            bar: string()
        }).additionalProperties(false);
        let validator = Validator.from(schema);
        assert(validator.validate({foo: 'foo', bar: 'bar', tar: 123}) === false);
        assert(validator.validate({foo: 'foo', bar: 'bar'})           === true);
    });

    describe('if statement', function() {
        it('.if.properties().then.properties()', function() {
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
            assert(validator.validate({type: 'student', grade: 12})              === true);
            assert(validator.validate({type: 'staff', salary: 12000})            === true);
            assert(validator.validate({type: 'staff', salary: '12000'})          === false);
            assert(validator.validate({type: 'student', grade: 12, major: 'cs'}) === true);
            assert(validator.validate({type: 'housewife', salary: 12000})        === false);
        });

        it('.if.properties().then.require()', function() {
            let schema = object().properties({
                type: string().enum('student', 'staff'),
                grade: integer(),
                salary: integer(),
            }).if.properties({type: 'student'}).then.require('type', 'grade')
              .elseIf.properties({type: 'staff'}).then.require('type', 'salary').else.invalid().endIf;
            let validator = Validator.from(schema);
            assert(validator.validate({type: 'student', grade: 12})              === true);
            assert(validator.validate({type: 'staff', salary: 12000})            === true);
            assert(validator.validate({type: 'staff', salary: '12000'})          === false);
            assert(validator.validate({type: 'student', grade: 12, major: 'cs'}) === true);
            assert(validator.validate({type: 'housewife', salary: 12000})        === false);
        });

        it('.if.properties().then.require().additionalProperties(false)', function() {
            let schema = object().properties({
                type: string().enum('student', 'staff'),
                grade: integer(),
                salary: integer(),
            })
                .if.properties({type: 'student'})
                .then.require('type', 'grade').additionalProperties(false)
                .elseIf.properties({type: 'staff'})
                .then.require('type', 'salary').additionalProperties(false)
                .else.invalid()
                .endIf;
            let validator = Validator.from(schema);

            assert(validator.validate({type: 'student', grade: 12, salary: 12000}) === true);
            assert(validator.validate({type: 'staff', salary: 12000, grade: 12}) === true);
            assert(validator.validate({type: 'student', grade: 12, major: 'cs'}) === false);
            assert(validator.validate({type: 'housewife', salary: 12000, major: 'cs'}) === false);
        });
    });
    
});