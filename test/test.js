const assert = require('assert');
const QtkSchema = require('@qtk/schema');
const {object, string, integer} = QtkSchema.schema;
const Validator = require('../');

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

        let validator = Validator.from(schema);
        validator.validate({type: 'staff', salary: '12000', grade: '12000'});
        console.log(validator.errorsText);
    });
});