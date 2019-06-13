const ValidatorError =  require('../error');
const BooleanValidator = require('./boolean');
const NumberValidator = require('./number');
const IntegerValidator = require('./integer');
const StringValidator = require('./string');
const NullValidator = require('./null');
const ObjectValidator = require('./object');
const ArrayValidator = require('./array');
const OneOfValidator = require('./one_of');

module.exports = (schema, instance, path, globalErrorTipConfig, errorCollection) => {
    switch(schema.__proto__ === Boolean.prototype ? schema : (schema.type || 'oneOf')) { //速度优化，放弃typeof
        case 'boolean':
            return BooleanValidator(schema, instance, path, globalErrorTipConfig, errorCollection);
        case 'integer':
            return IntegerValidator(schema, instance, path, globalErrorTipConfig, errorCollection);
        case 'string':
            return StringValidator(schema, instance, path, globalErrorTipConfig, errorCollection);
        case 'number':
            return NumberValidator(schema, instance, path, globalErrorTipConfig, errorCollection);
        case 'null':
            return NullValidator(schema, instance, path, globalErrorTipConfig, errorCollection);
        case 'object':
            return ObjectValidator(schema, instance, path, globalErrorTipConfig, errorCollection);
        case 'array':
            return ArrayValidator(schema, instance, path, globalErrorTipConfig, errorCollection);
        case 'oneOf':
            return OneOfValidator(schema, instance, path, globalErrorTipConfig, errorCollection);
        case true:
            return true;
        case false:
            errorCollection.push(new ValidatorError({
                errorOrText: globalErrorTipConfig.schema, 
                path, 
                desc: '实际值不符合预期的情况'
            }));
            return false;
        default:
            throw new Error(`no support schema type: ${schema.type}`)
            break;
    }
}