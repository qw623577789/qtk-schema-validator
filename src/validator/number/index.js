const ValidatorError =  require('../../error');
const Type = require('../../module/type');

module.exports = (schema, value, path, globalErrorTipConfig, errorCollection) => {
    schema.errorTip = schema.errorTip || {};
    let errorTips = {
        type: schema.errorTip.type !== undefined ? schema.errorTip.type : globalErrorTipConfig.number.type,
        enum: schema.errorTip.enum !== undefined ? schema.errorTip.enum : globalErrorTipConfig.number.enum,
        range: schema.errorTip.range !== undefined ? schema.errorTip.range : globalErrorTipConfig.number.range
    }
    let type = Type.get(value);
    if(type !== "number" && type !== "integer") {
        errorCollection.push(new ValidatorError({
            errorOrText: errorTips.type, 
            path, 
            value, 
            actual: type, 
            expected: 'number', 
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

    let hasError = false;
    if (schema.maximum !== undefined && schema.maximum < value) {
        errorCollection.push(new ValidatorError({
            errorOrText: errorTips.range, 
            path, 
            value, 
            actual: value, 
            expected: `<= ${schema.maximum}`, 
            keyword: 'maximum'
        }));
        hasError = true;
    }
    if (schema.minimum !== undefined && schema.minimum > value) {
        errorCollection.push(new ValidatorError({
            errorOrText: errorTips.range, 
            path, 
            value, 
            actual: value, 
            expected: `>= ${schema.minimum}`, 
            keyword: 'minimum'
        }));
        hasError = true;
    }
    if (schema.exclusiveMaximum !== undefined && schema.exclusiveMaximum <= value) {
        errorCollection.push(new ValidatorError({
            errorOrText: errorTips.range, 
            path, 
            value, 
            actual: value, 
            expected: `< ${schema.exclusiveMaximum}`, 
            keyword: 'exclusiveMaximum'
        }));
        hasError = true;
    }
    if (schema.exclusiveMinimum !== undefined && schema.exclusiveMinimum >= value) {
        errorCollection.push(new ValidatorError({
            errorOrText: errorTips.range, 
            path, 
            value, 
            actual: value, 
            expected: `> ${schema.exclusiveMinimum}`, 
            keyword: 'exclusiveMinimum'
        }));
        hasError = true;
    }
    return !hasError;
};