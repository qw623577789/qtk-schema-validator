const ValidatorError =  require('../../error');
const Type = require('../../module/type');

module.exports = (schema, value, path, globalErrorTipConfig, errorCollection) => {
    schema.errorTip = schema.errorTip || {};
    let errorTips = {
        type: schema.errorTip.type !== undefined ? schema.errorTip.type : globalErrorTipConfig.boolean.type,
        enum: schema.errorTip.enum !== undefined ? schema.errorTip.enum : globalErrorTipConfig.boolean.enum
    }
    let type = Type.get(value);
    if(type !== "boolean") {
        errorCollection.push(new ValidatorError({
            errorOrText: errorTips.type, 
            path, 
            value, 
            actual: type, 
            expected: 'boolean', 
            keyword: 'type'
        }));
        return false;
    }
    if(schema.enum !== undefined && !schema.enum.includes(value)) {
        errorCollection.push(new ValidatorError({
            errorOrText: errorTips.enum, 
            path, 
            value, 
            actual: value, 
            expected: schema.enum.join('、'), 
            keyword: 'enum'
        }));
        return false;
    }
    return true;
};