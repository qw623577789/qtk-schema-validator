const ValidatorError =  require('../../error');
const Type = require('../../module/type');

module.exports = (schema, value, path, globalErrorTipConfig, errorCollection) => {
    schema.errorTip = schema.errorTip || {};
    let errorTips = {
        type: schema.errorTip.type !== undefined ? schema.errorTip.type : globalErrorTipConfig.string.type,
        enum: schema.errorTip.enum !== undefined ? schema.errorTip.enum : globalErrorTipConfig.string.enum,
        length: schema.errorTip.length !== undefined ? schema.errorTip.length : globalErrorTipConfig.string.length,
        pattern: schema.errorTip.pattern !== undefined ? schema.errorTip.pattern : globalErrorTipConfig.string.pattern
    }
    let type = Type.get(value);
    if(type !== "string") {
        errorCollection.push(new ValidatorError({
            errorOrText: errorTips.type, 
            path, 
            value, 
            actual: type, 
            expected: 'string', 
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
            expected: schema.enum.map(_ => JSON.stringify(_)).join('、'), 
            keyword: 'enum'
        }));
        return false;
    }

    let hasError = false;
    if (schema.maxLength !== undefined && schema.maxLength < value.length) {
        errorCollection.push(new ValidatorError({
            errorOrText: errorTips.length, 
            path, 
            value, 
            actual: value.length, 
            expected: `<= ${schema.maxLength}`, 
            keyword: 'maxLength'
        }));
        hasError = true;
    }
    if (schema.minLength !== undefined && schema.minLength > value.length) {
        errorCollection.push(new ValidatorError({
            errorOrText: errorTips.length, 
            path, 
            value, 
            actual: value.length, 
            expected: `>= ${schema.minLength}`, 
            keyword: 'minLength'
        }));
        hasError = true;
    }
    if (schema.pattern !== undefined && !RegExp(schema.pattern).test(value)) {
        errorCollection.push(new ValidatorError({
            errorOrText: errorTips.pattern, 
            path, 
            value, 
            actual: value, 
            expected: schema.pattern, 
            keyword: 'pattern'
        }));
        hasError = true;
    }
    return !hasError;
};