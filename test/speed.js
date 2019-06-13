const assert = require('assert');
const QtkSchema = require('@qtk/schema');
const {object, string, integer} = QtkSchema.schema;


describe('object', function() {
    it('.if.properties().then.require()', function() {
        let schema = object().properties({
            type: string(),
            grade: integer(),
            salary: integer()
                .errorTip({
                    type: "大王不好啦～　路径:{PATH} , 数据类型有误,　当前的数据类型为{ACTUAL}, 期望的类型为{EXPECTED}"
                }),
        })
            .requireAll()
            .additionalProperties(true)

        let data = {type: 'staff', salary: '12000', grade: '12000'};

        // let schema = string();
        // let data = '12000';        
        let times =  10000;

        let QtkValidator = require('..');
        var validator = QtkValidator.from(schema);
        validator.validate(data);
        console.time("qtk");
        for (let t = 0; t < times; t++) {
            var validator = QtkValidator.from(schema);
            validator.validate(data);
        }
        console.timeEnd("qtk");

        let AjvValidator = QtkSchema.validator;
        // schema = AjvValidator.from(schema).jsonSchema;
        // const Ajv = require('ajv');
        // var ajv = new Ajv();
        
        console.time("ajv");
        for (let t = 0; t < times; t++) {
            // ajv.compile(schema)(data);
            AjvValidator.from(schema).validate(data)
        }
        console.timeEnd("ajv");
    });
});