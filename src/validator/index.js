const ValidatorError =  require('../error');

module.exports = (schema, instance, path, globalErrorTipConfig, errorCollection) => {
    const BooleanValidator = require('./boolean');
    const NumberValidator = require('./number');
    const IntegerValidator = require('./integer');
    const StringValidator = require('./string');
    const NullValidator = require('./null');
    const ObjectValidator = require('./object');
    const ArrayValidator = require('./array');
    const OneOfValidator = require('./one_of');

    let type = undefined;
    if (typeof schema === "boolean") {
        type = schema;
    }
    else {
        type = schema.type || 'oneOf';
    }

    switch(type) {
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
            break;
        case false:
            errorCollection.push(new ValidatorError({
                errorOrText: globalErrorTipConfig.schema, 
                path, 
                desc: '实际值不符合预期的情况'
            }));
            break;
        default:
            throw new Error(`no support schema type: ${type}`)
            break;
    }
}