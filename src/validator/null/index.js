const ValidatorError =  require('../../error');

module.exports = (schema, value, path, globalErrorTipConfig, errorCollection) => {
    schema.errorTip = schema.errorTip || {};
    let errorTips = {
        enum: schema.errorTip.enum !== undefined ? schema.errorTip.enum : globalErrorTipConfig.null.enum
    }
    if(value !== null) {
        errorCollection.push(new ValidatorError({
            errorOrText: errorTips.enum, 
            path, 
            value, 
            actual: value, 
            expected: null, 
            keyword: 'enum'
        }));
        return false;
    }
    return true;
};